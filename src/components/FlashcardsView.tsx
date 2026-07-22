import React, { useState, useEffect } from "react";
import { 
  Sparkles, RotateCw, CheckCircle2, RefreshCw, Layers, Award,
  HelpCircle, ChevronRight, ChevronLeft, Volume2
} from "lucide-react";
import { Subject, Question } from "../data/backlogDataset";

interface FlashcardsViewProps {
  subject: Subject;
  theme: "dark" | "light";
}

interface FlashcardItem {
  id: string;
  concept: string;
  moduleNum: number;
  frontQuestion: string;
  backAnswer: string;
  status: "new" | "review" | "mastered";
}

export default function FlashcardsView({ subject, theme }: FlashcardsViewProps) {
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [stats, setStats] = useState({ mastered: 0, review: 0, total: 0 });

  // Ingest subject questions and map them to high-yield flashcards
  useEffect(() => {
    // Look for saved card states in localStorage first
    const savedCardsJson = localStorage.getItem(`flashcards-v2-${subject.id}`);
    if (savedCardsJson) {
      try {
        const parsed = JSON.parse(savedCardsJson);
        if (parsed && parsed.length > 0) {
          setCards(parsed);
          setCurrentIndex(0);
          setIsFlipped(false);
          updateStats(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse saved flashcards, generating new ones", e);
      }
    }

    // Otherwise, generate fresh flashcards based on subject's questions
    const freshCards: FlashcardItem[] = subject.questions.map((q, idx) => {
      // Craft standard back answers based on description & marks
      const standardBack = q.description || `Module ${q.module} core question worth ${q.marks} marks. Study this concept carefully to score maximum points.`;
      
      return {
        id: `card-${subject.id}-${q.id}-${idx}`,
        concept: q.concept,
        moduleNum: q.module,
        frontQuestion: `What are the core exam criteria and proof steps for: "${q.concept}"?`,
        backAnswer: `Exam Answer Guidelines:\n\n1. ${q.question}\n\n2. Key Strategy: ${standardBack}\n\n3. Mark Weight: ${q.marks} Marks • Draw the relevant system flowchart if applicable.`,
        status: "new"
      };
    });

    setCards(freshCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    updateStats(freshCards);
    localStorage.setItem(`flashcards-v2-${subject.id}`, JSON.stringify(freshCards));
  }, [subject.id]);

  const updateStats = (currentCards: FlashcardItem[]) => {
    const mastered = currentCards.filter(c => c.status === "mastered").length;
    const review = currentCards.filter(c => c.status === "review").length;
    setStats({
      mastered,
      review,
      total: currentCards.length
    });
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markCardStatus = (status: "review" | "mastered") => {
    if (cards.length === 0) return;
    
    const updated = [...cards];
    updated[currentIndex].status = status;
    setCards(updated);
    updateStats(updated);
    localStorage.setItem(`flashcards-v2-${subject.id}`, JSON.stringify(updated));

    // Wait a brief period and move to next card or flip back
    setTimeout(() => {
      setIsFlipped(false);
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Wrap around to the first uncompleted card, or just stay at 0
        setCurrentIndex(0);
      }
    }, 200);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(cards.length - 1);
    }
  };

  const resetAllCards = () => {
    if (confirm("Are you sure you want to reset your flashcard study progress for this subject?")) {
      const reset = cards.map(c => ({ ...c, status: "new" as const }));
      setCards(reset);
      setCurrentIndex(0);
      setIsFlipped(false);
      updateStats(reset);
      localStorage.setItem(`flashcards-v2-${subject.id}`, JSON.stringify(reset));
    }
  };

  const activeCard = cards[currentIndex];
  const isDark = theme === "dark";

  return (
    <div id="flashcards-component" className="max-w-xl mx-auto space-y-6 py-2 animate-in fade-in duration-200">
      
      {/* Tracker Headers */}
      <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
        isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
      }`}>
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-850"}`}>
              Active Recall Deck
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Subject: {subject.code}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="block text-xs font-black text-emerald-500">{stats.mastered}</span>
            <span className="text-[8px] font-bold uppercase text-slate-400">Mastered</span>
          </div>
          <div className="w-px h-6 bg-slate-250 dark:bg-slate-800" />
          <div className="text-center">
            <span className="block text-xs font-black text-amber-500">{stats.review}</span>
            <span className="text-[8px] font-bold uppercase text-slate-400">Review</span>
          </div>
          <div className="w-px h-6 bg-slate-250 dark:bg-slate-800" />
          <button 
            id="btn-reset-flashcards"
            onClick={resetAllCards}
            className="text-slate-400 hover:text-indigo-500 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Progress"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeCard ? (
        <div className="space-y-6">
          
          {/* Flip Container */}
          <div 
            id={`flashcard-item-${currentIndex}`}
            onClick={handleFlip}
            className={`min-h-[280px] w-full rounded-2xl border p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 relative select-none overflow-hidden ${
              isFlipped 
                ? isDark 
                  ? "bg-slate-950 border-indigo-500/50 shadow-indigo-950/20 shadow-lg"
                  : "bg-indigo-50/25 border-indigo-200 shadow-xs"
                : isDark
                  ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                  : "bg-white border-slate-200 hover:border-indigo-200 shadow-2xs hover:shadow"
            }`}
          >
            {/* Top Bar inside card */}
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Module {activeCard.moduleNum} • {activeCard.concept}</span>
              <span className={`px-2 py-0.5 rounded ${
                activeCard.status === "mastered" 
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : activeCard.status === "review"
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-indigo-500/10 text-indigo-500"
              }`}>
                {activeCard.status === "mastered" ? "Mastered" : activeCard.status === "review" ? "Reviewing" : "Unprepared"}
              </span>
            </div>

            {/* Content Body */}
            <div className="my-auto py-6">
              {!isFlipped ? (
                <div className="space-y-4 text-center">
                  <h4 className={`text-md.5 font-black leading-relaxed ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {activeCard.frontQuestion}
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block animate-pulse">
                    Tap to Flip Card
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-[9.5px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
                    Exam Evaluation Gist:
                  </span>
                  <div className={`text-xs.5 leading-relaxed whitespace-pre-line font-sans ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {activeCard.backAnswer}
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer indicator */}
            <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-3">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-indigo-500 animate-spin-slow" />
                Click Card to flip
              </span>
              <span>
                Card {currentIndex + 1} of {cards.length}
              </span>
            </div>
          </div>

          {/* Swipe Buttons / Spaced Rep Actions */}
          {isFlipped ? (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-150">
              <button
                id="btn-mark-review"
                onClick={() => markCardStatus("review")}
                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/10 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                Review Again (Spaced Rep)
              </button>
              <button
                id="btn-mark-mastered"
                onClick={() => markCardStatus("mastered")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mastered (Know It)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                id="btn-flashcard-prev"
                onClick={handlePrev}
                className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                  isDark ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-650 hover:bg-slate-55"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Card
              </button>
              <button
                id="btn-flashcard-next"
                onClick={handleNext}
                className={`py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                  isDark ? "border-slate-800 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-650 hover:bg-slate-55"
                }`}
              >
                Next Card
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      ) : (
        <div className={`py-12 text-center border border-dashed rounded-xl ${
          isDark ? "bg-slate-950/40 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-400"
        }`}>
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <span className="text-xs font-semibold">No flashcards loaded</span>
        </div>
      )}

    </div>
  );
}
