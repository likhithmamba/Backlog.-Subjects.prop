import React, { useState, useEffect } from "react";
import { X, BookOpen, PenTool, Sparkles, HelpCircle, CheckCircle, AlertCircle, Loader2, MessageSquare, Send } from "lucide-react";
import { Question } from "../data/backlogDataset";

interface ExplainModalProps {
  question: Question;
  subjectName: string;
  moduleName: string;
  onClose: () => void;
}

interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function ExplainModal({ question, subjectName, moduleName, onClose }: ExplainModalProps) {
  const [activeTab, setActiveTab] = useState<"explain" | "derive" | "quiz" | "chat">("explain");
  
  // States for API contents
  const [explanation, setExplanation] = useState<string>("");
  const [derivation, setDerivation] = useState<string>("");
  const [quizList, setQuizList] = useState<QuizItem[]>([]);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string>("");
  
  // Loading states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Quiz interactive state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchContent();
  }, [activeTab, question.id]);

  const fetchContent = async () => {
    // If we already have the content, don't refetch
    if (activeTab === "chat") return; // Chat is interactive
    if (activeTab === "explain" && explanation) return;
    if (activeTab === "derive" && derivation) return;
    if (activeTab === "quiz" && quizList.length > 0) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = activeTab === "explain" 
        ? "/api/gemini/explain" 
        : activeTab === "derive" 
          ? "/api/gemini/derive" 
          : "/api/gemini/quiz";

      const payload = activeTab === "quiz"
        ? { concept: question.concept, questionText: question.question }
        : { 
            question: question.question, 
            concept: question.concept, 
            marks: question.marks,
            moduleName: moduleName 
          };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      
      if (activeTab === "explain") {
        setExplanation(data.explanation || "No explanation returned.");
      } else if (activeTab === "derive") {
        setDerivation(data.derivation || "No derivation returned.");
      } else {
        setQuizList(data.quiz || []);
        setSelectedAnswers({});
        setRevealedAnswers({});
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact Gemini backlog engine. Make sure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (quizId: string, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [quizId]: option }));
  };

  const handleCheckAnswer = (quizId: string) => {
    if (!selectedAnswers[quizId]) return;
    setRevealedAnswers(prev => ({ ...prev, [quizId]: true }));
  };

  const handleSendChatMessage = async (msgText: string) => {
    if (!msgText.trim() || chatLoading) return;

    const userMsg = msgText.trim();
    const updatedHistory = [...chatHistory, { role: "user" as const, text: userMsg }];
    
    setChatHistory(updatedHistory);
    setChatInput("");
    setChatLoading(true);
    setChatError("");

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.question,
          concept: question.concept,
          message: userMsg,
          history: chatHistory.map(h => ({ role: h.role, text: h.text }))
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setChatHistory(prev => [
        ...prev,
        { role: "assistant" as const, text: data.response || "No reply generated." }
      ]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || "Failed to communicate with AI Tutor chat backend.");
    } finally {
      setChatLoading(false);
    }
  };

  // Helper to safely split markdown into clean paragraph structures for nicer light theme reading
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;
      
      // Header check
      if (trimmed.startsWith("###")) {
        return <h4 key={idx} className="text-md font-bold text-slate-800 mt-4 mb-2">{trimmed.replace("###", "").trim()}</h4>;
      }
      if (trimmed.startsWith("##")) {
        return <h3 key={idx} className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-1 mt-5 mb-3">{trimmed.replace("##", "").trim()}</h3>;
      }
      if (trimmed.startsWith("#")) {
        return <h2 key={idx} className="text-xl font-extrabold text-indigo-900 mt-6 mb-4">{trimmed.replace("#", "").trim()}</h2>;
      }

      // Bullet check
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        // Simple bold processing within bullets
        const cleanText = trimmed.substring(1).trim();
        return (
          <li key={idx} className="ml-5 list-disc text-slate-600 mb-1 leading-relaxed">
            {formatBoldText(cleanText)}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-600 text-[15px] leading-relaxed mb-3">
          {formatBoldText(trimmed)}
        </p>
      );
    });
  };

  const formatBoldText = (text: string) => {
    // Regex matches bold markers and citation chips [Citation: ...]
    const parts = text.split(/(\[Citation:.*?\]|\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("[Citation:") && part.endsWith("]")) {
        const citationVal = part.replace("[Citation:", "").replace("]", "").trim();
        return (
          <span key={i} className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/15 text-[10px] font-black px-1.5 py-0.5 rounded ml-1 mr-1">
            <BookOpen className="w-2.5 h-2.5" />
            {citationVal}
          </span>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="explain-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        id="explain-modal-content"
        className="bg-white rounded-xl shadow-xl border border-slate-200/80 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
              {moduleName} • {question.marks} Marks • {question.difficulty}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2 leading-snug">
              {question.question}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Subject: <span className="font-medium text-slate-600">{subjectName}</span> • Concept: <span className="font-medium text-slate-600">{question.concept}</span>
            </p>
          </div>
          <button 
            id="close-explain-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-100 px-4 bg-white">
          <button
            id="tab-btn-explain"
            onClick={() => setActiveTab("explain")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "explain"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Clear Explanation
          </button>
          <button
            id="tab-btn-derive"
            onClick={() => setActiveTab("derive")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "derive"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <PenTool className="w-4 h-4" />
            Score-Saving Derivation
          </button>
          <button
            id="tab-btn-quiz"
            onClick={() => setActiveTab("quiz")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "quiz"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Active Recall Quiz
          </button>
          <button
            id="tab-btn-chat"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "chat"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ask AI Tutor
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20">
          {loading && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium">Contacting Gemini Backlog AI tutor...</p>
              <p className="text-xs text-slate-400 mt-1">Generating custom structured academic response</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 flex items-start gap-3 my-4">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-800">API Key Missing or Request Failed</h4>
                <p className="text-sm mt-1 leading-relaxed">{error}</p>
                <div className="mt-4 bg-white p-3 rounded border border-rose-200/60 text-xs text-slate-600">
                  <p className="font-semibold">How to configure:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Click on the <strong>Settings</strong> gear or the <strong>Secrets</strong> panel in AI Studio.</li>
                    <li>Add your <code>GEMINI_API_KEY</code> with a valid key.</li>
                    <li>Ensure your internet connection is active.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="animate-in fade-in duration-200">
              {activeTab === "explain" && explanation && (
                <div className="space-y-2 bg-white p-5 rounded-lg border border-slate-100">
                  {renderMarkdown(explanation)}
                </div>
              )}

              {activeTab === "derive" && derivation && (
                <div className="space-y-2 bg-white p-5 rounded-lg border border-slate-100 font-sans">
                  {renderMarkdown(derivation)}
                </div>
              )}

              {activeTab === "quiz" && quizList.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-900">Active Recall Mode Activated</h4>
                      <p className="text-xs text-indigo-700 mt-0.5">
                        Students who test themselves pass exams 3x faster than those who just re-read notes. Try answering these conceptual exam snippets!
                      </p>
                    </div>
                  </div>

                  {quizList.map((item, index) => {
                    const isAnswered = revealedAnswers[item.id];
                    const selectedOpt = selectedAnswers[item.id];
                    
                    return (
                      <div key={item.id} className="bg-white p-5 rounded-lg border border-slate-200/80 shadow-sm">
                        <span className="text-xs font-semibold text-slate-400 uppercase">Question {index + 1} of 3</span>
                        <h4 className="text-[15px] font-semibold text-slate-800 mt-1 mb-3">
                          {item.question}
                        </h4>

                        <div className="space-y-2">
                          {item.options.map((opt) => {
                            const isSelected = selectedOpt === opt;
                            const isCorrect = opt === item.correctAnswer;
                            
                            let optionClass = "border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20";
                            if (isSelected) {
                              optionClass = "border-indigo-600 bg-indigo-50/40 text-indigo-900 font-medium";
                            }
                            if (isAnswered) {
                              if (isCorrect) {
                                optionClass = "border-emerald-500 bg-emerald-50/40 text-emerald-900 font-medium";
                              } else if (isSelected) {
                                optionClass = "border-rose-500 bg-rose-50/40 text-rose-900";
                              }
                            }

                            return (
                              <button
                                key={opt}
                                disabled={isAnswered}
                                onClick={() => handleSelectOption(item.id, opt)}
                                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all flex items-center justify-between ${optionClass} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                              </button>
                            );
                          })}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                          {!isAnswered ? (
                            <button
                              id={`check-ans-${item.id}`}
                              disabled={!selectedOpt}
                              onClick={() => handleCheckAnswer(item.id)}
                              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                selectedOpt 
                                  ? "bg-slate-800 text-white hover:bg-slate-900" 
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              Check Answer
                            </button>
                          ) : (
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              Graded
                            </span>
                          )}

                          {isAnswered && (
                            <div className="text-xs text-slate-500">
                              Correct answer: <span className="font-bold text-slate-700">{item.correctAnswer}</span>
                            </div>
                          )}
                        </div>

                        {isAnswered && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed animate-in slide-in-from-top-1 duration-150">
                            <strong className="text-slate-800 font-semibold block mb-0.5">Professor's Explanation:</strong>
                            {item.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "chat" && (
                <div className="space-y-4 flex flex-col h-[50vh]">
                  {/* Info banner */}
                  <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-lg flex items-center gap-2 shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="text-xs font-semibold text-indigo-900">
                      Active dialog linked to concept: <strong className="text-indigo-950 font-bold">{question.concept}</strong>. Answers are traced with citations.
                    </span>
                  </div>

                  {/* Chat Bubbles Scroll Area */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 p-3 bg-slate-100/50 rounded-xl border border-slate-150">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                        <MessageSquare className="w-8 h-8 text-indigo-400/80 animate-pulse" />
                        <h4 className="text-xs.5 font-bold text-slate-650">Ask your Backlog Coach anything</h4>
                        <p className="text-[11px] text-slate-400 max-w-xs">
                          Inquire about technical derivations, diagram blocks, or exam grading metrics. Click on helper recommendations below to start!
                        </p>
                      </div>
                    ) : (
                      chatHistory.map((msg, index) => {
                        const isUser = msg.role === "user";
                        return (
                          <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-100`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 text-xs.5 leading-relaxed ${
                              isUser 
                                ? "bg-indigo-600 text-white rounded-br-none shadow-sm" 
                                : "bg-white border border-slate-200/85 text-slate-700 rounded-bl-none shadow-2xs"
                            }`}>
                              <span className="block text-[9px] font-bold uppercase opacity-60 mb-1">
                                {isUser ? "You" : "AI Backlog Mentor"}
                              </span>
                              <div className="whitespace-pre-line font-sans">
                                {isUser ? msg.text : formatBoldText(msg.text)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 shadow-2xs">
                          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                          <span className="text-[10.5px] font-semibold text-slate-400">Mentor is drafting answer...</span>
                        </div>
                      </div>
                    )}

                    {chatError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
                        {chatError}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Starter recommendation pills */}
                  <div className="flex flex-wrap gap-2 py-1 shrink-0">
                    <button
                      id="pill-suggest-analogy"
                      onClick={() => handleSendChatMessage("Provide a simple, real-world analogy to explain this concept.")}
                      className="text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 hover:border-indigo-400 text-slate-550 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      💡 Request Analogy
                    </button>
                    <button
                      id="pill-suggest-traps"
                      onClick={() => handleSendChatMessage("What are the most common student traps or mistakes to avoid on this exam question?")}
                      className="text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 hover:border-indigo-400 text-slate-550 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      ⚠️ Common Traps
                    </button>
                    <button
                      id="pill-suggest-proof"
                      onClick={() => handleSendChatMessage("List the exact 3-step proof procedure required by VTU university evaluation sheet.")}
                      className="text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 hover:border-indigo-400 text-slate-550 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      📐 Proof Steps
                    </button>
                  </div>

                  {/* Input form */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      id="chat-concept-input"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSendChatMessage(chatInput); }}
                      placeholder="Inquire about formulas, equations, definitions, derivations..."
                      className="flex-1 rounded-xl border border-slate-250 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500 font-sans"
                    />
                    <button
                      id="btn-send-chat"
                      disabled={!chatInput.trim() || chatLoading}
                      onClick={() => handleSendChatMessage(chatInput)}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer active:scale-95"
                    >
                      <Send className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-400">
          <span>AI-generated tutoring advice is grounded in standard textbooks. Double-check local college guidelines.</span>
          <span className="font-semibold text-indigo-600">BacklogAI Active Tutor v2</span>
        </div>
      </div>
    </div>
  );
}
