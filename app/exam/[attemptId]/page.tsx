"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Send,
  Maximize2,
  ShieldAlert,
  HelpCircle,
  X,
  Lock,
} from "lucide-react";
import { formatTimeRemaining } from "@/lib/utils";

export default function ExamRoomPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const router = useRouter();
  const attemptId = params.attemptId;

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewedQuestions, setReviewedQuestions] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({ "0": true });

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Anti-cheating states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(true);

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load exam session data
  useEffect(() => {
    // Check cached active attempt or fetch
    const cached = sessionStorage.getItem("tekzow_active_attempt");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.attemptId === attemptId) {
          initializeExam(parsed);
          return;
        }
      } catch (e) {}
    }

    // Fallback fetch
    fetchAttemptData();
  }, [attemptId]);

  const fetchAttemptData = async () => {
    setLoading(true);
    try {
      // Re-invoke start with studentId or retrieve
      const s = sessionStorage.getItem("tekzow_student");
      const studentId = s ? JSON.parse(s).id : "";

      const res = await fetch(`/api/exams/attempts/${attemptId}/result`);
      const data = await res.json();

      if (data.attempt && data.attempt.status === "SUBMITTED") {
        router.push(`/results/${attemptId}`);
        return;
      }

      // If we don't have full questions, redirect to instructions
      router.push("/instructions");
    } catch (e) {
      router.push("/");
    }
  };

  const initializeExam = (data: any) => {
    setExamData(data);
    setAnswers(data.savedAnswers || {});

    // Compute remaining seconds from server expiresAt
    const expires = new Date(data.expiresAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expires - now) / 1000));
    setSecondsRemaining(remaining);
    setLoading(false);

    // Request fullscreen automatically on exam entry
    enterFullscreen();
  };

  const enterFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Browser requires direct user interaction for fullscreen
      });
    }
  };

  // --- ANTI-CHEATING HOOKS ---
  const logSecurityEvent = useCallback(
    async (eventType: string, details: string) => {
      try {
        await fetch(`/api/exams/${attemptId}/log-event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, eventType, details }),
        });
      } catch (err) {}
    },
    [attemptId]
  );

  useEffect(() => {
    // 1. Tab switch / Visibility change listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          logSecurityEvent(
            "TAB_SWITCH",
            `Candidate switched away from exam tab (Count: ${next})`
          );
          return next;
        });
        setWarningMessage(
          "WARNING: You have switched away from the active examination window. This action has been recorded in your candidate audit log."
        );
        setShowWarningModal(true);
      }
    };

    // 2. Window Blur listener
    const handleBlur = () => {
      logSecurityEvent("WINDOW_BLUR", "Exam window lost focus");
    };

    // 3. Fullscreen change listener
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen && !submitting && !showSubmitModal) {
        logSecurityEvent("FULLSCREEN_EXIT", "Candidate exited full screen mode");
        setWarningMessage(
          "SECURITY ALERT: Fullscreen mode was exited. The exam requires continuous full-screen display. This incident has been logged."
        );
        setShowWarningModal(true);
      }
    };

    // 4. Disable context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 5. Disable copy/paste/inspector shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+U, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "u")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [logSecurityEvent, submitting, showSubmitModal]);

  // --- TIMER HOOK ---
  useEffect(() => {
    if (loading || secondsRemaining <= 0) return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Automatic submission on timer expiry
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, secondsRemaining]);

  // --- AUTO-SAVE ANSWER ---
  const handleSelectOption = async (optionKey: string) => {
    if (!examData || !examData.questions[currentIndex]) return;
    const currentQ = examData.questions[currentIndex];

    // Toggle if clicking already selected
    const newAnswers = { ...answers, [currentQ.id]: optionKey };
    setAnswers(newAnswers);
    setSaveStatus("saving");

    try {
      const res = await fetch(`/api/exams/${attemptId}/save-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId: currentQ.id,
          selectedOption: optionKey,
        }),
      });

      if (res.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      setSaveStatus("error");
    }
  };

  const handleClearAnswer = async () => {
    if (!examData || !examData.questions[currentIndex]) return;
    const currentQ = examData.questions[currentIndex];

    const newAnswers = { ...answers };
    delete newAnswers[currentQ.id];
    setAnswers(newAnswers);
    setSaveStatus("saving");

    try {
      await fetch(`/api/exams/${attemptId}/save-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          questionId: currentQ.id,
          selectedOption: null,
        }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setSaveStatus("error");
    }
  };

  const handleToggleReview = () => {
    if (!examData || !examData.questions[currentIndex]) return;
    const qId = examData.questions[currentIndex].id;
    setReviewedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < (examData?.questions?.length || 0)) {
      setCurrentIndex(index);
      setVisitedQuestions((prev) => ({ ...prev, [index.toString()]: true }));
    }
  };

  // --- SUBMIT EXAM ---
  const handleFinalSubmit = async (isTimeExpired: boolean = false) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/exams/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          finalAnswers: answers,
          submissionReason: isTimeExpired
            ? "Time expired (Automatic submission)"
            : "Manual student submission",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Clean session and exit fullscreen
        sessionStorage.removeItem("tekzow_active_attempt");
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
        router.push(`/results/${attemptId}`);
      } else {
        alert(data.error || "Submission failed. Please contact your invigilator.");
        setSubmitting(false);
      }
    } catch (e) {
      alert("Submission error. Please verify your connection.");
      setSubmitting(false);
    }
  };

  if (loading || !examData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-semibold text-lg">Initializing Examination Environment...</p>
        </div>
      </div>
    );
  }

  const questions = examData.questions || [];
  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQ - answeredCount;
  const currentAnswer = currentQ ? answers[currentQ.id] : null;
  const isCurrentReviewed = currentQ ? !!reviewedQuestions[currentQ.id] : false;

  const isTimerCritical = secondsRemaining <= 300; // less than 5 mins

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 unselectable selection:bg-transparent">
      {/* Top Authoritative Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Exam Title */}
          <div className="flex items-center space-x-4">
            <div className="relative h-10 w-32 sm:w-40">
              <Image
                src="/images/tekzow-logo.png"
                alt="Tekzow Logo"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                {examData.exam.title}
              </h1>
              <p className="text-xs text-slate-500">
                {examData.exam.course.courseName} &bull; Code: {examData.exam.course.courseCode}
              </p>
            </div>
          </div>

          {/* Student & Timer Section */}
          <div className="flex items-center space-x-4">
            {/* Auto Save Pill */}
            <div className="hidden md:flex items-center text-xs font-medium">
              {saveStatus === "saving" && (
                <span className="text-blue-600 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping mr-1.5" />
                  Saving answer...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-emerald-600 flex items-center bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Answer saved ✓
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-red-600 flex items-center bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Save failed (retrying)
                </span>
              )}
            </div>

            {/* Candidate Identity */}
            <div className="hidden lg:block text-right text-xs">
              <div className="font-bold text-slate-800">{examData.student.name}</div>
              <div className="text-slate-500 font-mono">{examData.student.registrationNumber}</div>
            </div>

            {/* Countdown Timer */}
            <div
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-base transition-colors ${
                isTimerCritical
                  ? "bg-red-50 border-red-300 text-red-700 animate-pulse"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <Clock
                className={`w-4 h-4 ${isTimerCritical ? "text-red-600" : "text-blue-600"}`}
              />
              <span className="tabular-nums">{formatTimeRemaining(secondsRemaining)}</span>
            </div>

            {/* Fullscreen Button */}
            {!isFullscreen && (
              <button
                onClick={enterFullscreen}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                title="Enter Fullscreen"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            )}

            {/* Submit Exam Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs hover:shadow-md transition-all"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Submit Exam
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Question Card (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex-1 flex flex-col justify-between">
            {currentQ ? (
              <div>
                {/* Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                      Question {currentIndex + 1} of {totalQ}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {currentQ.topic}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                    <span>Marks: <strong className="text-slate-800">{currentQ.marks || 1}</strong></span>
                    <span>&bull;</span>
                    <span className="uppercase text-[11px] font-semibold tracking-wider text-slate-400">
                      {currentQ.difficulty || "MEDIUM"}
                    </span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="py-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {[
                    { key: "A", text: currentQ.optionA },
                    { key: "B", text: currentQ.optionB },
                    { key: "C", text: currentQ.optionC },
                    { key: "D", text: currentQ.optionD },
                  ].map((opt) => {
                    const isSelected = currentAnswer === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelectOption(opt.key)}
                        className={`w-full text-left p-4 sm:p-4.5 rounded-xl border-2 transition-all flex items-center space-x-4 ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/70 shadow-xs"
                            : "border-slate-200 hover:border-blue-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}
                        >
                          {opt.key}
                        </div>
                        <div
                          className={`text-sm sm:text-base ${
                            isSelected ? "font-semibold text-slate-900" : "text-slate-700"
                          }`}
                        >
                          {opt.text}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Bottom Actions Bar */}
            <div className="pt-8 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleToggleReview}
                  className={`inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    isCurrentReviewed
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                  {isCurrentReviewed ? "Marked for Review" : "Mark for Review"}
                </button>

                {currentAnswer && (
                  <button
                    type="button"
                    onClick={handleClearAnswer}
                    className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Clear Response
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => goToQuestion(currentIndex - 1)}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </button>

                {currentIndex < totalQ - 1 ? (
                  <button
                    type="button"
                    onClick={() => goToQuestion(currentIndex + 1)}
                    className="inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="inline-flex items-center px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    Review & Submit
                    <Send className="w-4 h-4 ml-1.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Palette (4 cols) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-xs font-mono text-slate-500">
                {answeredCount}/{totalQ} Answered
              </span>
            </h3>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-white font-bold inline-block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-indigo-500 text-white font-bold inline-block" />
                <span>Review</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-400 text-white font-bold inline-block" />
                <span>Visited</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-200 text-slate-700 font-bold inline-block" />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pt-4 pr-1">
              {questions.map((q: any, idx: number) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isReviewed = !!reviewedQuestions[q.id];
                const isVisited = !!visitedQuestions[idx.toString()];

                let btnStyle = "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200"; // Not Visited
                if (isAnswered && isReviewed) {
                  btnStyle = "bg-gradient-to-r from-emerald-500 to-indigo-500 text-white border-indigo-600";
                } else if (isReviewed) {
                  btnStyle = "bg-indigo-600 text-white border-indigo-700";
                } else if (isAnswered) {
                  btnStyle = "bg-emerald-500 text-white border-emerald-600";
                } else if (isVisited) {
                  btnStyle = "bg-amber-100 text-amber-900 border-amber-300";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goToQuestion(idx)}
                    className={`h-10 rounded-lg text-xs font-bold border transition-all relative ${btnStyle} ${
                      isCurrent ? "ring-2 ring-blue-500 ring-offset-2 scale-105" : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Candidate summary info card */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold text-slate-800">{totalQ}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-bold text-emerald-600">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Unanswered:</span>
                <span className="font-bold text-slate-600">{unansweredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Marked for Review:</span>
                <span className="font-bold text-indigo-600">
                  {Object.values(reviewedQuestions).filter(Boolean).length}
                </span>
              </div>
            </div>

            {/* Big Submit Button */}
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="mt-6 w-full inline-flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition-all"
            >
              <Send className="w-4 h-4 mr-2" />
              Finalize & Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Warning Modal (Tab Switch / Fullscreen exit) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-7 shadow-2xl border-2 border-red-500 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">SECURITY WARNING</h3>

            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {warningMessage}
            </p>

            <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-xs text-red-800 text-left">
              <strong>Recorded Incidents:</strong> {tabSwitchCount} tab switch(es) / window focus shifts. Continued interruptions may result in automatic disqualification.
            </div>

            <button
              type="button"
              onClick={() => {
                setShowWarningModal(false);
                enterFullscreen();
              }}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              I Understand & Resume Exam
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Confirm Exam Submission</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to finalize and submit your assessment?
              </p>
            </div>

            {/* Answered / Unanswered stats */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Answered</div>
                <div className="text-xl font-extrabold text-emerald-600">
                  {answeredCount} / {totalQ}
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Unanswered</div>
                <div className="text-xl font-extrabold text-amber-600">{unansweredCount}</div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
              <Lock className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Once submitted, your responses will be locked and cannot be changed. Evaluation is
                automatic and instantaneous.
              </span>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className="w-1/2 py-3 px-4 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleFinalSubmit(false)}
                className="w-1/2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Submit Exam</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
