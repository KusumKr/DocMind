# DocMind Backend

AI-powered PDF Q&A backend with OpenAI embeddings and GPT-4.

## Quick Start

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Set up environment:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Add your OpenAI API key to `.env`

3. Run development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Server runs on: http://localhost:5000

## API Endpoints

- `POST /api/upload` - Upload PDF
- `POST /api/ask` - Ask question
- `GET /api/documents` - List all documents
- `GET /api/document/:id` - Get document info
- `DELETE /api/document/:id` - Delete document
- `GET /health` - Health check

## Tech Stack

- Express.js
- OpenAI (embeddings + chat)
- LangChain (text splitting)
- Multer (file uploads)
- pdf-parse (PDF extraction)