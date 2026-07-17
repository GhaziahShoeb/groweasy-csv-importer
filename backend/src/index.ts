import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const ALLOWED_STATUS = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
const ALLOWED_SOURCE = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];

function buildPrompt(rows: any[]) {
  return `You are a CRM data extraction engine. Convert the following CSV rows into GrowEasy CRM JSON records.

CRM FIELDS: created_at, name, email, country_code, mobile_without_country_code, company, city, state, country, lead_owner, crm_status, crm_note, data_source, possession_time, description

RULES:
1. crm_status must be one of: ${ALLOWED_STATUS.join(", ")}. If unclear, leave blank.
2. data_source must be one of: ${ALLOWED_SOURCE.join(", ")}. If none match confidently, leave blank.
3. created_at must be a valid date parseable by JavaScript's new Date().
4. Put remarks, follow-ups, extra phone numbers, extra emails, or unmapped-but-useful info into crm_note.
5. If multiple emails exist, use the first as "email", append rest into crm_note. Same for multiple mobile numbers.
6. Each record is a single JSON object — no raw line breaks inside values (use \\n if unavoidable).
7. If a row has NEITHER email NOR mobile number, SKIP it — put it in "skipped" with a "reason", not in "records".

INPUT ROWS (JSON):
${JSON.stringify(rows)}

Respond ONLY with valid JSON, no markdown, no explanation, in this exact shape:
{
  "records": [ { ...CRM fields... } ],
  "skipped": [ { "row": {...original row...}, "reason": "..." } ]
}`;
}
function validateRecord(record: any): { valid: any | null; reason?: string } {
  const cleaned = { ...record };

  if (!ALLOWED_STATUS.includes(cleaned.crm_status)) cleaned.crm_status = "";
  if (!ALLOWED_SOURCE.includes(cleaned.data_source)) cleaned.data_source = "";

  if (cleaned.created_at && isNaN(new Date(cleaned.created_at).getTime())) {
    cleaned.created_at = "";
  }

  const hasEmail = cleaned.email && cleaned.email.trim() !== "";
  const hasMobile = cleaned.mobile_without_country_code && cleaned.mobile_without_country_code.trim() !== "";

  if (!hasEmail && !hasMobile) {
    return { valid: null, reason: "Missing both email and mobile after AI extraction" };
  }

  return { valid: cleaned };
}

async function callGeminiWithRetry(prompt: string, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
      return JSON.parse(text);
    } catch (err) {
      console.error(`Attempt ${attempt + 1} failed:`, err);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1))); // backoff
    }
  }
}

app.post("/api/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const csvText = req.file.buffer.toString("utf-8");
    const rows = parse(csvText, { columns: true, skip_empty_lines: true });

    const BATCH_SIZE = 20;
    const batches: any[][] = [];
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      batches.push(rows.slice(i, i + BATCH_SIZE));
    }

    let allRecords: any[] = [];
    let allSkipped: any[] = [];

    for (const batch of batches) {
      const prompt = buildPrompt(batch);
      try {
        const parsed = await callGeminiWithRetry(prompt, 2);
        for (const record of parsed.records || []) {
          const { valid, reason } = validateRecord(record);
          if (valid) allRecords.push(valid);
          else allSkipped.push({ row: record, reason });
        }
        allSkipped.push(...(parsed.skipped || []));
      } catch (batchErr) {
        console.error("Batch failed after retries:", batchErr);
        batch.forEach((row: any) => allSkipped.push({ row, reason: "AI processing failed after retries" }));
      }
    }

    res.json({
      imported: allRecords,
      skipped: allSkipped,
      total_imported: allRecords.length,
      total_skipped: allSkipped.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Import failed", details: String(err) });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));