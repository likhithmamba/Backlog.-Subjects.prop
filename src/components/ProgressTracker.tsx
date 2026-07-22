import React from "react";
import { Award, Zap, CheckCircle2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Question, Subject } from "../data/backlogDataset";

interface ProgressTrackerProps {
  subject: Subject;
  questionStatus: Record<string, "todo" | "doing" | "done">;
}

export default function ProgressTracker({ subject, questionStatus }: ProgressTrackerProps) {
  const totalQuestions = subject.questions.length;
  
  // Calculate counts
  const doneCount = Object.keys(questionStatus).filter(
    (key) => questionStatus[key] === "done" && subject.questions.some(q => q.id === key)
  ).length;

  const doingCount = Object.keys(questionStatus).filter(
    (key) => questionStatus[key] === "doing" && subject.questions.some(q => q.id === key)
  ).length;

  // Calculate dynamic statistical "Pass Assurance Index"
  // Weighted: Mastered high-probability questions are worth more!
  // Question importance weight = predictedRecurrence / 100
  let totalWeight = 0;
  let earnedWeight = 0;

  subject.questions.forEach((q) => {
    const wt = q.predictedRecurrence / 100;
    totalWeight += wt;
    if (questionStatus[q.id] === "done") {
      earnedWeight += wt;
    } else if (questionStatus[q.id] === "doing") {
      earnedWeight += wt * 0.4; // Partial weight for in-progress
    }
  });

  const passIndex = totalWeight > 0 ? Math.min(Math.round((earnedWeight / totalWeight) * 100), 100) : 0;

  // Status message & styling based on pass assurance index
  let statusMessage = "Blank Canvas: Choose high-recurrence questions first.";
  let statusColor = "text-amber-600 bg-amber-50 border-amber-100";
  let Icon = AlertTriangle;

  if (passIndex > 0 && passIndex < 35) {
    statusMessage = "Dangerous Zone: Focus on Module 1 & 2 high-yield derivations.";
    statusColor = "text-rose-600 bg-rose-50 border-rose-100";
    Icon = AlertTriangle;
  } else if (passIndex >= 35 && passIndex < 60) {
    statusMessage = "Borderline Zone: Learn 2 more top-predicted concepts to secure 40+ marks.";
    statusColor = "text-amber-600 bg-amber-50 border-amber-100";
    Icon = Zap;
  } else if (passIndex >= 60 && passIndex < 85) {
    statusMessage = "Safe Transition: Passing looks statistically strong. Keep reviewing notes!";
    statusColor = "text-indigo-600 bg-indigo-50 border-indigo-100";
    Icon = CheckCircle2;
  } else if (passIndex >= 85) {
    statusMessage = "Pass Secured (Statistical): You are highly prepared to clear this backlog!";
    statusColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
    Icon = ShieldCheck;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Backlog Pass Assurance Index
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Target Threshold: 40/100
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Dynamic score ring */}
        <div className="md:col-span-4 flex flex-col items-center justify-center py-2">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Simple CSS ring background */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${passIndex >= 60 ? 'text-emerald-500' : passIndex >= 35 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-500`}
                strokeWidth="3.5"
                strokeDasharray={`${passIndex}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="text-2xl font-extrabold text-slate-800 leading-none">{passIndex}%</span>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">Ready</span>
            </div>
          </div>
        </div>

        {/* Details & Advice */}
        <div className="md:col-span-8 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <span className="block text-lg font-extrabold text-slate-700 leading-none">{doneCount}</span>
              <span className="text-[10px] font-medium text-slate-400 mt-1 block">Mastered</span>
            </div>
            <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <span className="block text-lg font-extrabold text-slate-700 leading-none">{doingCount}</span>
              <span className="text-[10px] font-medium text-slate-400 mt-1 block">Studying</span>
            </div>
            <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
              <span className="block text-lg font-extrabold text-slate-700 leading-none">{totalQuestions - doneCount - doingCount}</span>
              <span className="text-[10px] font-medium text-slate-400 mt-1 block">Remaining</span>
            </div>
          </div>

          <div className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${statusColor}`}>
            <Icon className="w-4.5 h-4.5 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold block mb-0.5">Professor's Advice:</span>
              {statusMessage}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
