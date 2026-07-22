import React, { useState, useEffect } from "react";
import { 
  Sparkles, Award, Clock, Timer, CheckCircle, FileText, Loader2,
  BookOpen, HelpCircle, AlertTriangle, ShieldCheck, RefreshCw, ChevronRight
} from "lucide-react";
import { Subject, Question } from "../data/backlogDataset";

interface MockTestViewProps {
  subject: Subject;
  theme: "dark" | "light";
}

interface TestQuestion {
  moduleNum: number;
  moduleTitle: string;
  question: Question;
}

export default function MockTestView({ subject, theme }: MockTestViewProps) {
  const [testMode, setTestMode] = useState<"diagnostic" | "full" | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<any | null>(null);
  const [loadingSchemeId, setLoadingSchemeId] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<Record<string, string>>({});

  // Assemble test paper: Draw 1 highest recurrence question from each module
  const assembleTestPaper = () => {
    const selectedQuestions: TestQuestion[] = [];
    
    subject.modules.forEach(mod => {
      const moduleQuestions = subject.questions.filter(q => q.module === mod.number);
      if (moduleQuestions.length > 0) {
        // Sort by predicted recurrence descending to pull the highest yield sessional prediction
        const sorted = [...moduleQuestions].sort((a, b) => b.predictedRecurrence - a.predictedRecurrence);
        selectedQuestions.push({
          moduleNum: mod.number,
          moduleTitle: mod.title,
          question: sorted[0]
        });
      }
    });

    setQuestions(selectedQuestions);
  };

  const startTest = (mode: "diagnostic" | "full") => {
    setTestMode(mode);
    assembleTestPaper();
    setAnswers({});
    setResults(null);
    setIsActive(true);
    // 15 mins = 900 secs, 3 hours = 10800 secs
    setTimeLeft(mode === "diagnostic" ? 900 : 10800);
  };

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      submitTest();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    const mStr = String(m).padStart(2, "0");
    const sStr = String(s).padStart(2, "0");

    if (h > 0) {
      return `${h}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  const submitTest = () => {
    setIsActive(false);
    
    // Evaluate results: count answered questions and calculate module ratings
    const evaluated: any[] = [];
    let totalScore = 0;
    let questionsAnswered = 0;

    questions.forEach(q => {
      const answered = !!answers[q.question.id]?.trim();
      const length = answers[q.question.id]?.trim().length || 0;
      
      // Rough mock score based on keyword-richness / draft length
      let score = 0;
      let reviewNote = "Syllabus blank space. Provide schematic formulas for scoring.";
      
      if (answered) {
        questionsAnswered++;
        if (length < 40) {
          score = Math.round(q.question.marks * 0.35);
          reviewNote = "Underdeveloped outline. Needs key terms & required ASCII drawings mentioned.";
        } else if (length < 150) {
          score = Math.round(q.question.marks * 0.7);
          reviewNote = "Good outline structure. Ensure exact mathematical formulas are highlighted.";
        } else {
          score = q.question.marks;
          reviewNote = "Excellent robust outline. Ready to score full evaluation points.";
        }
      }
      
      totalScore += score;
      evaluated.push({
        ...q,
        score,
        maxScore: q.question.marks,
        reviewNote
      });
    });

    const maxTestScore = questions.reduce((sum, q) => sum + q.question.marks, 0);
    const readinessIndex = Math.min(Math.round((totalScore / maxTestScore) * 100), 100);

    setResults({
      evaluated,
      readinessIndex,
      totalScore,
      maxScore: maxTestScore,
      questionsAnswered,
      totalQuestions: questions.length
    });
  };

  const fetchAIModelScheme = async (qId: string, questionText: string, concept: string, moduleTitle: string) => {
    setLoadingSchemeId(qId);
    try {
      const res = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          concept,
          marks: 10,
          moduleName: moduleTitle
        })
      });

      if (!res.ok) throw new Error("Server returned non-ok response");
      const data = await res.json();
      setSchemes(prev => ({
        ...prev,
        [qId]: data.explanation || "No grading guidelines returned."
      }));
    } catch (err) {
      console.error(err);
      setSchemes(prev => ({
        ...prev,
        [qId]: "Failed to retrieve automated evaluation rules. Please verify your internet connection and Gemini keys."
      }));
    } finally {
      setLoadingSchemeId(null);
    }
  };

  const isDark = theme === "dark";

  return (
    <div id="mock-tests-component" className="max-w-3xl mx-auto space-y-6 py-2 animate-in fade-in duration-200">
      
      {/* Cover Page */}
      {testMode === null && (
        <div className={`p-8 rounded-2xl border text-center space-y-6 transition-all ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto border border-indigo-500/20 shadow-md">
            <Timer className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className={`text-md.5 font-black uppercase tracking-wider ${isDark ? "text-slate-100" : "text-slate-950"}`}>
              Sessional Pattern Simulator
            </h3>
            <p className={`text-xs max-w-lg mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-550"}`}>
              Practice writing response outlines under exam stress. Our prediction engine automatically selects 5 high-recurrence sessional questions (one per syllabus module) to assemble a realistic university-pattern test paper.
            </p>
          </div>

          {/* Test Cards Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4">
            {/* Option A */}
            <div className={`p-5 rounded-xl border text-left flex flex-col justify-between space-y-4 ${
              isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-100"
            }`}>
              <div className="space-y-1">
                <span className="text-[9.5px] font-black uppercase text-indigo-500 tracking-wider">
                  Diagnostic Buffer
                </span>
                <h4 className={`font-black text-xs.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  15-Min Sessional Cram
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Quick-fire outline practice. Perfect for rapid recall check before entering the hall.
                </p>
              </div>
              <button
                id="btn-start-diagnostic"
                onClick={() => startTest("diagnostic")}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10.5px] py-2 rounded-lg transition-colors cursor-pointer"
              >
                Begin 15-Min Test
              </button>
            </div>

            {/* Option B */}
            <div className={`p-5 rounded-xl border text-left flex flex-col justify-between space-y-4 ${
              isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-50 border-slate-100"
            }`}>
              <div className="space-y-1">
                <span className="text-[9.5px] font-black uppercase text-rose-500 tracking-wider">
                  Simulated Hall Mode
                </span>
                <h4 className={`font-black text-xs.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  3-Hour VTU Exam
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                  Rigorous time-boxed practice. Answer 5 questions with comprehensive derivations & diagrams.
                </p>
              </div>
              <button
                id="btn-start-vtu-test"
                onClick={() => startTest("full")}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10.5px] py-2 rounded-lg transition-colors cursor-pointer"
              >
                Begin 3-Hour Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Test Mode */}
      {testMode !== null && isActive && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Active Sticky Header */}
          <div className={`p-4 rounded-xl border sticky top-2 z-10 flex items-center justify-between gap-4 shadow-md ${
            isDark ? "bg-slate-950/95 border-slate-800 text-white" : "bg-white/95 border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-rose-500 animate-pulse" />
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">
                  {testMode === "diagnostic" ? "15-Min Diagnostic Cram" : "3-Hour Sessional Exam"}
                </span>
                <span className="text-xs font-black text-slate-400">Subject: {subject.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xl font-black font-mono tracking-wider text-rose-500">
                {formatTime(timeLeft)}
              </span>
              <button
                id="btn-submit-mock-test"
                onClick={submitTest}
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer shadow-sm shadow-rose-600/15"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Test Questions and Outlines */}
          <div className="space-y-5">
            {questions.map((tq, index) => (
              <div 
                key={tq.question.id}
                className={`p-6 rounded-2xl border space-y-4 ${
                  isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Module {tq.moduleNum}: {tq.moduleTitle}</span>
                  <span>Question {index + 1} • {tq.question.marks} Marks</span>
                </div>

                <div className="space-y-2">
                  <h4 className={`text-md font-black leading-snug ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {tq.question.question}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    Core Focus: {tq.question.concept}
                  </p>
                </div>

                {/* Outline Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Write your outline or core formulas/diagram concepts:
                  </label>
                  <textarea
                    id={`mock-answer-${tq.question.id}`}
                    rows={4}
                    value={answers[tq.question.id] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [tq.question.id]: e.target.value }))}
                    placeholder="Describe how you would solve this, list key formulas, parameters, and diagram blocks. Scoring points are given for technical precision..."
                    className={`w-full rounded-lg border text-xs p-3 font-sans outline-none focus:border-indigo-500 ${
                      isDark 
                        ? "bg-slate-950 border-slate-800 text-slate-200" 
                        : "bg-slate-50 border-slate-250 text-slate-800"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center py-4">
            <button
              onClick={submitTest}
              className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs px-8 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-rose-600/10"
            >
              Finish and Evaluate Test
            </button>
          </div>

        </div>
      )}

      {/* Results Evaluation Dashboard */}
      {testMode !== null && !isActive && results && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Back button */}
          <button
            onClick={() => setTestMode(null)}
            className={`text-xs font-black uppercase text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer pb-2`}
          >
            ← Back to Simulator Menu
          </button>

          {/* Core Scorecard Grid */}
          <div className={`p-6 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center sm:text-left ${
            isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            {/* Score circle */}
            <div className="flex flex-col items-center justify-center border-r border-slate-150 dark:border-slate-800/80 pr-2">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${results.readinessIndex >= 60 ? 'text-emerald-500' : results.readinessIndex >= 35 ? 'text-amber-500' : 'text-rose-500'} transition-all`}
                    strokeWidth="3.5"
                    strokeDasharray={`${results.readinessIndex}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-none">{results.readinessIndex}%</span>
                  <span className="text-[8.5px] font-black text-slate-400 uppercase mt-0.5 tracking-wider">Ready</span>
                </div>
              </div>
            </div>

            {/* Diagnostics Stats */}
            <div className="space-y-2 sm:col-span-2">
              <span className={`text-[10px] font-black uppercase tracking-wider text-indigo-500`}>
                Sessional Diagnostic Assessment
              </span>
              <h3 className={`text-md font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Exam Scorecard: {results.totalScore} / {results.maxScore} Marks
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-550"}`}>
                You answered <span className="font-bold text-indigo-500">{results.questionsAnswered}</span> out of <span className="font-bold">{results.totalQuestions}</span> sessional modules. Highlighted below is your diagnostic priority roadmap.
              </p>
            </div>
          </div>

          {/* Module-by-Module Evaluation breakdown */}
          <div className="space-y-4">
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-800"}`}>
              Detailed Module Diagnostic
            </h4>

            {results.evaluated.map((eq: any, index: number) => {
              const hasDraft = !!answers[eq.question.id]?.trim();
              const isExcellent = eq.score === eq.maxScore;
              
              return (
                <div 
                  key={eq.question.id}
                  className={`p-6 rounded-2xl border space-y-4 ${
                    isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200 shadow-2xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-150 dark:border-slate-800 pb-2.5">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      Module {eq.moduleNum}: {eq.moduleTitle}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      hasDraft 
                        ? isExcellent ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                        : "bg-rose-500/10 text-rose-500"
                    }`}>
                      {hasDraft ? `Graded: ${eq.score}/${eq.maxScore} Marks` : "Skipped: 0 Marks"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h5 className={`text-xs.5 font-bold leading-relaxed ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {eq.question.question}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Concept: {eq.question.concept}
                    </p>
                  </div>

                  {/* Student Answer Draft Preview */}
                  {hasDraft && (
                    <div className={`p-4 rounded-xl border text-xs font-mono max-h-24 overflow-y-auto ${
                      isDark ? "bg-slate-950 border-slate-850 text-slate-350" : "bg-slate-50 border-slate-150 text-slate-650"
                    }`}>
                      <span className="block text-[9px] font-bold uppercase text-indigo-500 tracking-wider mb-1">Your Outline Draft:</span>
                      {answers[eq.question.id]}
                    </div>
                  )}

                  {/* Diagnostic feedback text */}
                  <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                    hasDraft 
                      ? isExcellent 
                        ? "bg-emerald-500/10 border-emerald-500/15 text-emerald-600 dark:text-emerald-400" 
                        : "bg-amber-500/10 border-amber-500/15 text-amber-600 dark:text-amber-400"
                      : "bg-rose-500/10 border-rose-500/15 text-rose-600 dark:text-rose-400"
                  }`}>
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block mb-0.5">Assigned Remediation:</span>
                      {eq.reviewNote}
                    </div>
                  </div>

                  {/* AI Tutor Grading Helper */}
                  <div className="pt-2 border-t border-slate-150 dark:border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() => fetchAIModelScheme(eq.question.id, eq.question.question, eq.question.concept, eq.moduleTitle)}
                      disabled={loadingSchemeId !== null}
                      className="text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {loadingSchemeId === eq.question.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Consulting Examiner Guidelines...
                        </>
                      ) : (
                        "Generate Examiner Grading Criteria ➜"
                      )}
                    </button>
                  </div>

                  {/* Scheme results block */}
                  {schemes[eq.question.id] && (
                    <div className={`p-4.5 rounded-xl border text-xs.5 leading-relaxed space-y-2 max-h-80 overflow-y-auto mt-3 ${
                      isDark ? "bg-slate-950 border-slate-850 text-slate-300" : "bg-indigo-50/20 border-indigo-100 text-slate-600"
                    }`}>
                      <span className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">AI Evaluation Criteria:</span>
                      <p className="whitespace-pre-line font-sans">{schemes[eq.question.id]}</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => startTest(testMode)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Retry Simulating This Paper
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
