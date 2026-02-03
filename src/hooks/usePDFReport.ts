import { useCallback, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

            const pages = element.querySelectorAll('.pdf-page');
            if (!pages.length) {
                console.warn('No .pdf-page elements found');
                return;
            }

            // Initialize PDF (A4 Landscape)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
            });

            const pageWidth = 297;
            const pageHeight = 210;

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i] as HTMLElement;

                // 2. Capture with html2canvas
                // scaling: 2 for retina/high-res, but checking if 3 is better or worse for alignment
                // 'letterRendering: true' can sometimes fix character spacing issues
                const canvas = await html2canvas(page, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    letterRendering: 1, // Fixes some kerning issues
                    onclone: (clonedDoc) => {
                        const clonedElement = clonedDoc.body.querySelector('.pdf-page') as HTMLElement;
                        if (clonedElement) {
                            // Ensure specific styles for print accuracy
                            clonedElement.style.fontVariantLigatures = 'none';
                            (clonedElement.style as any).webkitFontSmoothing = 'antialiased';
                        }
                    }
                } as any);


                const imgData = canvas.toDataURL('image/jpeg', 1.0);

                if (i > 0) doc.addPage();

                // Add image to PDF
                // Using 'FAST' compression if size is an issue, but default is usually fine for checks
                doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
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
