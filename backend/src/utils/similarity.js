export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export function findRelevantChunks(queryEmbedding, document, topK = 3) {
  const similarities = document.chunks.map((chunk, idx) => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, document.embeddings[idx]),
  }));

  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}