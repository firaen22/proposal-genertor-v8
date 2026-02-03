import { useCallback, useState } from 'react';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

interface UsePDFReportOptions {
    filename?: string;
    pdfTitle?: string;
}

export const usePDFReport = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = useCallback(async (element: HTMLElement, options: UsePDFReportOptions = {}) => {
        if (!element) return;

        try {
            setIsGenerating(true);

            // 1. Wait for fonts to load
            await document.fonts.ready;
            // Additional delay to ensure layout is stable
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 2. Clone the element to ensure a clean capture environment (bypassing scroll/transform issues)
            const clone = element.cloneNode(true) as HTMLElement;

            // Setup clone styles to be fixed at top-left, but invisible to user
            clone.style.position = 'fixed';
            clone.style.top = '0';
            clone.style.left = '0';
            clone.style.width = '297mm'; // Force A4 width
            clone.style.margin = '0';
            clone.style.zIndex = '-9999'; // Hide behind everything
            clone.style.transform = 'none'; // Ensure no transforms are active

            document.body.appendChild(clone);

            // Give the clone a moment to render images/fonts in the new context
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Initialize PDF (A4 Landscape)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            try {
                const pages = clone.querySelectorAll('.pdf-page');
                if (!pages.length) {
                    console.warn('No .pdf-page elements found in clone');
                    return;
                }

                const pageWidth = 297;
                const pageHeight = 210;

                for (let i = 0; i < pages.length; i++) {
                    const page = pages[i] as HTMLElement;

                    // 3. Capture with html-to-image
                    const imgData = await toPng(page, {
                        quality: 0.95,
                        pixelRatio: 2,
                        backgroundColor: '#ffffff',
                        width: 1122, // 297mm @ 96dpi approx
                        style: {
                            fontVariantLigatures: 'none',
                            WebkitFontSmoothing: 'antialiased'
                        } as any
                    });

                    if (i > 0) doc.addPage();
                    doc.addImage(imgData, 'PNG', 0, 0, pageWidth, pageHeight);
                }
            } finally {
                // 4. Cleanup
                document.body.removeChild(clone);
            }

            // Save the PDF
            doc.save(options.filename || 'report.pdf');

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    }, []);

    return {
        generatePDF,
        isGenerating
    };
};
