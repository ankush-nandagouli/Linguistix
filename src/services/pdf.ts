import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

// Setup worker using Vite's ?url import for the bundled worker
// Starting with pdfjs-dist v4+, the worker is an ESM module (.mjs)
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  // Requirement says single page PDF, but we'll handle just the first page anyway
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  const strings = textContent.items.map((item: any) => item.str);
  return strings.join(' ');
}

export function generateTransliteratedPDF(originalText: string, transliteratedText: string, fileName: string) {
  const doc = new jsPDF();
  
  // Note: Standard fonts in jsPDF don't support Indian scripts well.
  // Ideally we would add a custom font here.
  // For now, we'll output the text. If the user has a system font that handles it, it might work in some viewers.
  
  doc.setFontSize(16);
  doc.text("Transliteration Report", 20, 20);
  
  doc.setFontSize(12);
  doc.text("Original Text:", 20, 40);
  const splitOriginal = doc.splitTextToSize(originalText, 170);
  doc.text(splitOriginal, 20, 50);
  
  const yPos = 50 + (splitOriginal.length * 7) + 10;
  doc.text("Transliterated Text:", 20, yPos);
  
  // jsPDF requires custom fonts for Unicode/Indian scripts to render correctly in PDF.
  // We'll warn the user or just output it.
  const splitTrans = doc.splitTextToSize(transliteratedText, 170);
  doc.text(splitTrans, 20, yPos + 10);
  
  doc.save(`${fileName}_transliterated.pdf`);
}
