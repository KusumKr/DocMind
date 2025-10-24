import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function splitTextIntoChunks(text, options = {}) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: options.chunkSize || 1000,
    chunkOverlap: options.chunkOverlap || 200,
  });

  const chunks = await splitter.createDocuments([text]);
  return chunks.map(chunk => chunk.pageContent);
}