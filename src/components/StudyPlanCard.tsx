import React, { useState, useEffect } from "react";
import { Calendar, Brain, Clock, Sparkles, BookOpen, Save, Loader2, RefreshCw, CheckCircle, HelpCircle } from "lucide-react";
import { Question, Subject } from "../data/backlogDataset";

interface StudyPlanCardProps {
  subject: Subject;
}

export default function StudyPlanCard({ subject }: StudyPlanCardProps) {
  const [timeline, setTimeline] = useState<string>("7 Days");
  const [confidence, setConfidence] = useState<string>("Low");
  const [weakModules, setWeakModules] = useState<string>("All Modules");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [studyPlan, setStudyPlan] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Load saved study plan if it exists
  useEffect(() => {
    const savedPlan = localStorage.getItem(`studyplan-${subject.id}`);
    if (savedPlan) {
      setStudyPlan(savedPlan);
    } else {
      setStudyPlan("");
    }
    setError("");
  }, [subject.id]);

  const generateStudyPlan = async () => {
    setLoading(true);
    setError("");
    setSavedSuccess(false);

    try {
      // Pass the top 5 highest recurrence questions from the subject
      const highYieldQuestions = [...subject.questions]
        .sort((a, b) => b.predictedRecurrence - a.predictedRecurrence)
        .slice(0, 5);

      const res = await fetch("/api/gemini/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectName: subject.name,
          code: subject.code,
          timeline: timeline,
          confidence: confidence,
          weakModules: weakModules,
          questionsList: highYieldQuestions
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      setStudyPlan(data.studyPlan || "Failed to generate study plan.");
      
      // Auto-save generated plan
      localStorage.setItem(`studyplan-${subject.id}`, data.studyPlan);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate study plan. Please verify the Gemini API server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = () => {
    if (!studyPlan) return;
    localStorage.setItem(`studyplan-${subject.id}`, studyPlan);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearPlan = () => {
    if (confirm("Are you sure you want to clear your saved study plan for this subject?")) {
      localStorage.removeItem(`studyplan-${subject.id}`);
      setStudyPlan("");
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      
      // Headers
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-md font-bold text-slate-800 mt-4 mb-2">{trimmed.replace("###", "").trim()}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-lg font-bold text-indigo-900 border-b border-indigo-50 pb-1 mt-5 mb-3">{trimmed.replace("##", "").trim()}</h3>;
      }
      if (trimmed.startsWith("#")) {
        return <h2 key={idx} className="text-xl font-extrabold text-indigo-950 mt-6 mb-4">{trimmed.replace("#", "").trim()}</h2>;
      }

      // Bullets
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const cleanText = trimmed.substring(1).trim();
        return (
          <li key={idx} className="ml-5 list-disc text-slate-600 mb-1.5 leading-relaxed text-sm">
            {formatBoldText(cleanText)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-600 text-sm leading-relaxed mb-3">
          {formatBoldText(trimmed)}
        </p>
      );
    });
  };

  const formatBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="study-plan-section" className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
        <h3 className="text-md font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          AI Backlog Recovery Plan
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Generate an optimized, high-yield cramming schedule focused entirely on statistically repeated questions to hit the passing 40 marks in minimum time.
        </p>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Timeline */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Preparation Timeline</label>
            <div className="relative">
              <select
                id="timeline-select"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="Today (Panic Cramming)">Today (Panic Cramming)</option>
                <option value="3 Days">3 Days (Critical Buffer)</option>
                <option value="7 Days">7 Days (Highly Recommended)</option>
                <option value="15 Days">15 Days (Comfortable Space)</option>
                <option value="1 Month">1 Month (Comprehensive Study)</option>
              </select>
            </div>
          </div>

          {/* Current Confidence */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Current Confidence Level</label>
            <select
              id="confidence-select"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="Extremely Low (0-10% Knowledge)">Extremely Low (0-10% Knowledge)</option>
              <option value="Low (Have a slight idea)">Low (Have a slight idea)</option>
              <option value="Medium (Prepared some basic modules)">Medium (Prepared some basic modules)</option>
            </select>
          </div>

          {/* Focus Modules */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Areas of Struggle</label>
            <select
              id="weak-modules-select"
              value={weakModules}
              onChange={(e) => setWeakModules(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="All Modules">All Modules (Blank Slate)</option>
              <option value="Module 1 & 2 (Math derivations)">Module 1 & 2 (Math derivations)</option>
              <option value="Module 3 & 4 (Theory & coding)">Module 3 & 4 (Theory & coding)</option>
              <option value="Module 5 (Advanced topics)">Module 5 (Advanced topics)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            id="btn-generate-plan"
            onClick={generateStudyPlan}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Drafting Timeline...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Tailored Study Plan
              </>
            )}
          </button>

          {studyPlan && (
            <button
              id="btn-clear-plan"
              onClick={handleClearPlan}
              className="px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Clear Saved Plan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs leading-relaxed flex items-start gap-2.5 animate-in fade-in">
          <HelpCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-800 block mb-0.5">Plan Compilation Failed</span>
            {error}
          </div>
        </div>
      )}

      {studyPlan && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm animate-in fade-in duration-200">
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-indigo-600" />
              <span className="text-xs font-bold text-slate-700">Active Study Calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-save-plan"
                onClick={handleSavePlan}
                className="flex items-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[11px] px-2.5 py-1 rounded cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                {savedSuccess ? "Saved Offline!" : "Save Plan"}
              </button>
            </div>
          </div>

          <div id="study-plan-output" className="p-6 space-y-3 bg-white text-slate-600 leading-relaxed font-sans max-h-[500px] overflow-y-auto">
            {renderMarkdown(studyPlan)}
          </div>

          <div className="bg-indigo-50/50 p-4 border-t border-slate-100/50 flex items-center gap-2 text-xs text-indigo-800">
            <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>This plan is backed by statistical exam frequency algorithms. Prioritize highlighted modules first!</span>
          </div>
        </div>
      )}
    </div>
  );
}
