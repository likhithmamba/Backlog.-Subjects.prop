import React, { useState, useEffect } from "react";
import { 
  Calendar, Award, Flame, Play, Clock, Sparkles, BookOpen, CheckSquare, 
  ChevronRight, CalendarIcon, AlertTriangle, ShieldCheck
} from "lucide-react";
import { Subject, Question } from "../data/backlogDataset";

interface DashboardInsightsProps {
  subject: Subject;
  questionStatus: Record<string, "todo" | "doing" | "done">;
  onSelectQuestion: (q: Question, moduleName: string) => void;
  theme: "dark" | "light";
}

export default function DashboardInsights({ subject, questionStatus, onSelectQuestion, theme }: DashboardInsightsProps) {
  const [examDate, setExamDate] = useState<string>("");
  const [lastQuestion, setLastQuestion] = useState<Question | null>(null);
  const [lastQuestionModuleName, setLastQuestionModuleName] = useState<string>("");

  // Load persistent configurations on mount & active subject change
  useEffect(() => {
    const savedDate = localStorage.getItem(`examdate-${subject.id}`);
    if (savedDate) {
      setExamDate(savedDate);
    } else {
      setExamDate("");
    }

    const lastQId = localStorage.getItem(`last-active-question-${subject.id}`);
    if (lastQId) {
      const qObj = subject.questions.find(q => q.id === lastQId);
      if (qObj) {
        setLastQuestion(qObj);
        const mod = subject.modules.find(m => m.number === qObj.module);
        setLastQuestionModuleName(mod ? mod.title : `Module ${qObj.module}`);
      } else {
        setLastQuestion(null);
      }
    } else {
      setLastQuestion(null);
    }
  }, [subject.id]);

  const handleSetExamDate = (dateVal: string) => {
    setExamDate(dateVal);
    localStorage.setItem(`examdate-${subject.id}`, dateVal);
  };

  // 1. Calculate Countdown
  const getDaysToExam = () => {
    if (!examDate) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(examDate);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysToExam();

  // 2. Identify "Study This Next" (highest recurrence question still todo/doing)
  const getStudyThisNext = () => {
    // Filter questions not completed yet
    const nonDone = subject.questions.filter(q => questionStatus[q.id] !== "done");
    if (nonDone.length === 0) return null;
    
    // Sort by predicted recurrence descending
    return [...nonDone].sort((a, b) => b.predictedRecurrence - a.predictedRecurrence)[0];
  };

  const studyNext = getStudyThisNext();
  const studyNextModule = studyNext
    ? subject.modules.find(m => m.number === studyNext.module)
    : null;

  // 3. Module Readiness and Weak Modules Summary
  const moduleReadiness = subject.modules.map(mod => {
    const questions = subject.questions.filter(q => q.module === mod.number);
    const completed = questions.filter(q => questionStatus[q.id] === "done").length;
    const total = questions.length || 1;
    const percentage = Math.round((completed / total) * 100);
    
    // Average recurrence of non-completed questions to find high-risk modules
    const nonCompleted = questions.filter(q => questionStatus[q.id] !== "done");
    const riskFactor = nonCompleted.length > 0
      ? Math.round(nonCompleted.reduce((sum, q) => sum + q.predictedRecurrence, 0) / nonCompleted.length)
      : 0;

    return {
      ...mod,
      completed,
      total,
      percentage,
      riskFactor
    };
  });

  const isDark = theme === "dark";

  return (
    <div id="dashboard-insights-panel" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT SECTION: Main Interactive Hub (8 cols) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Module 1: Study This Next (Primary, Above the fold) */}
        {studyNext ? (
          <div 
            id="study-this-next-module"
            className={`p-6 rounded-2xl border relative overflow-hidden transition-all duration-200 ${
              isDark 
                ? "bg-slate-900/90 border-indigo-500/30 shadow-indigo-950/20 shadow-md" 
                : "bg-white border-indigo-200 shadow-sm"
            }`}
          >
            {/* Visual background gradient elements */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-600/5 rounded-full blur-2xl" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4.5">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                🔥 High-Yield Focus Recommendation
              </span>
              <span className="text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2.5 py-0.5 rounded border border-rose-500/20">
                Statistical Weight: {studyNext.predictedRecurrence}% Recurrence
              </span>
            </div>

            <div className="space-y-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Module {studyNext.module}: {studyNextModule?.title}
              </span>
              <h3 className={`text-md.5 font-extrabold leading-snug ${isDark ? "text-slate-100" : "text-slate-950"}`}>
                {studyNext.question}
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-550"}`}>
                {studyNext.description}
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <button
                id="btn-study-now"
                onClick={() => onSelectQuestion(studyNext, studyNextModule?.title || "")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Analyze with AI Tutor
              </button>
              
              <span className={`text-[10px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Marks: {studyNext.marks}M • Difficulty: {studyNext.difficulty}
              </span>
            </div>
          </div>
        ) : (
          <div className={`p-6 rounded-2xl border text-center ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
          }`}>
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-extrabold text-sm">Subject Fully Mastered!</h3>
            <p className="text-xs text-slate-400 mt-1">You've marked all predicted exam questions as Completed. Generate a mock test to verify!</p>
          </div>
        )}

        {/* Module 3: Weak Modules Readiness */}
        <div className={`p-6 rounded-2xl border ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-slate-850"}`}>
              <CheckSquare className="w-4 h-4 text-indigo-500" />
              Syllabus Module Readiness Gauge
            </h3>
            <span className={`text-[10px] font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-550"}`}>
              Sessional Repeat Risk
            </span>
          </div>

          <div className="space-y-4">
            {moduleReadiness.map((mod) => {
              const isHighRisk = mod.percentage < 50 && mod.riskFactor > 75;
              return (
                <div key={mod.number} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className={`truncate max-w-[280px] ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      M{mod.number}: {mod.title}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isHighRisk 
                          ? "bg-rose-500/10 text-rose-500" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}>
                        {isHighRisk ? "⚠️ High Risk" : `${mod.completed}/${mod.total} Mastered`}
                      </span>
                      <span className={`w-8 text-right font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                        {mod.percentage}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        mod.percentage >= 80 
                          ? "bg-emerald-500" 
                          : mod.percentage >= 40 
                            ? "bg-amber-500" 
                            : "bg-indigo-500"
                      }`}
                      style={{ width: `${mod.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT SECTION: Quick Controls & Countdowns (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Module 2: Days to Exam Widget */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-2 mb-3.5 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Clock className="w-4.5 h-4.5 text-indigo-500" />
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Exam Ingestion Tracker
            </h4>
          </div>

          <div className="space-y-4">
            {daysLeft !== null ? (
              <div className="text-center py-3">
                <span className={`block text-3xl font-black ${
                  daysLeft <= 2 
                    ? "text-rose-500 animate-pulse" 
                    : daysLeft <= 7 
                      ? "text-amber-500" 
                      : "text-emerald-500"
                }`}>
                  {daysLeft < 0 ? "Exam Finished" : daysLeft === 0 ? "Exam Today!" : daysLeft === 1 ? "1 Day Left!" : `${daysLeft} Days`}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {daysLeft >= 0 ? "Countdown to Sessional" : "Clear local data for next subject"}
                </span>
              </div>
            ) : (
              <div className={`p-3 text-center border border-dashed rounded-xl ${
                isDark ? "bg-slate-950/50 border-slate-800 text-slate-500" : "bg-slate-50 text-slate-400"
              }`}>
                <CalendarIcon className="w-5 h-5 mx-auto mb-1.5 text-slate-400" />
                <span className="text-[10.5px] font-semibold block">Sessional Date Unset</span>
              </div>
            )}

            {/* Date Input */}
            <div className="space-y-1">
              <label className="block text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
                Modify Exam Schedule
              </label>
              <input
                type="date"
                id="exam-date-picker"
                value={examDate}
                onChange={(e) => handleSetExamDate(e.target.value)}
                className={`w-full text-xs font-bold rounded-lg p-2 border outline-none focus:border-indigo-500 ${
                  isDark 
                    ? "bg-slate-950 border-slate-800 text-slate-200" 
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Module 4: Continue Last Session Shortcut */}
        <div className={`p-5 rounded-2xl border ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Play className="w-4 h-4 text-indigo-500 shrink-0" />
            <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-800"}`}>
              Resumable Progress
            </h4>
          </div>

          {lastQuestion ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded">
                  {lastQuestionModuleName}
                </span>
                <p className={`font-extrabold text-[11.5px] line-clamp-2 leading-snug mt-1.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                  {lastQuestion.question}
                </p>
              </div>

              <button
                id="btn-resume-last-session"
                onClick={() => onSelectQuestion(lastQuestion, lastQuestionModuleName)}
                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10.5px] py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                Resume Analysis
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold py-2">
              No recent session found. Your progress will automatically update here as you analyze questions.
            </p>
          )}
        </div>

      </div>

    </div>
  );
}
