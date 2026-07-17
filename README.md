# GrowEasy AI CSV Importer

An AI-powered CSV importer that intelligently extracts CRM lead information from **any** CSV format — regardless of column names, layout, or source (Facebook Lead Exports, Google Ads Exports, Excel sheets, Real Estate CRM exports, manually created spreadsheets, etc.) — and converts it into the GrowEasy CRM schema.

**Live App:** https://frontend-karma-x.vercel.app
**Backend API:** https://backend-beta-wine-77.vercel.app
**GitHub Repo:** https://github.com/GhaziahShoeb/groweasy-csv-importer

---

## Problem Statement

CRM leads arrive in CSV files from many different sources — Facebook, Google Ads, manual spreadsheets, other CRMs — and each source names its columns differently (`Full Name` vs `lead_name` vs `Contact`). Hardcoding column mappings breaks the moment a new source is introduced.

The challenge is not parsing CSVs — it's **understanding** them: given any CSV, correctly and confidently mapping its columns to a fixed CRM schema, even when column names are ambiguous, inconsistent, or missing entirely.

## Approach

1. **Frontend** lets the user upload a CSV, preview it client-side (no AI call yet), and confirm before anything is sent to the backend.
2. **Backend** parses the CSV server-side, splits rows into batches, and sends each batch to Gemini AI with a structured prompt describing the target CRM schema, allowed enum values, and extraction rules (skip logic, note-merging, date formatting).
3. AI returns structured JSON per batch, which is **validated again in code** (not just trusted blindly) — enums are checked, dates are validated, and records missing both email and mobile are moved to a skipped list with a reason.
4. Results are combined and returned to the frontend, which displays imported vs. skipped records with counts.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| AI | Google Gemini API |
| CSV Parsing | `papaparse` (client), `csv-parse` (server) |
| Deployment | Vercel (frontend), Render (backend) |

---

## Features

- Drag & drop + click-to-browse CSV upload
- Client-side CSV preview with sticky headers, horizontal/vertical scrolling — no AI processing until confirmed
- AI-based field mapping to GrowEasy CRM schema, batched (20 rows/batch) to handle large files
- Server-side validation layer on top of AI output (enum checks, date validation, skip-rule enforcement)
- Retry mechanism with exponential backoff for failed AI batches
- Imported vs. skipped record tables with reasons and total counts
- Loading state / progress indicator during AI processing
- Responsive, buttercup-yellow themed UI

---

## CRM Field Mapping Rules

- `crm_status` restricted to: `GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE` (blank if uncertain)
- `data_source` restricted to a fixed list of known sources (blank if no confident match)
- `created_at` must be parseable by JavaScript's `new Date()`
- Extra emails/phone numbers beyond the first are appended into `crm_note`
- Rows with **neither** an email **nor** a mobile number are skipped, with the reason recorded

---

## Local Setup

### Prerequisites
- Node.js 18+
- A free Gemini API key from https://aistudio.google.com/apikey

### Backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5001
```
Run:
```bash
npm run dev
```
Backend runs at `http://localhost:5001`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.

> Note: the deployed frontend points to the live Render backend URL. For fully local development, update the `fetch()` URL in `frontend/app/page.tsx` to `http://localhost:5001/api/import`.

---

## Deployment

- **Frontend:** deployed on Vercel, root directory set to `frontend`
- **Backend:** deployed on Render as a Node web service, root directory set to `backend`, with build command `npm install && npm run build` and start command `npm start`
- Environment variable `GEMINI_API_KEY` is set in Render's dashboard (not committed to the repo)

---

## Project Structure

```
groweasy-csv-importer/
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── CSVUpload.tsx
│   │   │   ├── PreviewTable.tsx
│   │   │   └── ResultTable.tsx
│   │   └── page.tsx
├── backend/
│   └── src/
│       └── index.ts
└── README.md
```

---

## Known Limitations / Future Improvements

- No database — the app is stateless; each import is processed and returned in one request
- Progress indicator is a visual estimate, not true per-batch streaming (would require WebSockets/SSE for large files)
- No authentication/authorization layer (out of scope for this assignment)
- Free-tier Gemini and Render usage may introduce cold-start delays or rate limits under heavy load