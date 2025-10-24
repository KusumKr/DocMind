import { documentStore } from '../store/documentStore.js';
import { getEmbeddings } from '../services/embeddingService.js';
import { findRelevantChunks } from '../utils/similarity.js';
import { getAnswerWithCitations } from '../services/aiService.js';

export async function askQuestion(req, res, next) {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        error: 'documentId and question are required',
      });
    }

    const doc = documentStore.get(documentId);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get question embedding
    const [questionEmbedding] = await getEmbeddings([question]);

    // Find relevant chunks
    const relevantChunks = findRelevantChunks(questionEmbedding, doc, 3);

    if (relevantChunks.length === 0) {
      return res.json({
        answer: "I don't know.",
        citations: [],
        follow_up: '',
      });
    }

    // Get AI answer
    const response = await getAnswerWithCitations(question, relevantChunks);
    res.json(response);
  } catch (error) {
    next(error);
  }
}