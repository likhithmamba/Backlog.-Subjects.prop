import React, { useState, useEffect } from "react";
import { 
  School, Layers, Grid, Activity, BookOpen, ChevronRight, ChevronLeft, 
  Sparkles, RefreshCw, GraduationCap, ArrowRight, HelpCircle, AlertCircle
} from "lucide-react";
import { 
  UNIVERSITIES, SCHEMES, BRANCHES, SUBJECTS_DATA, Subject 
} from "../data/backlogDataset";

interface OnboardingFlowProps {
  onSelectSubject: (sub: Subject) => void;
  onFastTrack: (subId: string) => void;
  theme: "dark" | "light";
}

export default function OnboardingFlow({ onSelectSubject, onFastTrack, theme }: OnboardingFlowProps) {
  // Steps: 
  // 0: University 
  // 1: Scheme
  // 2: Branch
  // 3: Semester
  // 4: Subject Select
  const [step, setStep] = useState<number>(0);
  const [selectedUniv, setSelectedUniv] = useState<string>("");
  const [selectedScheme, setSelectedScheme] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedSem, setSelectedSem] = useState<string>("");

  // Load state from localStorage on mount for Resume support
  useEffect(() => {
    const savedStep = localStorage.getItem("onboarding-step");
    const savedUniv = localStorage.getItem("onboarding-univ");
    const savedScheme = localStorage.getItem("onboarding-scheme");
    const savedBranch = localStorage.getItem("onboarding-branch");
    const savedSem = localStorage.getItem("onboarding-sem");

    if (savedStep !== null) {
      setStep(Number(savedStep));
    }
    if (savedUniv) setSelectedUniv(savedUniv);
    if (savedScheme) setSelectedScheme(savedScheme);
    if (savedBranch) setSelectedBranch(savedBranch);
    if (savedSem) setSelectedSem(savedSem);
  }, []);

  // Sync state to localStorage on modification
  const saveState = (newStep: number, u = selectedUniv, s = selectedScheme, b = selectedBranch, semVal = selectedSem) => {
    setStep(newStep);
    localStorage.setItem("onboarding-step", String(newStep));
    localStorage.setItem("onboarding-univ", u);
    localStorage.setItem("onboarding-scheme", s);
    localStorage.setItem("onboarding-branch", b);
    localStorage.setItem("onboarding-sem", semVal);
  };

  const resetOnboarding = () => {
    setSelectedUniv("");
    setSelectedScheme("");
    setSelectedBranch("");
    setSelectedSem("");
    saveState(0, "", "", "", "");
  };

  // Helper to filter available subjects based on selection at each stage
  const getFilteredSubjects = (univVal = selectedUniv, schemeVal = selectedScheme, branchVal = selectedBranch, semVal = selectedSem) => {
    return SUBJECTS_DATA.filter(sub => {
      return (
        (!univVal || sub.university === univVal) &&
        (!schemeVal || sub.scheme === schemeVal) &&
        (!branchVal || sub.branch === branchVal) &&
        (!semVal || String(sub.semester) === semVal)
      );
    });
  };

  // Check if a step option is disabled based on available datasets
  const isOptionAvailable = (type: "univ" | "scheme" | "branch" | "sem", val: string) => {
    let tempUniv = selectedUniv;
    let tempScheme = selectedScheme;
    let tempBranch = selectedBranch;
    let tempSem = selectedSem;

    if (type === "univ") tempUniv = val;
    if (type === "scheme") tempScheme = val;
    if (type === "branch") tempBranch = val;
    if (type === "sem") tempSem = val;

    // See if there's any subject in our database matching this specific path
    const matching = SUBJECTS_DATA.filter(sub => {
      return (
        (!tempUniv || sub.university === tempUniv) &&
        (!tempScheme || sub.scheme === tempScheme) &&
        (!tempBranch || sub.branch === tempBranch) &&
        (!tempSem || String(sub.semester) === tempSem)
      );
    });
    return matching.length > 0;
  };

  const handleSelectUniv = (uId: string) => {
    setSelectedUniv(uId);
    saveState(1, uId);
  };

  const handleSelectScheme = (sId: string) => {
    setSelectedScheme(sId);
    saveState(2, selectedUniv, sId);
  };

  const handleSelectBranch = (bId: string) => {
    setSelectedBranch(bId);
    saveState(3, selectedUniv, selectedScheme, bId);
  };

  const handleSelectSem = (semVal: string) => {
    setSelectedSem(semVal);
    saveState(4, selectedUniv, selectedScheme, selectedBranch, semVal);
  };

  const goBack = () => {
    if (step > 0) {
      saveState(step - 1);
    }
  };

  // Subjects available for step 4
  const finalSubjects = getFilteredSubjects();

  const isDark = theme === "dark";

  return (
    <div id="onboarding-wizard" className="max-w-4xl mx-auto space-y-8 py-4 animate-in fade-in duration-200">
      
      {/* Onboarding Header with Progress Bar */}
      <div className={`p-6 rounded-2xl border transition-all duration-200 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <GraduationCap className="w-5.5 h-5.5" />
            </div>
            <div>
              <h2 className={`text-md font-black uppercase tracking-wider ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Backlog Clearance Engine
              </h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Configure your academic profile to load relevant question predictions.
              </p>
            </div>
          </div>
          
          {/* Step Indicator */}
          <div className="text-right">
            <span className={`text-xs font-bold uppercase ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
              Step {step + 1} of 5
            </span>
            <div className={`text-[10px] font-extrabold ${isDark ? "text-slate-400" : "text-slate-500"} mt-0.5`}>
              {step === 0 && "University Ingestion"}
              {step === 1 && "Syllabus Scheme"}
              {step === 2 && "Engineering Branch"}
              {step === 3 && "Active Semester"}
              {step === 4 && "Select Subject"}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${(step + 1) * 20}%` }}
          />
        </div>

        {/* Selected crumbs navigation for rapid back tracking */}
        {step > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
            <button 
              onClick={() => saveState(0)} 
              className={`hover:text-indigo-600 transition-colors ${isDark ? "text-slate-300" : "text-slate-600"}`}
            >
              {selectedUniv || "Univ"}
            </button>
            {step >= 1 && <span className="text-slate-350">/</span>}
            
            {step > 1 && (
              <button 
                onClick={() => saveState(1)} 
                className={`hover:text-indigo-600 transition-colors ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                {selectedScheme ? `Scheme ${selectedScheme}` : "Scheme"}
              </button>
            )}
            {step >= 2 && <span className="text-slate-350">/</span>}

            {step > 2 && (
              <button 
                onClick={() => saveState(2)} 
                className={`hover:text-indigo-600 transition-colors ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                {selectedBranch || "Branch"}
              </button>
            )}
            {step >= 3 && <span className="text-slate-350">/</span>}

            {step > 3 && (
              <button 
                onClick={() => saveState(3)} 
                className={`hover:text-indigo-600 transition-colors ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                {selectedSem ? `Sem ${selectedSem}` : "Sem"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Step Contents */}
      <div className="min-h-[260px] flex flex-col justify-between">
        
        {/* Step 0: University */}
        {step === 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              Which university is your backlog registered with?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {UNIVERSITIES.map((u) => {
                const selected = selectedUniv === u.id;
                const hasData = isOptionAvailable("univ", u.id);
                return (
                  <button
                    key={u.id}
                    id={`onboarding-univ-${u.id}`}
                    onClick={() => handleSelectUniv(u.id)}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer shadow-2xs hover:shadow ${
                      selected
                        ? "border-indigo-600 bg-indigo-600/10 dark:bg-indigo-600/15"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <School className={`w-5 h-5 ${selected ? "text-indigo-500" : "text-slate-400"}`} />
                        {!hasData && (
                          <span className="text-[8.5px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30 px-1.5 py-0.5 rounded tracking-wide uppercase">
                            Placeholder Only
                          </span>
                        )}
                      </div>
                      <span className={`block font-black text-sm ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {u.name}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-[10px] font-bold ${selected ? "text-indigo-400" : "text-slate-400"}`}>
                        {u.id === "VTU" ? "★ Complete active paper dataset" : "Syllabus Standard"}
                      </span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${selected ? "text-indigo-500 translate-x-0.5" : "text-slate-300"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Syllabus Scheme */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              Select your Course Syllabus Scheme:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {SCHEMES.map((s) => {
                const selected = selectedScheme === s.id;
                const hasData = isOptionAvailable("scheme", s.id);
                return (
                  <button
                    key={s.id}
                    id={`onboarding-scheme-${s.id}`}
                    onClick={() => handleSelectScheme(s.id)}
                    className={`p-4.5 rounded-xl border text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                      selected
                        ? "border-indigo-600 bg-indigo-600/10 dark:bg-indigo-600/15"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400"
                    }`}
                  >
                    <div>
                      <Layers className={`w-4.5 h-4.5 ${selected ? "text-indigo-500" : "text-slate-400"}`} />
                      <span className={`block font-black text-xs.5 mt-2.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {s.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full pt-2">
                      <span className={`text-[9px] font-bold uppercase ${hasData ? "text-emerald-500" : "text-slate-400"}`}>
                        {hasData ? "Active" : "Syllabus Only"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Engineering Branch */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              Select your Engineering Discipline:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {BRANCHES.map((b) => {
                const selected = selectedBranch === b.id;
                const hasData = isOptionAvailable("branch", b.id);
                return (
                  <button
                    key={b.id}
                    id={`onboarding-branch-${b.id}`}
                    onClick={() => handleSelectBranch(b.id)}
                    className={`p-4.5 rounded-xl border text-left transition-all flex flex-col justify-between h-32 cursor-pointer ${
                      selected
                        ? "border-indigo-600 bg-indigo-600/10 dark:bg-indigo-600/15"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400"
                    }`}
                  >
                    <div>
                      <Grid className={`w-4.5 h-4.5 ${selected ? "text-indigo-500" : "text-slate-400"}`} />
                      <span className={`block font-black text-xs.5 mt-2.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {b.name} ({b.id})
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[9px] font-bold uppercase ${hasData ? "text-emerald-500" : "text-slate-400"}`}>
                        {hasData ? "Datasets Loaded" : "No active backlogs"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Semester */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
              Select Active Semester of Backlog:
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sNum) => {
                const sStr = String(sNum);
                const selected = selectedSem === sStr;
                const hasData = isOptionAvailable("sem", sStr);
                return (
                  <button
                    key={sNum}
                    id={`onboarding-sem-${sNum}`}
                    onClick={() => handleSelectSem(sStr)}
                    className={`p-4.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center h-22 cursor-pointer ${
                      selected
                        ? "border-indigo-600 bg-indigo-600/10 dark:bg-indigo-600/15"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400"
                    }`}
                  >
                    <span className={`block text-lg font-black ${isDark ? "text-slate-100" : "text-slate-850"}`}>
                      Sem {sNum}
                    </span>
                    <span className={`block text-[8px] font-bold mt-1 uppercase ${hasData ? "text-emerald-500" : "text-slate-400"}`}>
                      {hasData ? "Ready" : "Empty"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Subject Select & Search */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <div className="flex items-center justify-between">
              <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                Select active backlog subject to load forecasting:
              </h3>
              <button
                onClick={resetOnboarding}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-indigo-500 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Profile
              </button>
            </div>

            {finalSubjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {finalSubjects.map((sub) => {
                  return (
                    <div
                      key={sub.id}
                      id={`onboarding-subject-select-${sub.id}`}
                      onClick={() => onSelectSubject(sub)}
                      className={`p-4.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group h-36 ${
                        isDark 
                          ? "border-slate-800 bg-slate-900 hover:border-indigo-500 hover:bg-slate-850" 
                          : "border-slate-200 hover:border-indigo-400 bg-white shadow-2xs hover:shadow"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9.5px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded tracking-wider border border-indigo-100/30">
                            {sub.code}
                          </span>
                          <span className={`text-[9px] font-bold ${isDark ? "text-slate-400" : "text-slate-500"} uppercase`}>
                            {sub.branch} • Sem {sub.semester}
                          </span>
                        </div>
                        <h4 className={`font-extrabold text-[13px] mt-2.5 leading-snug group-hover:text-indigo-500 transition-colors ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}>
                          {sub.name}
                        </h4>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">
                          {sub.questions.length} High-Yield Past Questions
                        </span>
                        <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          Ingest ➜
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`py-12 text-center border border-dashed rounded-2xl ${
                isDark ? "bg-slate-900/40 border-slate-800 text-slate-400" : "bg-slate-50/50 border-slate-200 text-slate-400"
              }`}>
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-xs font-semibold">No direct matched subject in database with these criteria.</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Try clearing individual filters to broaden matches or use the direct directory catalog presets below.
                </p>
                <button
                  onClick={resetOnboarding}
                  className="mt-4 text-xs font-extrabold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  Configure Profile Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Wizard Bottom Bar */}
        <div className="flex items-center justify-between mt-8 border-t border-slate-100 dark:border-slate-800 pt-5">
          {step > 0 ? (
            <button
              onClick={goBack}
              className={`flex items-center gap-1.5 text-xs font-extrabold transition-colors px-3 py-2 rounded-lg cursor-pointer ${
                isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Go Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              disabled={
                (step === 0 && !selectedUniv) ||
                (step === 1 && !selectedScheme) ||
                (step === 2 && !selectedBranch) ||
                (step === 3 && !selectedSem)
              }
              onClick={() => saveState(step + 1)}
              className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-extrabold px-4.5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div />
          )}
        </div>

      </div>

      {/* Fast-Track Presets Shortcuts Panel */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          <span className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
            <Sparkles className="w-3.5 h-3.5" />
            ⚡ Fast-Track Preset Shortlists
          </span>
          <span className={`text-[10px] font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Skip configuration and load instantly
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          <button
            id="fast-onboard-dc"
            onClick={() => onFastTrack("vtu-ece-5-dc")}
            className={`p-3.5 border text-left transition-all cursor-pointer group rounded-xl ${
              isDark 
                ? "bg-slate-850 border-slate-800 hover:border-indigo-500 hover:bg-slate-800" 
                : "bg-slate-50 hover:bg-indigo-50/30 border-slate-100 hover:border-indigo-100"
            }`}
          >
            <span className="block text-[10px] text-slate-400 font-bold group-hover:text-indigo-600 transition-colors uppercase">
              VTU • 2018 Scheme • ECE • Sem 5
            </span>
            <span className={`block font-extrabold text-xs mt-1 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Principles of Communication Systems
            </span>
            <span className="text-[9.5px] text-slate-400 mt-1.5 block font-medium">
              5 High-yield modules ready
            </span>
          </button>
          <button
            id="fast-onboard-dsp"
            onClick={() => onFastTrack("vtu-ece-5-18-52")}
            className={`p-3.5 border text-left transition-all cursor-pointer group rounded-xl ${
              isDark 
                ? "bg-slate-850 border-slate-800 hover:border-indigo-500 hover:bg-slate-800" 
                : "bg-slate-50 hover:bg-indigo-50/30 border-slate-100 hover:border-indigo-100"
            }`}
          >
            <span className="block text-[10px] text-slate-400 font-bold group-hover:text-indigo-600 transition-colors uppercase">
              VTU • 2018 Scheme • ECE • Sem 5
            </span>
            <span className={`block font-extrabold text-xs mt-1 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Digital Signal Processing
            </span>
            <span className="text-[9.5px] text-slate-400 mt-1.5 block font-medium">
              6 Core computations & filters
            </span>
          </button>
          <button
            id="fast-onboard-time"
            onClick={() => onFastTrack("vtu-ece-5-18-51")}
            className={`p-3.5 border text-left transition-all cursor-pointer group rounded-xl ${
              isDark 
                ? "bg-slate-850 border-slate-800 hover:border-indigo-500 hover:bg-slate-800" 
                : "bg-slate-50 hover:bg-indigo-50/30 border-slate-100 hover:border-indigo-100"
            }`}
          >
            <span className="block text-[10px] text-slate-400 font-bold group-hover:text-indigo-600 transition-colors uppercase">
              VTU • 2018 Scheme • ECE • Sem 5
            </span>
            <span className={`block font-extrabold text-xs mt-1 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Management & Entrepreneurship
            </span>
            <span className="text-[9.5px] text-slate-400 mt-1.5 block font-medium">
              5 High-yield theory modules
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}
