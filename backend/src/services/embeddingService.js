import { embeddingModel } from '../config/gemini.js';

export async function getEmbeddings(texts) {
  try {
    const embeddings = [];
    
    for (const text of texts) {
      const result = await embeddingModel.embedContent(text);
      embeddings.push(result.embedding.values);
    }
    
    return embeddings;
  } catch (error) {
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}