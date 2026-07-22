import React, { useState, useEffect } from "react";
import { 
  Search, BookOpen, Sparkles, Clock, Check, Bookmark, BookmarkCheck,
  ChevronRight, RefreshCw, AlertCircle, School, Grid, GraduationCap,
  Layers, Award, FileText, ChevronDown, CheckCircle, Activity, HelpCircle
} from "lucide-react";

import { 
  UNIVERSITIES, SCHEMES, BRANCHES, SUBJECTS_DATA, Question, Subject 
} from "./data/backlogDataset";

import ExplainModal from "./components/ExplainModal";
import StudyPlanCard from "./components/StudyPlanCard";
import NotesSection from "./components/NotesSection";
import ProgressTracker from "./components/ProgressTracker";
import ModuleHeatmap from "./components/ModuleHeatmap";
import PastPapersVault from "./components/PastPapersVault";
import BacklogShortlist from "./components/BacklogShortlist";
import OnboardingFlow from "./components/OnboardingFlow";
import DashboardInsights from "./components/DashboardInsights";
import FlashcardsView from "./components/FlashcardsView";
import MockTestView from "./components/MockTestView";

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  // Dropdown Selection States
  const [univ, setUniv] = useState<string>("");
  const [scheme, setScheme] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [sem, setSem] = useState<string>("");
  const [subjectId, setSubjectId] = useState<string>("");

  // App Main State
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [isExplainOpen, setIsExplainOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Persistent offline States (Saved in localStorage)
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  // Map of questionId -> status ("todo", "doing", "done")
  const [questionStatus, setQuestionStatus] = useState<Record<string, "todo" | "doing" | "done">>({});
  
  // Tab control in Subject Dashboard
  const [activeTab, setActiveTab] = useState<"shortlist" | "questions" | "study-plan" | "sessional-vault" | "flashcards" | "mock-tests">("shortlist");

  // API Key Warning state
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // High-precision layout helper to render each question card
  const renderQuestionCard = (q: Question) => {
    const isBookmarked = bookmarks.includes(q.id);
    const qStatus = questionStatus[q.id] || "todo";
    const isNoteAttached = !!localStorage.getItem(`notes-${currentSubject?.id}`) && 
      JSON.parse(localStorage.getItem(`notes-${currentSubject?.id}`) || "{}")[q.id];
    const yearsRange = [2021, 2022, 2023, 2024, 2025];
    const isDark = theme === "dark";
    
    return (
      <div 
        key={q.id}
        id={`question-card-${q.id}`}
        className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between space-y-3.5 hover:shadow-xs relative ${
          activeQuestion?.id === q.id 
            ? isDark
              ? "border-indigo-500 bg-indigo-950/30 ring-2 ring-indigo-500/20 shadow-xs"
              : "border-indigo-600 bg-indigo-50/15 ring-2 ring-indigo-600/5 shadow-xs" 
            : isDark
              ? "border-slate-850 bg-slate-900/60 text-slate-100 hover:border-slate-700"
              : "border-slate-200 bg-white hover:border-slate-350"
        }`}
      >
        {/* Top line metadata */}
        <div className={`flex flex-wrap items-center justify-between gap-1.5 border-b pb-2 ${
          isDark ? "border-slate-850" : "border-slate-50"
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider border ${
              isDark 
                ? "bg-indigo-950/40 text-indigo-400 border-indigo-950/50" 
                : "bg-indigo-50 text-indigo-700 border-indigo-100/30"
            }`}>
              {q.marks} Marks
            </span>
            <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              q.difficulty === "Easy"
                ? isDark
                  ? "text-emerald-400 bg-emerald-950/20 border border-emerald-950/40"
                  : "text-emerald-700 bg-emerald-50 border border-emerald-100"
                : q.difficulty === "Medium"
                  ? isDark
                    ? "text-amber-400 bg-amber-950/20 border border-amber-950/40"
                    : "text-amber-700 bg-amber-50 border border-amber-100"
                  : isDark
                    ? "text-rose-400 bg-rose-950/20 border border-rose-950/40"
                    : "text-rose-700 bg-rose-50 border border-rose-100"
            }`}>
              {q.difficulty}
            </span>
          </div>

          {/* Quick status progress modifier */}
          <button
            id={`status-badge-toggle-${q.id}`}
            onClick={() => cycleQuestionStatus(q.id)}
            className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-all border ${
              qStatus === "done"
                ? "bg-emerald-500 border-emerald-500 text-white"
                : qStatus === "doing"
                  ? "bg-amber-400 border-amber-400 text-white"
                  : isDark
                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 hover:border-slate-750"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            <div className={`w-1 h-1 rounded-full ${
              qStatus === "done" || qStatus === "doing" ? "bg-white" : "bg-slate-400"
            }`} />
            {qStatus.toUpperCase()}
          </button>
        </div>

        {/* Main core question content */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Concept Target:
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isDark ? "text-slate-300 bg-slate-800" : "text-slate-700 bg-slate-100"
            }`}>
              {q.concept}
            </span>
          </div>
          <h4 
            onClick={() => {
              setActiveQuestion(q);
              // Save as last active question
              if (currentSubject) {
                localStorage.setItem(`last-active-question-${currentSubject.id}`, q.id);
              }
            }}
            className={`text-xs.5 font-extrabold cursor-pointer leading-relaxed transition-colors mt-1 ${
              isDark 
                ? "text-slate-100 hover:text-indigo-400" 
                : "text-slate-850 hover:text-indigo-600"
            }`}
          >
            {q.question}
          </h4>
          {q.description && (
            <p className="text-[10.5px] text-slate-400 leading-snug font-medium italic mt-1 border-l-2 border-slate-700 pl-2">
              💡 {q.description}
            </p>
          )}
        </div>

        {/* Meticulous 5-Year Timeline Occurrence Grid */}
        <div className={`p-2.5 rounded-lg border space-y-1.5 ${
          isDark ? "bg-slate-950/60 border-slate-850" : "bg-slate-50/80 border-slate-150"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Last 5 Years Paper Records:
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
              isDark 
                ? "text-slate-300 bg-slate-900 border-slate-800" 
                : "text-slate-600 bg-white border-slate-200/60"
            }`}>
              Freq: {q.years.filter(y => yearsRange.includes(y)).length} / 5 Years
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 pt-1">
            {yearsRange.map(yr => {
              const isAsked = q.years.includes(yr);
              return (
                <div 
                  key={yr}
                  className={`text-center py-1 rounded text-[9px] font-black transition-all border flex flex-col justify-between ${
                    isAsked 
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-xs shadow-emerald-500/10 font-black" 
                      : isDark
                        ? "bg-slate-900 border-slate-800 text-slate-500 font-bold"
                        : "bg-slate-100 border-slate-200/60 text-slate-400 font-bold"
                  }`}
                  title={isAsked ? `Asked in final exam year ${yr}` : `Not asked in ${yr}`}
                >
                  <span className="block opacity-90">{yr}</span>
                  <span className={`block text-[8px] mt-0.5 uppercase ${
                    isAsked ? "text-emerald-100 font-extrabold" : "text-slate-500"
                  }`}>
                    {isAsked ? "ASKED" : "N/A"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictive scoring and bookmarks indicators */}
        <div className={`flex items-center justify-between text-[10px] border-t pt-2.5 ${
          isDark ? "border-slate-850" : "border-slate-100"
        }`}>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-emerald-500">
              Sessional Recurrence: {q.predictedRecurrence}%
            </span>
          </div>
          
          {isNoteAttached && (
            <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] border ${
              isDark 
                ? "text-indigo-400 bg-indigo-950/20 border-indigo-950/30" 
                : "text-indigo-600 bg-indigo-50 border-indigo-100/30"
            }`}>
              Study Notes Attached
            </span>
          )}
        </div>

        {/* Action button layout */}
        <div className={`flex items-center justify-between border-t pt-2.5 ${
          isDark ? "border-slate-850" : "border-slate-100"
        }`}>
          <button
            id={`bookmark-${q.id}`}
            onClick={() => toggleBookmark(q.id)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
              isDark 
                ? "text-slate-400 hover:text-indigo-400 border-slate-800 bg-slate-900" 
                : "text-slate-400 hover:text-indigo-600 border-slate-200/60 bg-white"
            }`}
            title="Toggle study shortlist bookmark"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
            ) : (
              <Bookmark className="w-4 h-4 text-slate-400" />
            )}
          </button>

          <button
            id={`explain-trigger-${q.id}`}
            onClick={() => {
              setActiveQuestion(q);
              setIsExplainOpen(true);
              if (currentSubject) {
                localStorage.setItem(`last-active-question-${currentSubject.id}`, q.id);
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-250" />
            Solve with AI Tutor
          </button>
        </div>
      </div>
    );
  };

  // Check backend health / API key configuration on mount
  useEffect(() => {
    fetch("/api/check-key")
      .then(res => res.json())
      .then(data => {
        setHasApiKey(data.configured);
      })
      .catch(() => {
        // Fallback or offline dev mode
        setHasApiKey(true); 
      });
  }, []);

  // Load bookmarks and progress from localStorage
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("backlog-bookmarks");
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error(e);
      }
    }

    const savedProgress = localStorage.getItem("backlog-progress");
    if (savedProgress) {
      try {
        setQuestionStatus(JSON.parse(savedProgress));
      } catch (e) {
        console.error(e);
      }
    }

    // Try loading last selected subject ID
    const savedSubjectId = localStorage.getItem("last-subject-id");
    if (savedSubjectId) {
      const found = SUBJECTS_DATA.find(s => s.id === savedSubjectId);
      if (found) {
        setCurrentSubject(found);
        setUniv(found.university);
        setScheme(found.scheme);
        setBranch(found.branch);
        setSem(String(found.semester));
        setSubjectId(found.id);
      }
    }
  }, []);

  // Sync bookmarks to localStorage
  const toggleBookmark = (qId: string) => {
    let updated: string[];
    if (bookmarks.includes(qId)) {
      updated = bookmarks.filter(id => id !== qId);
    } else {
      updated = [...bookmarks, qId];
    }
    setBookmarks(updated);
    localStorage.setItem("backlog-bookmarks", JSON.stringify(updated));
  };

  // Cycle through states: "todo" -> "doing" -> "done" -> "todo"
  const cycleQuestionStatus = (qId: string) => {
    const current = questionStatus[qId] || "todo";
    let next: "todo" | "doing" | "done" = "todo";
    if (current === "todo") next = "doing";
    else if (current === "doing") next = "done";

    const updated = { ...questionStatus, [qId]: next };
    setQuestionStatus(updated);
    localStorage.setItem("backlog-progress", JSON.stringify(updated));
  };

  // Filter subjects based on selected criteria
  const availableSubjects = SUBJECTS_DATA.filter((sub) => {
    return (
      (!univ || sub.university === univ) &&
      (!scheme || sub.scheme === scheme) &&
      (!branch || sub.branch === branch) &&
      (!sem || String(sub.semester) === sem)
    );
  });

  const handleSelectSubject = (subject: Subject) => {
    setCurrentSubject(subject);
    setSubjectId(subject.id);
    localStorage.setItem("last-subject-id", subject.id);
    setActiveQuestion(null);
    setSearchQuery("");
  };

  const handleResetSubjectSelection = () => {
    setCurrentSubject(null);
    setSubjectId("");
    localStorage.removeItem("last-subject-id");
  };

  const handleFastTrack = (subId: string) => {
    const found = SUBJECTS_DATA.find(s => s.id === subId);
    if (found) {
      setUniv(found.university);
      setScheme(found.scheme);
      setBranch(found.branch);
      setSem(String(found.semester));
      handleSelectSubject(found);
    }
  };

  // Filtered list of questions based on search query
  const filteredQuestions = currentSubject
    ? currentSubject.questions.filter((q) => {
        const query = searchQuery.toLowerCase();
        return (
          q.question.toLowerCase().includes(query) ||
          q.concept.toLowerCase().includes(query) ||
          q.years.some(y => String(y).includes(query))
        );
      })
    : [];

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col antialiased font-sans transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-400 ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* Global Navigation Header */}
      <header className={`border-b sticky top-0 z-40 shadow-sm print:hidden transition-colors ${
        isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-950"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-md font-extrabold tracking-tight">BacklogAI</h1>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  isDark ? "bg-slate-850 text-slate-400" : "bg-slate-100 text-slate-500"
                }`}>v2</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Statistical Analysis & Active Recall Cramming Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                localStorage.setItem("theme", next);
              }}
              className={`p-2 rounded-lg border transition-colors cursor-pointer text-xs font-black uppercase flex items-center gap-1.5 ${
                isDark 
                  ? "bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-750" 
                  : "bg-slate-100 border-slate-250 text-slate-600 hover:bg-slate-200"
              }`}
              title="Toggle theme visualizer"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>

            {!hasApiKey && (
              <div className="hidden md:flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[11px] text-amber-500 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>AI Tutoring Offline</span>
              </div>
            )}
            
            {currentSubject && (
              <button
                id="btn-nav-reset"
                onClick={handleResetSubjectSelection}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  isDark 
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200" 
                    : "bg-slate-150 hover:bg-slate-200 text-slate-700"
                }`}
              >
                Change Subject
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        
        {/* Selection Screen (No Active Subject) */}
        {!currentSubject ? (
          <OnboardingFlow 
            onSelectSubject={handleSelectSubject}
            onFastTrack={handleFastTrack}
            theme={theme}
          />
        ) : false ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            
            {/* Greeting / Philosophy Intro */}
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Pass Your Backlogs with Mathematical Certainty.
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
                We've cleaned and parsed previous years' engineering papers. Stop wasting weeks reading thousands of dry slides. Focus 100% of your cramming on top-predicted questions and explain them instantly using Gemini.
              </p>
            </div>

            {/* Fast-Track Shortcuts */}
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
                ⚡ Fast-Track Backlog Shortlists
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  id="fast-track-dc"
                  onClick={() => handleFastTrack("vtu-ece-5-dc")}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-100 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <span className="block text-xs text-slate-400 font-bold group-hover:text-indigo-600 transition-colors">VTU • 2021 Scheme • ECE</span>
                  <span className="block font-bold text-slate-700 text-sm mt-0.5">Digital Communication</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">9 High-yield past questions ready</span>
                </button>
                <button
                  id="fast-track-dbms"
                  onClick={() => handleFastTrack("vtu-cse-5-dbms")}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-100 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <span className="block text-xs text-slate-400 font-bold group-hover:text-indigo-600 transition-colors">VTU • 2021 Scheme • CSE</span>
                  <span className="block font-bold text-slate-700 text-sm mt-0.5">Database Management</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">6 High-yield normalizations & locks</span>
                </button>
                <button
                  id="fast-track-cn"
                  onClick={() => handleFastTrack("vtu-cse-5-cn")}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/30 border border-slate-100 hover:border-indigo-100 rounded-lg text-left transition-all cursor-pointer group"
                >
                  <span className="block text-xs text-slate-400 font-bold group-hover:text-indigo-600 transition-colors">VTU • 2021 Scheme • CSE</span>
                  <span className="block font-bold text-slate-700 text-sm mt-0.5">Computer Networks</span>
                  <span className="text-[10px] text-slate-400 mt-1 block">3 Core transport & routing derivations</span>
                </button>
              </div>
            </div>

            {/* Dynamic Step-by-Step Config Grid */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-2 flex items-center gap-2">
                <School className="w-4 h-4 text-slate-500" />
                Custom Ingestion Selector
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* University Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-slate-400" />
                    1. Choose University
                  </label>
                  <select
                    id="univ-select"
                    value={univ}
                    onChange={(e) => { setUniv(e.target.value); setSubjectId(""); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="">-- All Universities --</option>
                    {UNIVERSITIES.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                {/* Scheme Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    2. Choose Syllabus Scheme
                  </label>
                  <select
                    id="scheme-select"
                    value={scheme}
                    onChange={(e) => { setScheme(e.target.value); setSubjectId(""); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="">-- All Schemes --</option>
                    {SCHEMES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Branch Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-slate-400" />
                    3. Choose Branch
                  </label>
                  <select
                    id="branch-select"
                    value={branch}
                    onChange={(e) => { setBranch(e.target.value); setSubjectId(""); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="">-- All Branches --</option>
                    {BRANCHES.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Semester Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    4. Choose Semester
                  </label>
                  <select
                    id="sem-select"
                    value={sem}
                    onChange={(e) => { setSem(e.target.value); setSubjectId(""); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="">-- All Semesters --</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={String(s)}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Subject Selection */}
              <div className="space-y-1.5 border-t border-slate-100 pt-4">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  🎯 Step 5: Filtered Subject Output
                </label>
                {availableSubjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSubjects.map((sub) => {
                      const isSelected = subjectId === sub.id;
                      return (
                        <div
                          key={sub.id}
                          id={`subj-card-${sub.id}`}
                          onClick={() => handleSelectSubject(sub)}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between group ${
                            isSelected 
                              ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/10" 
                              : "border-slate-250 hover:border-indigo-400 bg-white shadow-xs"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded tracking-wider">
                                {sub.code}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">
                                Sem {sub.semester} • {sub.branch}
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-sm mt-2 group-hover:text-indigo-600 transition-colors">{sub.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {sub.university} • {sub.questions.length} High-Yield Past Questions
                            </p>
                          </div>
                          <ChevronRight className="w-4.5 h-4.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all mt-1" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <p className="text-xs font-medium">No pre-compiled papers found matching this selection.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Try resetting filters or use the presets or complete list below.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Complete Subjects Directory (Visual Card Grid for 1-Click Access) */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 space-y-5">
              <div className="border-b border-slate-150 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                    📚 Complete Subjects Directory
                  </span>
                  <h3 className="text-md font-extrabold text-slate-900 mt-2">
                    Browse All Curated Subjects ({SUBJECTS_DATA.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select any subject below to load its fully verified, module-wise exam question analysis instantly.
                  </p>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded self-start sm:self-center border border-emerald-100">
                  ⚡ 100% Real-World Question Syllabus
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SUBJECTS_DATA.map((sub) => {
                  return (
                    <div
                      key={sub.id}
                      id={`direct-card-${sub.id}`}
                      onClick={() => handleSelectSubject(sub)}
                      className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/10 text-left transition-all cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 px-2 py-0.5 rounded uppercase tracking-wider transition-colors">
                            {sub.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Sem {sub.semester} • {sub.branch}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm mt-3 group-hover:text-indigo-600 transition-colors">
                          {sub.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          Includes {sub.modules.length} modules: {sub.modules.map(m => m.title).join(", ")}.
                        </p>
                      </div>

                      <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {sub.questions.length} High-Yield Past Questions
                        </span>
                        <span className="text-[10px] font-extrabold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                          Analyze Question Bank ➜
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Active Subject Dashboard */
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Breadcrumb Header */}
            <div className={`rounded-xl border p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden transition-colors ${
              isDark ? "bg-slate-900 border-slate-850 text-slate-100" : "bg-white border-slate-200/80"
            }`}>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{univ}</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{scheme} Scheme</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{branch}</span>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sem {sem}</span>
                </div>
                <h2 className={`text-xl font-black mt-1 flex items-center gap-2 ${
                  isDark ? "text-slate-100" : "text-slate-900"
                }`}>
                  {currentSubject.name} 
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                    isDark ? "bg-indigo-950/40 text-indigo-400 border-indigo-950/50" : "bg-indigo-50 text-indigo-600 border-indigo-100/30"
                  }`}>
                    {currentSubject.code}
                  </span>
                </h2>
              </div>
              <button
                id="btn-nav-reset-body"
                onClick={handleResetSubjectSelection}
                className={`text-xs font-semibold border px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                  isDark 
                    ? "text-indigo-400 bg-indigo-950/20 border-indigo-950/40 hover:bg-indigo-950/40" 
                    : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100/60 border-indigo-100"
                }`}
              >
                Reset Configuration
              </button>
            </div>

            {/* Custom Ingestion / Active Subject Selector Dropdown Panel (Answers "where is the subject selector") */}
            <div className={`rounded-xl border p-4 shadow-xs space-y-3.5 print:hidden transition-colors ${
              isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-200/80"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                  isDark ? "text-indigo-400" : "text-indigo-700"
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  Active Custom Ingestion Selector
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Switch universities, branches, or subjects instantly below
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* University Selector */}
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">1. University</span>
                  <select
                    id="active-univ-select"
                    value={univ}
                    onChange={(e) => { 
                      const val = e.target.value; 
                      setUniv(val); 
                      // Auto select first subject matching if available
                      const matching = SUBJECTS_DATA.filter(s => (!val || s.university === val) && (!scheme || s.scheme === scheme) && (!branch || s.branch === branch) && (!sem || String(s.semester) === sem));
                      if (matching.length > 0) handleSelectSubject(matching[0]);
                    }}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    {UNIVERSITIES.map(u => (
                      <option key={u.id} value={u.id}>{u.id}</option>
                    ))}
                  </select>
                </div>

                {/* Scheme Selector */}
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">2. Scheme</span>
                  <select
                    id="active-scheme-select"
                    value={scheme}
                    onChange={(e) => { 
                      const val = e.target.value; 
                      setScheme(val); 
                      const matching = SUBJECTS_DATA.filter(s => (!univ || s.university === univ) && (!val || s.scheme === val) && (!branch || s.branch === branch) && (!sem || String(s.semester) === sem));
                      if (matching.length > 0) handleSelectSubject(matching[0]);
                    }}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    {SCHEMES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Branch Selector */}
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">3. Branch</span>
                  <select
                    id="active-branch-select"
                    value={branch}
                    onChange={(e) => { 
                      const val = e.target.value; 
                      setBranch(val); 
                      const matching = SUBJECTS_DATA.filter(s => (!univ || s.university === univ) && (!scheme || s.scheme === scheme) && (!val || s.branch === val) && (!sem || String(s.semester) === sem));
                      if (matching.length > 0) handleSelectSubject(matching[0]);
                    }}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    {BRANCHES.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Semester Selector */}
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">4. Semester</span>
                  <select
                    id="active-sem-select"
                    value={sem}
                    onChange={(e) => { 
                      const val = e.target.value; 
                      setSem(val); 
                      const matching = SUBJECTS_DATA.filter(s => (!univ || s.university === univ) && (!scheme || s.scheme === scheme) && (!branch || s.branch === branch) && (!val || String(s.semester) === val));
                      if (matching.length > 0) handleSelectSubject(matching[0]);
                    }}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-indigo-500 font-bold cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={String(s)}>Sem {s}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Selector */}
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-indigo-700 uppercase tracking-wider block">5. Active Subject</span>
                  <select
                    id="active-subject-select"
                    value={subjectId}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = SUBJECTS_DATA.find(s => s.id === val);
                      if (found) handleSelectSubject(found);
                    }}
                    className="w-full bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs text-indigo-950 outline-none focus:border-indigo-500 font-extrabold cursor-pointer"
                  >
                    {SUBJECTS_DATA.filter(s => 
                      (!univ || s.university === univ) && 
                      (!scheme || s.scheme === scheme) && 
                      (!branch || s.branch === branch) && 
                      (!sem || String(s.semester) === sem)
                    ).map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Core Diagnostic Dashboard Insights */}
            <DashboardInsights
              subject={currentSubject}
              questionStatus={questionStatus}
              onSelectQuestion={(q, modName) => {
                setActiveQuestion(q);
                setIsExplainOpen(true);
              }}
              theme={theme}
            />

            {/* Dashboard tabs */}
            <div className={`flex border-b overflow-x-auto print:hidden no-scrollbar ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}>
              <button
                id="tab-view-shortlist"
                onClick={() => setActiveTab("shortlist")}
                className={`flex items-center gap-2 px-5 py-3 text-xs.5 font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "shortlist"
                    ? isDark ? "border-indigo-400 text-indigo-400" : "border-indigo-600 text-indigo-600 font-black"
                    : isDark ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Sessional Shortlist
              </button>
              <button
                id="tab-view-questions"
                onClick={() => setActiveTab("questions")}
                className={`flex items-center gap-2 px-5 py-3 text-xs.5 font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "questions"
                    ? isDark ? "border-indigo-400 text-indigo-400" : "border-indigo-600 text-indigo-600 font-black"
                    : isDark ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <FileText className="w-4 h-4" />
                Statistical Question Bank ({filteredQuestions.length})
              </button>
              <button
                id="tab-view-flashcards"
                onClick={() => setActiveTab("flashcards")}
                className={`flex items-center gap-2 px-5 py-3 text-xs.5 font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "flashcards"
                    ? isDark ? "border-indigo-400 text-indigo-400" : "border-indigo-600 text-indigo-600 font-black"
                    : isDark ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Layers className="w-4 h-4" />
                Active Recall Flashcards
              </button>
              <button
                id="tab-view-mocktests"
                onClick={() => setActiveTab("mock-tests")}
                className={`flex items-center gap-2 px-5 py-3 text-xs.5 font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "mock-tests"
                    ? isDark ? "border-indigo-400 text-indigo-400" : "border-indigo-600 text-indigo-600 font-black"
                    : isDark ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Award className="w-4 h-4" />
                Time-Boxed Mock Tests
              </button>
              <button
                id="tab-view-planner"
                onClick={() => setActiveTab("study-plan")}
                className={`flex items-center gap-2 px-5 py-3 text-xs.5 font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "study-plan"
                    ? isDark ? "border-indigo-400 text-indigo-400" : "border-indigo-600 text-indigo-600 font-black"
                    : isDark ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Clock className="w-4 h-4" />
                Custom Study Timeline
              </button>
              <button
                id="tab-view-vault"
                onClick={() => setActiveTab("sessional-vault")}
                className={`flex items-center gap-2 px-5 py-3 text-xs.5 font-extrabold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "sessional-vault"
                    ? isDark ? "border-indigo-400 text-indigo-400" : "border-indigo-600 text-indigo-600 font-black"
                    : isDark ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                10-Papers Sessional Hub
              </button>
            </div>

            {/* Dashboard Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
              
              {/* Left Column (Primary View) */}
              <div className="lg:col-span-8 space-y-6 print:w-full">
                {activeTab === "shortlist" ? (
                  <BacklogShortlist 
                    subject={currentSubject}
                    onSolveQuestion={(q) => {
                      setActiveQuestion(q);
                      setIsExplainOpen(true);
                    }}
                    questionStatus={questionStatus}
                    toggleStatus={cycleQuestionStatus}
                  />
                ) : activeTab === "questions" ? (
                  <>
                    {/* Search & Statistics Overview */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                      <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      <input
                        id="question-search-bar"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search questions, core concepts, or specific exam years (e.g. '2023')..."
                        className="w-full bg-transparent text-sm outline-none placeholder-slate-400 text-slate-700"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Question List Grouped by Modules with Part A & Part B choice division */}
                    <div className="space-y-6">
                      {currentSubject.modules.map((mod) => {
                        // Filter questions for this module & search query
                        const moduleQuestions = filteredQuestions.filter(q => q.module === mod.number);
                        
                        if (moduleQuestions.length === 0 && searchQuery) return null;

                        const partAQuestions = moduleQuestions.filter(q => q.part === "Part A");
                        const partBQuestions = moduleQuestions.filter(q => q.part === "Part B");

                        return (
                          <div 
                            key={mod.number} 
                            id={`module-group-${mod.number}`}
                            className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
                          >
                            {/* Module Header */}
                            <div className="bg-slate-50/70 border-b border-slate-200/60 p-4 space-y-3.5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-black tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100/40 px-2.5 py-1 rounded">
                                    MODULE {mod.number} STRUCTURE
                                  </span>
                                  <h3 className="font-extrabold text-slate-900 text-sm mt-2">{mod.title}</h3>
                                </div>
                                <span className="text-[10px] font-extrabold text-indigo-600 bg-white border border-indigo-100/60 px-2.5 py-1 rounded shadow-xs self-start sm:self-center">
                                  {moduleQuestions.length} Total Curated Questions
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{mod.description}</p>
                              
                              {/* New High-Precision Exam Heatmap Bar & Comparative Grid */}
                              <ModuleHeatmap subject={currentSubject} currentModuleNumber={mod.number} />
                            </div>

                            {/* Dual-Column Choice Section (Side-by-Side on Desktop) */}
                            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                              
                              {/* Left Column: Part A Choices */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between pb-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                      Part A Choice Questions
                                    </h4>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                    {partAQuestions.length} Option{partAQuestions.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="space-y-4">
                                  {partAQuestions.length > 0 ? (
                                    partAQuestions.map(q => renderQuestionCard(q))
                                  ) : (
                                    <div className="py-8 text-center text-slate-400 border border-dashed border-slate-250/60 rounded-xl bg-slate-50/40 text-xs font-semibold italic">
                                      No Part A questions found matching search.
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right Column: Part B Choices */}
                              <div className="space-y-4 pt-6 lg:pt-0 lg:pl-6">
                                <div className="flex items-center justify-between pb-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                                      Part B Choice Questions
                                    </h4>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                    {partBQuestions.length} Option{partBQuestions.length !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="space-y-4">
                                  {partBQuestions.length > 0 ? (
                                    partBQuestions.map(q => renderQuestionCard(q))
                                  ) : (
                                    <div className="py-8 text-center text-slate-400 border border-dashed border-slate-250/60 rounded-xl bg-slate-50/40 text-xs font-semibold italic">
                                      No Part B questions found matching search.
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : activeTab === "flashcards" ? (
                  <FlashcardsView subject={currentSubject} theme={theme} />
                ) : activeTab === "mock-tests" ? (
                  <MockTestView subject={currentSubject} theme={theme} />
                ) : activeTab === "study-plan" ? (
                  /* Custom Timeline/Plan Card */
                  <StudyPlanCard subject={currentSubject} />
                ) : (
                  /* Interactive 10-Papers Sessional Vault & Softcopy Compiler */
                  <PastPapersVault subject={currentSubject} />
                )}
              </div>

              {/* Right Column (Widgets / Progress Tracking / Bookmarks) */}
              <div className="lg:col-span-4 space-y-6 print:hidden">
                
                {/* Progress Widget */}
                <ProgressTracker 
                  subject={currentSubject} 
                  questionStatus={questionStatus} 
                />

                {/* Local Notes Box */}
                <NotesSection 
                  subject={currentSubject}
                  activeQuestion={activeQuestion}
                />

                {/* Offline Bookmark Drawer */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-50 pb-2">
                    <Bookmark className="w-4 h-4 text-indigo-600" />
                    Offline Bookmark Board ({bookmarks.length})
                  </h3>

                  {bookmarks.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {currentSubject.questions
                        .filter(q => bookmarks.includes(q.id))
                        .map((q) => (
                          <div 
                            key={q.id}
                            onClick={() => setActiveQuestion(q)}
                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                              activeQuestion?.id === q.id 
                                ? "bg-indigo-50/50 border-indigo-200" 
                                : "bg-slate-50/50 border-slate-100 hover:bg-slate-50"
                            }`}
                          >
                            <span className="text-[9px] font-bold text-indigo-600 block">Concept: {q.concept}</span>
                            <p className="text-xs text-slate-600 font-bold line-clamp-2 leading-snug mt-0.5">
                              {q.question}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No bookmarked questions yet. Click the ribbon icon on any question row to pin it here.
                    </div>
                  )}
                </div>

                {/* Fast Recall Mode Box */}
                <div className="p-5 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl text-white space-y-3 shadow-md shadow-indigo-950/10">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4.5 h-4.5 text-indigo-300" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Fast-Solve Tutorial</h3>
                  </div>
                  <p className="text-[11px] text-indigo-200 leading-relaxed">
                    Click the <strong>Solve</strong> button next to any question. You will activate a custom AI agent which details the ideal diagram, provides formulas, and tests you with interactive MCQs to guarantee memorization.
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* Explain & Solve Modal */}
      {isExplainOpen && activeQuestion && currentSubject && (
        <ExplainModal
          question={activeQuestion}
          subjectName={currentSubject.name}
          moduleName={`Module ${activeQuestion.module}`}
          onClose={() => setIsExplainOpen(false)}
        />
      )}

      {/* Simple Global Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400 space-y-2">
          <p>
            <strong>BacklogAI v2</strong> is fully localized, low-cost, and optimized for immediate offline exam retention.
          </p>
          <p className="text-[10px]">
            Made to help students pass college backlog back-and-forth challenges seamlessly. Double-check local syllabus codes.
          </p>
        </div>
      </footer>

    </div>
  );
}
