import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Biomarker {
  name: string;
  value: number;
  unit: string;
  normal_min: number;
  normal_max: number;
}

export interface AIAnalysisResult {
  type: 'prescription' | 'lab_report';
  summary: string;
  details: {
    clinicName?: string;
    doctorName?: string;
    date?: string;
    diagnosis?: string;
    medicines?: Medicine[];
    specialization?: string;
    labName?: string;
    testName?: string;
    biomarkers?: Biomarker[];
    isCritical?: boolean;
  };
  confidence: number;
}

const SYSTEM_PROMPT = `You are an expert medical document parser. Carefully analyze this medical document image and extract structured data. You MUST try your absolute best to read and transcribe handwritten text, especially medication names, dosages, and medical shorthand (e.g., Rx, bd, od, tid, p.c., a.c., q.i.d., s.o.s.).

If it is a PRESCRIPTION, return JSON:
{
  "type": "prescription",
  "clinic_name": "",
  "doctor_name": "",
  "date": "",
  "diagnosis": "",
  "medicines": [
    { 
      "name": "Exact medicine name (transcribe handwriting carefully)", 
      "dosage": "e.g., 500mg, 10ml", 
      "frequency": "e.g., 1-0-1, twice a day (decode shorthand like bd/tid)", 
      "duration": "e.g., 5 days", 
      "instructions": "e.g., after meals (decode shorthand like p.c./a.c.)" 
    }
  ],
  "specialization": "",
  "ai_confidence": 0.95
}

If it is a LAB REPORT, return JSON:
{
  "type": "lab_report",
  "lab_name": "",
  "doctor_name": "",
  "date": "",
  "test_name": "",
  "biomarkers": [
    { "name": "", "value": 0, "unit": "", "normal_min": 0, "normal_max": 0 }
  ],
  "is_critical": false,
  "ai_confidence": 0.95
}

Return ONLY valid JSON. No markdown fences, no explanation.`;

export async function analyzeMedicalImage(
  imageBase64: string,
  mimeType: string,
  apiKey: string,
): Promise<AIAnalysisResult> {
  const key = apiKey || import.meta.env.VITE_GEMINI_VISION_KEY || import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY || '';
  const genAI = new GoogleGenerativeAI(key);
  const models = ['gemini-3-flash-preview', 'gemini-flash-latest'];
  let parsed: any = null;
  let lastError: any = null;

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        SYSTEM_PROMPT,
        { inlineData: { data: imageBase64, mimeType: mimeType as any } },
      ]);
      const text = result.response.text();
      const cleanJson = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      parsed = JSON.parse(cleanJson);
      if (parsed) break;
    } catch (err: any) {
      console.warn(`[Gemini] Model ${modelName} failed:`, err?.message || err);
      lastError = err;
    }
  }

  if (!parsed) {
    throw new Error(lastError?.message || 'Failed to analyze document with all Gemini models.');
  }

  if (parsed.type === 'prescription') {
    return {
      type: 'prescription',
      summary: `Prescription from ${parsed.clinic_name || 'Clinic'} — ${parsed.diagnosis || 'Diagnosis verified'}.`,
      details: {
        clinicName: parsed.clinic_name || '',
        doctorName: parsed.doctor_name || '',
        date: parsed.date || new Date().toISOString().split('T')[0],
        diagnosis: parsed.diagnosis || '',
        medicines: parsed.medicines || [],
        specialization: parsed.specialization || '',
      },
      confidence: Number(parsed.ai_confidence) || 0.95,
    };
  } else {
    return {
      type: 'lab_report',
      summary: `Lab analysis from ${parsed.lab_name || 'Laboratory'} — ${parsed.test_name || 'Panel'}.`,
      details: {
        labName: parsed.lab_name || '',
        doctorName: parsed.doctor_name || '',
        date: parsed.date || new Date().toISOString().split('T')[0],
        testName: parsed.test_name || '',
        biomarkers: parsed.biomarkers || [],
        isCritical: parsed.is_critical || false,
      },
      confidence: Number(parsed.ai_confidence) || 0.95,
    };
  }
}
