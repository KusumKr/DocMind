import pdf from 'pdf-parse';

export async function extractTextFromPDF(buffer) {
  try {
    const data = await pdf(buffer);
    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error.message}`);
  }
}