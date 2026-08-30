import * as pdfjsLib from 'pdfjs-dist';

// @ts-ignore
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Use local worker URL to bypass Web Worker CORS restrictions
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export async function extractTextFromPDF(file: File, onProgress?: (msg: string) => void): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(' ') + '\n';
    }
    
    text = text.trim();
    
    // Fallback to OCR if the PDF contains vector paths/images instead of standard text
    if (!text || text.length < 50) {
      if (onProgress) onProgress("Standard text extraction failed. Initializing visual OCR scanner...");
      
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      
      let ocrText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        if (onProgress) onProgress(`Scanning page ${i} of ${pdf.numPages}...`);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High resolution for better OCR
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: context, viewport }).promise;
        
        const ret = await worker.recognize(canvas);
        ocrText += ret.data.text + '\n';
      }
      
      await worker.terminate();
      
      text = ocrText.trim();
      
      if (!text || text.length < 50) {
        throw new Error("OCR Scanning failed to find readable text. The document might be too blurry or protected.");
      }
    }
    
    return text;
  } catch (error: any) {
    console.error("Error parsing PDF:", error);
    throw new Error(error.message || "Failed to extract text from PDF. Please ensure the file is a valid PDF and not password protected.");
  }
}
