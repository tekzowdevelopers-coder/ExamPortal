"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldAlert,
  Clock,
  HelpCircle,
  Award,
  CheckSquare,
  Square,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

function InstructionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get("examId");
  const studentId = searchParams.get("studentId");

  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [student, setStudent] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);

  useEffect(() => {
    const s = sessionStorage.getItem("tekzow_student");
    const c = sessionStorage.getItem("tekzow_course");
    const e = sessionStorage.getItem("tekzow_exam");
    if (s && c && e) {
      setStudent(JSON.parse(s));
      setCourse(JSON.parse(c));
      setExam(JSON.parse(e));
    }
  }, []);

  const handleStartExam = async () => {
    if (!agreed) {
      setError("You must acknowledge and agree to the examination instructions before proceeding.");
      return;
    }

    const currentExamId = examId || exam?.id;
    const currentStudentId = studentId || student?.id;

    if (!currentExamId || !currentStudentId) {
      setError("Invalid examination session. Please return to the homepage and register.");
      return;
    }

    setStarting(true);
    setError(null);

    try {
      const res = await fetch(`/api/exams/${currentExamId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: currentStudentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadySubmitted) {
          setError(data.error || "You have already completed this examination.");
          if (data.attemptId) {
            router.push(`/results/${data.attemptId}`);
          }
        } else {
          setError(data.error || "Failed to start examination. Please contact support.");
        }
        setStarting(false);
        return;
      }

      sessionStorage.setItem("tekzow_active_attempt", JSON.stringify(data));
      router.push(`/exam/${data.attemptId}`);
    } catch (e) {
      setError("Network error starting exam. Please check your connection.");
      setStarting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div className="relative h-12 w-44">
            <Image
              src="/images/tekzow-logo.png"
              alt="Tekzow Logo"
              fill
              className="object-contain"
            />
          </div>

          {student && (
            <div className="text-right sm:text-right bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs">
              <span className="text-slate-500">Candidate: </span>
              <span className="font-bold text-slate-800">{student.name}</span>
              <span className="text-slate-400"> ({student.registrationNumber})</span>
            </div>
          )}
        </div>

        <div className="mt-6">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Official Examination Guidelines
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {exam?.title || "Examination Assessment"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Course: <span className="font-semibold text-slate-800">{course?.courseName || "Machine Learning"}</span> &bull; Course Code: <span className="font-mono font-bold text-blue-600">{course?.courseCode || "ML15"}</span> &bull; Trainer: <span className="font-semibold text-slate-800">{course?.trainerName || "Sankar K"}</span>
          </p>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-sm">
          <div>
            <div className="text-xs text-slate-500 font-medium">Duration</div>
            <div className="text-lg font-bold text-slate-900 flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1 text-blue-600" />
              {exam?.duration || 60} Mins
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Questions</div>
            <div className="text-lg font-bold text-slate-900 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 mr-1 text-indigo-600" />
              {exam?.totalQuestions || 30}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Marks</div>
            <div className="text-lg font-bold text-slate-900 flex items-center justify-center">
              <Award className="w-4 h-4 mr-1 text-emerald-600" />
              {exam?.totalQuestions || 30}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Passing Score</div>
            <div className="text-lg font-bold text-emerald-600 flex items-center justify-center">
              {exam?.passingPercentage || 50}%
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Body */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <ShieldAlert className="w-5 h-5 mr-2 text-blue-600" />
          General Rules & Anti-Cheating Protocol
        </h2>

        <div className="space-y-3.5 text-sm text-slate-700 leading-relaxed">
          <div className="flex items-start">
            <span className="font-bold text-blue-600 mr-2.5">1.</span>
            <span>
              <strong>Read carefully:</strong> Review each question thoroughly before selecting an answer. You can navigate back and forth between questions anytime using the question palette.
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold text-blue-600 mr-2.5">2.</span>
            <span>
              <strong>Single Choice Selection:</strong> Each MCQ has 4 options (A, B, C, D) with exactly one correct option.
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold text-blue-600 mr-2.5">3.</span>
            <span>
              <strong>Auto-Save Protection:</strong> Every option you click is immediately saved on the server. If your device restarts or disconnects temporarily, your saved progress is preserved.
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold text-blue-600 mr-2.5">4.</span>
            <span>
              <strong>Fullscreen Requirement:</strong> The exam will request full-screen display upon start. Exiting fullscreen mode is flagged and recorded on your exam audit log.
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold text-blue-600 mr-2.5">5.</span>
            <span>
              <strong>Tab-Switch Detection:</strong> Leaving the active examination tab or opening background windows is strictly prohibited and logged automatically as a security incident.
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold text-blue-600 mr-2.5">6.</span>
            <span>
              <strong>No Copy / No Paste:</strong> Right-clicking, clipboard copying, text selection, and inspection developer tools are disabled throughout the session.
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold text-blue-600 mr-2.5">7.</span>
            <span>
              <strong>Authoritative Timer:</strong> The countdown timer is tracked on the server. When the timer hits 00:00:00, your exam will automatically submit and finalize.
            </span>
          </div>

          <div className="flex items-start">
            <span className="font-bold text-blue-600 mr-2.5">8.</span>
            <span>
              <strong>Single Attempt Only:</strong> Once submitted or expired, this attempt cannot be restarted or edited.
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-sm text-red-800 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Agreement Checkbox */}
        <div className="mt-8 pt-6 border-t border-slate-200">
          <label
            onClick={() => setAgreed(!agreed)}
            className="flex items-start cursor-pointer select-none group p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors"
          >
            <div className="mt-0.5 mr-3 shrink-0 text-blue-600">
              {agreed ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
              )}
            </div>
            <span className="text-sm font-semibold text-slate-800">
              I have read, understood, and agree to abide by all the examination instructions and anti-cheating protocols stated above.
            </span>
          </label>

          {/* Start Exam Button */}
          <button
            type="button"
            onClick={handleStartExam}
            disabled={!agreed || starting}
            className="mt-6 w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-extrabold rounded-xl text-white bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {starting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Configuring Examination Environment...</span>
              </div>
            ) : (
              <span className="flex items-center tracking-wide">
                START EXAM NOW <ArrowRight className="ml-2 w-6 h-6" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InstructionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-slate-400">Loading instructions...</div>
          }
        >
          <InstructionsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
