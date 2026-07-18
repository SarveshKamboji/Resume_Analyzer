/**
 * Gemini LLM Service — Fallback Scorer
 * Only called when TF-IDF cannot produce a reliable result.
 * (e.g. resume text too short, too few extractable skills)
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Analyze resume with Gemini LLM as fallback
 * Returns same shape as nlpService primary result
 */
async function analyzeWithGemini(resumeText, jobDescription, jdSkills = []) {
  const client = getClient();
  if (!client) {
    console.warn('Gemini API key not configured. Skipping LLM fallback.');
    return null;
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer.

Analyze the resume against the job description and return a JSON object only (no markdown, no explanation).

RESUME:
${resumeText.substring(0, 3000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

REQUIRED SKILLS FROM JD: ${jdSkills.join(', ')}

Return ONLY this JSON structure (numbers 0-100 for scores):
{
  "matchScore": <number 0-100>,
  "matchedSkills": [<array of skill strings found in resume that match JD>],
  "missingSkills": [<array of required skills missing from resume>],
  "sectionScores": {
    "skills": <number>,
    "keywords": <number>,
    "experience": <number>,
    "education": <number>,
    "overall": <number>
  },
  "verdict": "<shortlisted|borderline|rejected>",
  "verdictReason": "<one sentence explaining the verdict>",
  "suggestions": [<array of 3-5 actionable improvement strings>],
  "confidence": <number 0.0-1.0>
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response (strip any surrounding markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (typeof parsed.matchScore !== 'number') throw new Error('Invalid Gemini response structure');

    return {
      matchScore: Math.min(Math.max(Math.round(parsed.matchScore), 0), 100),
      matchedSkills: Array.isArray(parsed.matchedSkills) ? parsed.matchedSkills : [],
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      sectionScores: parsed.sectionScores || { skills: 0, keywords: 0, experience: 0, education: 0, overall: 0 },
      verdict: ['shortlisted', 'borderline', 'rejected'].includes(parsed.verdict) ? parsed.verdict : 'borderline',
      verdictReason: parsed.verdictReason || 'Analysis completed via AI assistance.',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
      usedLLM: true,
    };
  } catch (err) {
    console.error('Gemini parse error:', err.message);
    return null;
  }
}

module.exports = { analyzeWithGemini };
