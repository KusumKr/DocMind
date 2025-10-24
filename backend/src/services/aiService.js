import { chatModel } from '../config/gemini.js';

export async function getAnswerWithCitations(question, relevantChunks) {
  const context = relevantChunks
    .map((chunk) => `[${chunk.chunkId} | page: ${chunk.page}]\n"${chunk.text}"`)
    .join('\n\n');

  const prompt = `Below are relevant text chunks extracted from the user's uploaded PDF.
Each chunk shows the page number and text snippet.

--- BEGIN CHUNKS ---
${context}
--- END CHUNKS ---

User Question: ${question}

Instructions:
- Read the chunks carefully.
- Answer the question briefly (2-3 sentences max).
- List only those chunks that support the answer.
- Return your result strictly in JSON format:
{
  "answer": "short 1-3 sentence factual answer",
  "citations": [
    {"page": <number>, "chunkId": "<string>", "snippet": "<<=30 words excerpt used>"}
  ],
  "follow_up": "optional 1 short follow-up question or empty string"
}

Rules:
- Use only the provided text chunks.
- If uncertain, answer "I don't know." with empty citations.
- Never invent data not found in the text.
- Keep output concise.

Respond ONLY with the JSON object, nothing else.`;

  try {
    const result = await chatModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response (Gemini might add extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI Error:', error);
    // Fallback response
    return {
      answer: "I encountered an error processing your question. Please try again.",
      citations: [],
      follow_up: ""
    };
  }
}