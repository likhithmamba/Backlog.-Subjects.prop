import React from "react";
import { Sparkles, AlertTriangle, TrendingUp, BarChart2 } from "lucide-react";
import { Subject, Question } from "../data/backlogDataset";

interface ModuleHeatmapProps {
  subject: Subject;
  currentModuleNumber: number;
}

export default function ModuleHeatmap({ subject, currentModuleNumber }: ModuleHeatmapProps) {
  // 1. Calculate question counts & occurrence frequency for each module in the subject
  const moduleData = subject.modules.map((mod) => {
    // Find all questions for this module
    const questions = subject.questions.filter((q) => q.module === mod.number);
    
    // Sum total past sessional appearances (frequency across all years)
    const totalAppearances = questions.reduce((sum, q) => sum + q.years.length, 0);
    const questionCount = questions.length;
    
    return {
      moduleNumber: mod.number,
      title: mod.title,
      appearances: totalAppearances,
      questionCount: questionCount,
    };
  });

  // Find the absolute highest appearance frequency among all modules to scale relative values
  const maxAppearances = Math.max(...moduleData.map((m) => m.appearances), 1);
  const totalSubjectAppearances = moduleData.reduce((sum, m) => sum + m.appearances, 0) || 1;

  // Specific metrics for the current module
  const currentData = moduleData.find((m) => m.moduleNumber === currentModuleNumber) || {
    moduleNumber: currentModuleNumber,
    title: "",
    appearances: 0,
    questionCount: 0,
  };

  const percentageOfTotal = Math.round((currentData.appearances / totalSubjectAppearances) * 100);
  const scaleRatio = currentData.appearances / maxAppearances; // 0.0 to 1.0

  // Determine heatmap classification color and tag
  let priorityLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "STANDARD" = "STANDARD";
  let priorityColor = "bg-slate-400";
  let priorityText = "text-slate-700";
  let priorityBg = "bg-slate-50 border-slate-200";
  let descriptionText = "Standard module with lower repeating questions.";

  if (scaleRatio >= 0.85) {
    priorityLevel = "CRITICAL";
    priorityColor = "bg-rose-500";
    priorityText = "text-rose-700 font-extrabold";
    priorityBg = "bg-rose-50 border-rose-100";
    descriptionText = "Maximum sessional repeat rate! Absolute must-study module.";
  } else if (scaleRatio >= 0.6) {
    priorityLevel = "HIGH";
    priorityColor = "bg-amber-500";
    priorityText = "text-amber-750 font-bold";
    priorityBg = "bg-amber-50 border-amber-100";
    descriptionText = "High sessional frequency. High probability of repeating.";
  } else if (scaleRatio >= 0.3) {
    priorityLevel = "MEDIUM";
    priorityColor = "bg-indigo-500";
    priorityText = "text-indigo-700 font-semibold";
    priorityBg = "bg-indigo-50 border-indigo-150";
    descriptionText = "Moderate recurrence. Balance after completing high-yield zones.";
  }

  // Define intensity bg classes for the mini heatmap preview blocks
  const getHeatmapBlockBg = (ratio: number, isActive: boolean) => {
    if (ratio >= 0.85) {
      return isActive ? "bg-rose-500 text-white font-black ring-2 ring-rose-500/35" : "bg-rose-100 text-rose-800 hover:bg-rose-200";
    }
    if (ratio >= 0.6) {
      return isActive ? "bg-amber-500 text-white font-black ring-2 ring-amber-500/35" : "bg-amber-100 text-amber-800 hover:bg-amber-200";
    }
    if (ratio >= 0.3) {
      return isActive ? "bg-indigo-600 text-white font-black ring-2 ring-indigo-600/35" : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
    }
    return isActive ? "bg-slate-600 text-white font-black ring-2 ring-slate-500/35" : "bg-slate-100 text-slate-600 hover:bg-slate-150";
  };

  return (
    <div 
      id={`module-heatmap-widget-${currentModuleNumber}`}
      className="mt-3 bg-white border border-slate-150 rounded-xl p-4.5 space-y-4 shadow-2xs"
    >
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Sessional Exam Weight Analysis
          </span>
        </div>
        <div className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${priorityBg} ${priorityText} flex items-center gap-1`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          Priority: {priorityLevel}
        </div>
      </div>

      {/* Primary Heatmap bar showing weight & percentage of total */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-500">Module {currentModuleNumber} Past Exam Share:</span>
          <span className="text-slate-800 font-extrabold">
            {currentData.appearances} appearances ({percentageOfTotal}% of total subject)
          </span>
        </div>
        {/* Heatmap Bar container */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${priorityColor}`}
            style={{ width: `${Math.max(percentageOfTotal, 4)}%` }}
            title={`Module ${currentModuleNumber} represents ${percentageOfTotal}% of past questions.`}
          />
        </div>
        <p className="text-[10.5px] text-slate-450 leading-relaxed font-medium">
          {descriptionText}
        </p>
      </div>

      {/* Interactive horizontal heatmap visual comparison across all modules */}
      <div className="border-t border-slate-100 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Subject Heatmap (Compare Modules 1-{moduleData.length}):
          </span>
          <span className="text-[9px] text-slate-400 font-semibold">
            Color intensity indicates past occurrences
          </span>
        </div>
        
        <div className="grid grid-cols-5 gap-1.5">
          {moduleData.map((mod) => {
            const ratio = mod.appearances / maxAppearances;
            const isActive = mod.moduleNumber === currentModuleNumber;
            const blockClass = getHeatmapBlockBg(ratio, isActive);
            
            return (
              <div 
                key={mod.moduleNumber}
                className={`py-2 px-1 rounded text-center transition-all cursor-default flex flex-col justify-between ${blockClass}`}
                title={`Module ${mod.moduleNumber}: "${mod.title}" has ${mod.appearances} occurrences.`}
              >
                <span className="text-[9px] font-black block">M{mod.moduleNumber}</span>
                <span className="text-[8px] opacity-80 block font-bold mt-0.5">
                  {mod.appearances}x
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
