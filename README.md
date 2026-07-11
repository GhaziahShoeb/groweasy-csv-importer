# GrowEasy AI CSV Importer

AI-powered CSV importer that maps any CSV format into GrowEasy CRM schema.

## Stack
- Frontend: Next.js, TailwindCSS
- Backend: Node.js, Express
- AI: Gemini (gemini-2.0-flash)

## Setup

### Backend
cd backend
npm install
# add GEMINI_API_KEY and PORT to .env
npm run dev

### Frontend
cd frontend
npm install
npm run dev

Visit http://localhost:3000

## Features
- Drag & drop CSV upload
- Live preview before import
- AI-based field mapping to CRM schema (batched)
- Retry mechanism for failed AI batches
- Imported vs skipped record display with reasons