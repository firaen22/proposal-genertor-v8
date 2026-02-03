import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

// Force Node.js runtime for Puppeteer
export const config = {
    runtime: 'nodejs',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { html } = await req.json();

        if (!html) {
            return new Response('Missing html content', { status: 400 });
        }

        // Configure font loading
        // Removed chromium.font() as it is not available in this version.
        // We rely on the <link> tag in the HTML for fonts.

        // Launch Browser
        const browser = await puppeteer.launch({
            args: [
                ...chromium.args,
                "--hide-scrollbars",
                "--disable-web-security",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ],
            defaultViewport: chromium.defaultViewport || { width: 1920, height: 1080 },
            executablePath: await chromium.executablePath(),
            headless: chromium.headless || true,
        });

        const page = await browser.newPage();

        // Set content
        // We wrap the content in a basic structure to ensure fonts and clean print
        await page.setContent(html, {
            waitUntil: 'networkidle0', // Wait for external resources (fonts, images)
        });

        // Generate PDF
        const pdf = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: {
                top: '0mm',
                right: '0mm',
                bottom: '0mm',
                left: '0mm',
            },
        });

        await browser.close();

        // Return PDF
        // Cast pdf to any or Buffer to satisfy Response type if needed
        return new Response(pdf as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="proposal.pdf"',
            },
        });

    } catch (error: any) {
        console.error('PDF Generation Error:', error);
        return new Response(`Failed to generate PDF: ${error.message}`, { status: 500 });
    }
}
