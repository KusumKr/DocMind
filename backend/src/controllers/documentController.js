import { extractTextFromPDF } from '../services/pdfService.js';
import { splitTextIntoChunks } from '../utils/textSplitter.js';
import { getEmbeddings } from '../services/embeddingService.js';
import { documentStore } from '../store/documentStore.js';

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Extract text
    const pdfData = await extractTextFromPDF(req.file.buffer);

    // Split into chunks
    const textChunks = await splitTextIntoChunks(pdfData.text);

    // Get embeddings
    const embeddings = await getEmbeddings(textChunks);

    // Estimate page numbers
    const avgCharsPerPage = pdfData.text.length / pdfData.numPages;
    let currentPos = 0;

    const chunks = textChunks.map((text, idx) => {
      const chunkId = `chunk-${idx + 1}`;
      const page = Math.ceil(currentPos / avgCharsPerPage) || 1;
      currentPos += text.length;

      return {
        chunkId,
        page: Math.min(page, pdfData.numPages),
        text,
      };
    });

    // Store document
    documentStore.set(documentId, {
      id: documentId,
      filename: req.file.originalname,
      uploadedAt: new Date().toISOString(),
      numPages: pdfData.numPages,
      chunks,
      embeddings,
    });

    res.json({
      success: true,
      documentId,
      filename: req.file.originalname,
      numPages: pdfData.numPages,
      numChunks: chunks.length,
    });
  } catch (error) {
    next(error);
  }
}

export function getDocument(req, res) {
  const doc = documentStore.get(req.params.documentId);

  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json({
    id: doc.id,
    filename: doc.filename,
    uploadedAt: doc.uploadedAt,
    numPages: doc.numPages,
    numChunks: doc.chunks.length,
  });
}

export function getAllDocuments(req, res) {
  const documents = documentStore.getAll().map(doc => ({
    id: doc.id,
    filename: doc.filename,
    uploadedAt: doc.uploadedAt,
    numPages: doc.numPages,
    numChunks: doc.chunks.length,
  }));

  res.json({ documents });
}

export function deleteDocument(req, res) {
  const deleted = documentStore.delete(req.params.documentId);

  if (deleted) {
    res.json({ success: true, message: 'Document deleted' });
  } else {
    res.status(404).json({ error: 'Document not found' });
  }
}