import { PDFDocument } from 'pdf-lib';

/**
 * Basic PDF compression utility.
 * Focuses on metadata removal and optimized stream saving.
 * In a professional environment, this would also resample images inside the PDF.
 */
export async function compressPdf(pdfBuffer: ArrayBuffer, quality: number): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    // 1. Remove unnecessary metadata
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    // 2. Optimized Save
    // useObjectStreams: combines objects into larger streams for better compression
    // addDefaultPage: false (we already have pages)
    return await pdfDoc.save({ useObjectStreams: true });
}
