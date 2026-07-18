/**
 * NLP Service — Primary Resume Scoring Engine
 * Strategy: TF-IDF + Cosine Similarity + Skill Extraction
 * Fallback: Gemini LLM (only when confidence is too low)
 */

const natural = require('natural');
const geminiService = require('./geminiService');

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// ──────────────────────────────────────────────────────────────────────────────
// Curated Tech Skills Dictionary (300+ skills)
// ──────────────────────────────────────────────────────────────────────────────
const TECH_SKILLS = [
  // Languages
  'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'golang', 'go',
  'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
  'bash', 'shell', 'powershell', 'html', 'css', 'sql', 'nosql', 'graphql',
  // Frontend
  'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js',
  'next.js', 'nextjs', 'nuxt', 'svelte', 'redux', 'zustand', 'mobx', 'tailwind',
  'bootstrap', 'sass', 'scss', 'webpack', 'vite', 'babel', 'eslint', 'jest',
  'cypress', 'playwright', 'storybook', 'figma',
  // Backend
  'node', 'nodejs', 'node.js', 'express', 'expressjs', 'express.js', 'django',
  'flask', 'fastapi', 'spring', 'springboot', 'laravel', 'rails', 'asp.net',
  'nestjs', 'hapi', 'koa', 'gin', 'fiber',
  // Databases
  'mongodb', 'mongoose', 'mysql', 'postgresql', 'postgres', 'sqlite', 'redis',
  'elasticsearch', 'cassandra', 'dynamodb', 'firebase', 'supabase', 'prisma',
  'sequelize', 'typeorm', 'knex',
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s',
  'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci', 'circleci',
  'nginx', 'apache', 'linux', 'ubuntu', 'heroku', 'vercel', 'netlify',
  // Tools
  'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'postman',
  'swagger', 'graphql', 'rest', 'restful', 'microservices', 'websockets',
  'socket.io', 'rabbitmq', 'kafka', 'celery',
  // AI/ML
  'machine learning', 'deep learning', 'neural network', 'tensorflow', 'pytorch',
  'scikit-learn', 'sklearn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
  'nlp', 'computer vision', 'opencv', 'bert', 'transformers', 'langchain',
  // Mobile
  'react native', 'flutter', 'android', 'ios', 'xcode', 'expo',
  // Testing
  'unit testing', 'integration testing', 'tdd', 'mocha', 'chai', 'jasmine',
  // Concepts
  'agile', 'scrum', 'kanban', 'ci/cd', 'oop', 'solid', 'mvc', 'mvvm',
  'design patterns', 'data structures', 'algorithms', 'system design',
  'api design', 'oauth', 'jwt', 'authentication', 'authorization',
];

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Normalize text: lowercase, remove special chars, keep only words
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\.\+#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract tech skills from raw text using dictionary match
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSkills(text) {
  const normalized = normalizeText(text);
  const found = new Set();

  TECH_SKILLS.forEach((skill) => {
    const escapedSkill = escapeRegex(skill);

    const pattern = new RegExp(
      `(?<![a-z])${escapedSkill}(?![a-z])`,
      "i"
    );

    if (pattern.test(normalized)) {
      found.add(skill.toLowerCase());
    }
  });

  return Array.from(found);
}

/**
 * TF-IDF cosine similarity between two text documents
 * Returns value 0.0 – 1.0
 */
function cosineSimilarity(text1, text2) {
  const tfidf = new TfIdf();
  tfidf.addDocument(text1);
  tfidf.addDocument(text2);

  const terms = new Set();
  tfidf.listTerms(0).forEach((t) => terms.add(t.term));
  tfidf.listTerms(1).forEach((t) => terms.add(t.term));

  const vec1 = [];
  const vec2 = [];

  terms.forEach((term) => {
    vec1.push(tfidf.tfidf(term, 0));
    vec2.push(tfidf.tfidf(term, 1));
  });

  const dot = vec1.reduce((sum, v, i) => sum + v * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));

  if (mag1 === 0 || mag2 === 0) return 0;
  return Math.min(dot / (mag1 * mag2), 1);
}

/**
 * Extract education signals from resume text
 */
function extractEducationScore(resumeText) {
  const text = resumeText.toLowerCase();
  if (text.includes('phd') || text.includes('doctorate')) return 100;
  if (text.includes('master') || text.includes('m.tech') || text.includes('mca') || text.includes('msc')) return 90;
  if (text.includes('bachelor') || text.includes('b.tech') || text.includes('b.e') || text.includes('bca') || text.includes('bsc') || text.includes('b.sc')) return 80;
  if (text.includes('diploma') || text.includes('associate')) return 60;
  if (text.includes('12th') || text.includes('hsc') || text.includes('high school')) return 40;
  return 30;
}

/**
 * Extract experience score from resume text
 */
function extractExperienceScore(resumeText) {
  const text = resumeText.toLowerCase();
  const yearMatch = text.match(/(\d+)\s*\+?\s*years?\s*(of)?\s*(experience|exp)/i);
  if (yearMatch) {
    const years = parseInt(yearMatch[1]);
    if (years >= 5) return 100;
    if (years >= 3) return 80;
    if (years >= 1) return 60;
    return 40;
  }
  // Check for internship/fresher signals
  if (text.includes('intern') || text.includes('fresher') || text.includes('entry level')) return 35;
  if (text.includes('project') || text.includes('developed')) return 50;
  return 30;
}

/**
 * Generate human-readable improvement suggestions
 */
function generateSuggestions(matchedSkills, missingSkills, matchScore, sectionScores) {
  const suggestions = [];

  if (missingSkills.length > 0) {
    const top = missingSkills.slice(0, 3).join(', ');
    suggestions.push(`Add hands-on experience with missing key skills: ${top}.`);
  }
  if (sectionScores.keywords < 50) {
    suggestions.push('Use more keywords from the job description throughout your resume.');
  }
  if (sectionScores.experience < 50) {
    suggestions.push('Quantify your experience with metrics (e.g. "Improved performance by 40%").');
  }
  if (sectionScores.education < 70) {
    suggestions.push('Highlight relevant coursework, certifications, or online courses.');
  }
  if (matchScore < 60) {
    suggestions.push('Tailor your resume specifically for this job role — rephrase summaries to mirror the JD language.');
  }
  if (matchedSkills.length > 0) {
    suggestions.push(`Great match on: ${matchedSkills.slice(0, 4).join(', ')}. Lead with these in your summary.`);
  }
  if (suggestions.length === 0) {
    suggestions.push('Your resume is well-aligned with the job description. Ensure all sections are clearly formatted.');
  }
  return suggestions;
}

/**
 * Determine shortlisting verdict based on score + confidence
 */
function determineVerdict(matchScore, confidence) {
  if (matchScore >= 70) {
    return {
      verdict: 'shortlisted',
      verdictReason: `Strong match at ${matchScore}% — your profile aligns well with the job requirements.`,
    };
  } else if (matchScore >= 45) {
    return {
      verdict: 'borderline',
      verdictReason: `Moderate match at ${matchScore}% — you may be considered with some profile improvements.`,
    };
  } else {
    return {
      verdict: 'rejected',
      verdictReason: `Low match at ${matchScore}% — significant skill gaps exist for this role.`,
    };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// MAIN EXPORTED FUNCTION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Analyze resume against job description
 * Primary: TF-IDF + skill extraction
 * Fallback: Gemini LLM (only when TF-IDF cannot produce reliable result)
 *
 * @param {string} resumeText - Full parsed resume text
 * @param {string} jobDescription - Full job description text
 * @param {string[]} requiredSkills - Skills array from job record
 * @returns {object} Analysis result
 */
async function analyzeResume(resumeText, jobDescription, requiredSkills = []) {
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = requiredSkills.length > 0
    ? requiredSkills.map((s) => s.toLowerCase())
    : extractSkills(jobDescription);

  // ── Confidence check: decide if TF-IDF is reliable ──
  const lowConfidence =
    wordCount < 80 ||
    resumeSkills.length < 3 ||
    jdSkills.length < 2;

  // ── LLM FALLBACK: only when truly needed ──
  if (lowConfidence) {
    console.log('⚠️  Low confidence detected → Attempting Gemini LLM fallback...');
    try {
      const llmResult = await geminiService.analyzeWithGemini(resumeText, jobDescription, jdSkills);
      if (llmResult) {
        console.log('✅ Gemini LLM fallback succeeded');
        return { ...llmResult, usedLLM: true };
      }
    } catch (err) {
      console.warn('⚠️  Gemini fallback failed, proceeding with TF-IDF anyway:', err.message);
    }
  }

  // ── PRIMARY: TF-IDF Scoring ──
  const normalizedResume = normalizeText(resumeText);
  const normalizedJD = normalizeText(jobDescription);

  // 1. Skill score — how many required skills appear in resume
  const matchedSkills = jdSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = jdSkills.filter((skill) => !resumeSkills.includes(skill));
  const skillScore = jdSkills.length > 0
    ? Math.round((matchedSkills.length / jdSkills.length) * 100)
    : 50;

  // 2. Keyword/semantic score — TF-IDF cosine similarity
  const similarity = cosineSimilarity(normalizedResume, normalizedJD);
  const keywordScore = Math.round(similarity * 100);

  // 3. Education score
  const educationScore = extractEducationScore(resumeText);

  // 4. Experience score
  const experienceScore = extractExperienceScore(resumeText);

  // Weighted overall score
  const matchScore = Math.round(
    skillScore * 0.40 +
    keywordScore * 0.30 +
    experienceScore * 0.20 +
    educationScore * 0.10
  );

  const sectionScores = {
    skills: skillScore,
    keywords: keywordScore,
    experience: experienceScore,
    education: educationScore,
    overall: matchScore,
  };

  // Confidence: based on how much data we have
  const confidence = Math.min(
    (wordCount / 300) * 0.5 + (resumeSkills.length / 10) * 0.5,
    1
  );

  const suggestions = generateSuggestions(matchedSkills, missingSkills, matchScore, sectionScores);
  const { verdict, verdictReason } = determineVerdict(matchScore, confidence);

  return {
    matchScore: Math.min(matchScore, 100),
    matchedSkills,
    missingSkills,
    sectionScores,
    suggestions,
    verdict,
    verdictReason,
    confidence: parseFloat(confidence.toFixed(2)),
    usedLLM: false,
  };
}

module.exports = { analyzeResume, extractSkills };
