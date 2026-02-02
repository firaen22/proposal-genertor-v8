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
        await chromium.font('https://raw.githubusercontent.com/google/fonts/main/ofl/notosanstc/NotoSansTC-Bold.ttf');

        // Launch Browser
        const browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
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
        return new Response(pdf, {
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
