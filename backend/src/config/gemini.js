import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const embeddingModel = genAI.getGenerativeModel({ 
  model: "embedding-001" 
});

export const chatModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
});