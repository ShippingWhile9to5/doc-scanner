import { PDFDocument } from 'pdf-lib';

/**
 * Advanced PDF compression using render-and-recompress strategy.
 * Renders PDF pages to canvas, then rebuilds with compressed JPEGs.
 * 
 * @param pdfBuffer - Original PDF as ArrayBuffer
 * @param quality - JPEG quality (0-100). Lower = smaller file, lower quality.
 * @returns Compressed PDF as Uint8Array
 */
export async function compressPdfAdvanced(
    pdfBuffer: ArrayBuffer,
    quality: number
): Promise<Uint8Array> {
    // Dynamic import to avoid SSR issues (PDF.js requires browser APIs)
    const pdfjsLib = await import('pdfjs-dist');

    // Configure PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    // Load PDF with PDF.js
    const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
    const pdf = await loadingTask.promise;

    // Create new PDF document
    const newPdf = await PDFDocument.create();

    // Process each page
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Use scale based on quality setting for better results
        // Higher quality = higher scale = larger canvas = better detail
        const scale = quality > 70 ? 2.0 : quality > 50 ? 1.5 : 1.2;
        const viewport = page.getViewport({ scale });

        // Render to canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render page to canvas
        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
        }).promise;

        // Convert to JPEG with specified quality
        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        const jpegBytes = await fetch(jpegDataUrl).then(r => r.arrayBuffer());

        // Embed in new PDF (convert viewport dimensions from pixels to points)
        const img = await newPdf.embedJpg(jpegBytes);
        const pdfPage = newPdf.addPage([viewport.width * 0.75, viewport.height * 0.75]);

        // Draw image to fill entire page
        pdfPage.drawImage(img, {
            x: 0,
            y: 0,
            width: viewport.width * 0.75,
            height: viewport.height * 0.75
        });
    }

    // Save with compression
    return await newPdf.save({
        useObjectStreams: true,
        addDefaultPage: false
    });
}

/**
 * Basic PDF compression (metadata removal only).
 * Used as fallback or for text-only PDFs.
 */
export async function compressPdfBasic(pdfBuffer: ArrayBuffer): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // Remove metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    // Save with object stream compression
    return await pdfDoc.save({ useObjectStreams: true });
}
