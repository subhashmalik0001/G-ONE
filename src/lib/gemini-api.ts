interface SymptomAnalysis {
  severity: 'mild' | 'moderate' | 'severe';
  analysis: string;
  recommendations: string[];
  possibleConditions: string[];
}

class GeminiAPI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor() {
    // Use environment variable instead of hardcoded key
    this.apiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY || import.meta.env.VITE_GEMINI_TEXT_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found in environment variables');
    }
  }

  async analyzeSymptoms(symptoms: string): Promise<SymptomAnalysis> {
    const prompt = `As a medical AI assistant, analyze these symptoms and provide:

1. Severity classification (mild/moderate/severe)
2. Detailed analysis of symptoms
3. Recommended actions (3-4 items)
4. Possible conditions to consider (2-3 items)

Symptoms: ${symptoms}

Format response as JSON:
{
  "severity": "mild|moderate|severe",
  "analysis": "detailed explanation of symptoms",
  "recommendations": ["action 1", "action 2", "action 3"],
  "possibleConditions": ["condition 1", "condition 2"]
}`;

    const models = ['gemini-3-flash-preview', 'gemini-1.5-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const model of models) {
      try {
        const response = await fetch(`${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
          })
        });

        if (!response.ok) continue;

        const result = await response.json();

        if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
          continue;
        }

        const text = result.candidates[0].content.parts[0].text;

        try {
          const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/) || text.match(/({[\s\S]*?})/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
          }
        } catch { }

        // Fallback parsing
        const symptomsLower = symptoms.toLowerCase();
        let severity: 'mild' | 'moderate' | 'severe' = 'moderate';

        if (symptomsLower.includes('chest') || symptomsLower.includes('breathing')) severity = 'severe';
        else if (symptomsLower.includes('mild')) severity = 'mild';

        return {
          severity,
          analysis: text || 'Based on your symptoms, medical evaluation is recommended.',
          recommendations: ['Consult healthcare provider', 'Monitor symptoms', 'Rest and hydration'],
          possibleConditions: ['Various conditions possible', 'Requires medical assessment']
        };
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    // Default safe fallback if network or all models fail
    const symptomsLower = symptoms.toLowerCase();
    let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
    if (symptomsLower.includes('chest') || symptomsLower.includes('breathing')) severity = 'severe';
    else if (symptomsLower.includes('mild')) severity = 'mild';

    return {
      severity,
      analysis: 'Preliminary automated symptom assessment based on your description.',
      recommendations: ['Consult a qualified healthcare provider', 'Monitor vital signs and symptoms', 'Rest and maintain hydration'],
      possibleConditions: ['Clinical assessment required for accurate diagnosis']
    };
  }
}

export const geminiAPI = new GeminiAPI();
export type { SymptomAnalysis };