import React, { useState, useEffect } from "react";
import { Edit3, Check, Trash2, Calendar, FileText, CheckCircle } from "lucide-react";
import { Question, Subject } from "../data/backlogDataset";

interface NotesSectionProps {
  subject: Subject;
  activeQuestion: Question | null;
}

export default function NotesSection({ subject, activeQuestion }: NotesSectionProps) {
  const [noteText, setNoteText] = useState<string>("");
  const [allNotes, setAllNotes] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Load all notes on mount or subject change
  useEffect(() => {
    const savedNotesRaw = localStorage.getItem(`notes-${subject.id}`);
    if (savedNotesRaw) {
      try {
        const parsed = JSON.parse(savedNotesRaw);
        setAllNotes(parsed);
      } catch (err) {
        console.error("Error parsing saved notes", err);
      }
    } else {
      setAllNotes({});
    }
    setSaveSuccess(false);
  }, [subject.id]);

  // Sync active question note when selection changes
  useEffect(() => {
    if (activeQuestion) {
      setNoteText(allNotes[activeQuestion.id] || "");
    } else {
      setNoteText("");
    }
    setSaveSuccess(false);
  }, [activeQuestion, allNotes]);

  const handleSaveNote = () => {
    if (!activeQuestion) return;
    
    const updatedNotes = {
      ...allNotes,
      [activeQuestion.id]: noteText
    };

    setAllNotes(updatedNotes);
    localStorage.setItem(`notes-${subject.id}`, JSON.stringify(updatedNotes));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDeleteNote = () => {
    if (!activeQuestion) return;
    if (confirm("Are you sure you want to delete this study note?")) {
      const updatedNotes = { ...allNotes };
      delete updatedNotes[activeQuestion.id];
      
      setAllNotes(updatedNotes);
      localStorage.setItem(`notes-${subject.id}`, JSON.stringify(updatedNotes));
      setNoteText("");
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-indigo-600" />
          Offline Revision Notes
        </h3>
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          Local Persistence
        </span>
      </div>

      {activeQuestion ? (
        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Selected Question</span>
            <p className="text-xs font-semibold text-slate-700 mt-0.5 line-clamp-2">
              {activeQuestion.question}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Draft Revision Mnemonics, Derivation Tricks, or Cheat Codes
            </label>
            <textarea
              id="notes-textarea"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="E.g., Mnemonic to remember PCM: S-Q-E-C (Sampling, Quantization, Encoding, Companding). Or key equations..."
              rows={5}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg p-3 outline-none focus:border-indigo-500 transition-colors focus:bg-white leading-relaxed resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <button
                id="btn-save-note"
                onClick={handleSaveNote}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
              >
                <Check className="w-3.5 h-3.5" />
                {saveSuccess ? "Saved!" : "Save Note"}
              </button>
              
              {allNotes[activeQuestion.id] && (
                <button
                  id="btn-delete-note"
                  onClick={handleDeleteNote}
                  className="border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-semibold text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Note
                </button>
              )}
            </div>
            
            {saveSuccess && (
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Stored in browser local state
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center text-slate-400">
          <FileText className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-xs font-medium text-slate-600">Select an exam question first</p>
          <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
            Once selected, you can attach custom mnemonics, step reminders, and diagrams here!
          </p>
        </div>
      )}

      {/* List of Questions with Notes */}
      {Object.keys(allNotes).length > 0 && (
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Other Saved Notes ({Object.keys(allNotes).length})</h4>
          <div className="max-h-[150px] overflow-y-auto space-y-1.5 pr-1">
            {subject.questions.map((q) => {
              if (!allNotes[q.id]) return null;
              const isActive = activeQuestion?.id === q.id;
              
              return (
                <div 
                  key={q.id}
                  className={`p-2 rounded text-[11px] border leading-normal transition-all ${
                    isActive 
                      ? "bg-indigo-50/50 border-indigo-200 text-indigo-900" 
                      : "bg-slate-50/50 border-slate-100 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="font-bold text-indigo-600 block mb-0.5">Concept: {q.concept}</span>
                  <p className="line-clamp-1">{allNotes[q.id]}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
