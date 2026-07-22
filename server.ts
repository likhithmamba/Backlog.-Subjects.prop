import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// ES module environment setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client helper to avoid crashes on startup
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add your Gemini API key in AI Studio under Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "BacklogAI Server running fine" });
});

// API endpoint to check if API key is configured
app.get("/api/check-key", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({ configured: hasKey });
});

// API endpoint 1: Explain concept/question (Academic explanation, bullet points, core definitions)
app.post("/api/gemini/explain", async (req, res) => {
  try {
    const { question, concept, marks, moduleName } = req.body;
    if (!question || !concept) {
      return res.status(400).json({ error: "Missing required parameters: question, concept" });
    }

    const ai = getAIClient();
    const systemPrompt = `You are a legendary university professor specializing in engineering exams. You specialize in explaining complex technical concepts to students who are struggling to pass their backlog exams.
Your explanations must be perfectly accurate, easy to memorize, and designed to score maximum marks in university evaluation sheets.
Always use clear markdown headings, bold terms, code blocks if necessary, bullet lists, and visual structures (like ASCII flowcharts if relevant).`;

    const prompt = `Please explain the following exam question/concept for a ${marks || 10}-mark question in Module: "${moduleName || 'General'}".
Question: "${question}"
Core Concept: "${concept}"

Provide your answer in exactly these structured sections:
1. **Core Definition & Exam Gist** (A concise 2-sentence summary that the examiner wants to see first to give full marks)
2. **Simplified Analogy** (Explain the concept using a highly relatable real-world analogy to make it stick in a student's brain)
3. **Key Components / Step-by-Step Breakdown** (Explain how it works using bullet points with bold keywords)
4. **Must-Draw Diagram Concept** (Describe exactly what diagram the student MUST draw on their physical paper sheet, listing the labels, X-axis, Y-axis, or block labels)
5. **Score-Saver Exam Tip** (A practical tip on common student mistakes to avoid on this exact topic to prevent losing marks)`;

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ explanation: result.text });
  } catch (err: any) {
    console.error("Gemini Explain Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate explanation." });
  }
});

// API endpoint 2: Rigorous Derivations / Step-by-step math solver
app.post("/api/gemini/derive", async (req, res) => {
  try {
    const { question, concept, marks } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing parameter: question" });
    }

    const ai = getAIClient();
    const systemPrompt = `You are a rigorous engineering math and science professor. Your goal is to guide students step-by-step through complex derivations (like BPSK Probability of Error, sampling theorems, RSA math, or Fourier transforms) so they don't skip steps and lose marks.
Use clear mathematical notations, step-by-step logical transitions, and explain what each symbol/variable stands for.`;

    const prompt = `Generate a rigorous academic derivation for this exam topic to score a full ${marks || 10} marks.
Topic/Question: "${question}"
Focus Concept: "${concept || 'Mathematical Derivation'}"

Your response must be styled in markdown and include:
1. **List of Variables & Prerequisites** (State clearly what every symbol, constant, or wave parameter means)
2. **Standard Assumptions** (What initial states are we assuming?)
3. **Step-by-Step Derivation** (Break down the mathematics step-by-step, explaining the integration, substitution, or simplification between EACH line)
4. **Final Result Boxed** (Highlight the final mathematical expression)
5. **How to Re-create in 3 Minutes** (Give the student an optimization strategy to draft this derivation quickly during the exam stress)`;

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for factual math accuracy
      },
    });

    res.json({ derivation: result.text });
  } catch (err: any) {
    console.error("Gemini Derive Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate mathematical derivation." });
  }
});

// API endpoint 3: Backlog personalized study plan
app.post("/api/gemini/study-plan", async (req, res) => {
  try {
    const { subjectName, code, timeline, confidence, weakModules, questionsList } = req.body;
    if (!subjectName) {
      return res.status(400).json({ error: "Missing parameter: subjectName" });
    }

    const ai = getAIClient();
    const systemPrompt = `You are an expert student mentor who has helped thousands of engineering students clear their multi-year backlog exams under heavy stress.
You focus exclusively on high-yield, statistically repeated questions, and recommend efficient, active recall strategies (not passive reading).`;

    const questionsFormatted = (questionsList || [])
      .map((q: any) => `- Module ${q.module}: "${q.question}" (Repeated ${q.repeatedCount} times, predicted recurrence probability: ${q.predictedRecurrence}%)`)
      .join("\n");

    const prompt = `Create an intensive Backlog Clearance Study Plan for the following subject:
Subject: "${subjectName}" (${code || 'N/A'})
Available Prep Timeline: "${timeline}" (e.g., "7 Days", "3 Days", "1 Month")
Current Student Confidence: "${confidence}" (Low / Medium)
Weak/Struggling Modules: "${weakModules || 'All'}"

Here are the highest-recurrence exam questions identified by statistics in our database:
${questionsFormatted || "Standard syllabus modules"}

Format your response in markdown with:
1. **The 'Pass Guarantee' Strategy** (The 2 absolute key modules the student must master to secure the 40/100 passing threshold, based on statistical weight)
2. **Timeline-Adapted Daily Schedule** (A clear daily timetable dividing hours/topics with a focus on writing practice and diagrams)
3. **Active Recall Action Plan** (How they should study using flashcards, self-tests, and the statistical question bank)
4. **Exam Hall Psychology Gist** (What to do in the first 15 minutes of the exam to optimize time and manage anxiety)`;

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    res.json({ studyPlan: result.text });
  } catch (err: any) {
    console.error("Gemini Study Plan Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate study plan." });
  }
});

// API endpoint 4: Interactive Concept Flashcard/Quiz Generator
app.post("/api/gemini/quiz", async (req, res) => {
  try {
    const { concept, questionText } = req.body;
    if (!concept) {
      return res.status(400).json({ error: "Missing parameter: concept" });
    }

    const ai = getAIClient();
    const prompt = `Generate a set of 3 interactive, highly focused multiple-choice questions (MCQs) designed to test deep concept recall for a student preparing for an engineering exam.
Concept to test: "${concept}"
Context Question: "${questionText || ''}"

Return a JSON array containing objects with this exact schema:
[
  {
    "id": "q_1",
    "question": "Clear, concise conceptual question testing understanding",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "The exact correct option string",
    "explanation": "Clear explanation of why this answer is correct and why other options are wrong, optimized for clearing a backlog exam."
  }
]

IMPORTANT: Return ONLY the JSON array inside a standard JSON response block. Do not include any other markdown text outside the JSON array itself.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const quizData = JSON.parse(result.text.trim());
    res.json({ quiz: quizData });
  } catch (err: any) {
    console.error("Gemini Quiz Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate quiz." });
  }
});


// Serve Vite or static assets depending on environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BacklogAI v2 Server] running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
