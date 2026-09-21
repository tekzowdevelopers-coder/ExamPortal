"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CertificateView from "@/components/CertificateView";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Download,
  Share2,
} from "lucide-react";

export default function ResultPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const attemptId = params.attemptId;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/exams/attempts/${attemptId}/result`);
      const resultData = await res.json();
      if (res.ok) {
        setData(resultData);
        // If passed, trigger celebratory confetti
        if (resultData.attempt.result === "PASSED") {
          triggerCelebration();
        }
      } else {
        setError(resultData.error || "Result could not be loaded.");
      }
    } catch (e) {
      setError("Network error fetching result.");
    } finally {
      setLoading(false);
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Calculating Assessment Results...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center bg-red-50 p-6 rounded-2xl border border-red-200">
            <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">Result Not Found</h2>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
            >
              Return Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { attempt, student, course, exam, certificate, breakdown } = data;
  const isPassed = attempt.result === "PASSED";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Result Banner Card */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8 text-center relative overflow-hidden">
            {/* Top Accent Strip */}
            <div
              className={`absolute top-0 inset-x-0 h-2 ${
                isPassed ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-red-500"
              }`}
            />

            {/* Logo */}
            <div className="relative h-12 w-48 mx-auto mb-4">
              <Image
                src="/images/tekzow-logo.png"
                alt="Tekzow Logo"
                fill
                className="object-contain"
              />
            </div>

            {isPassed ? (
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-1">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-slate-900">Congratulations!</h1>
                <p className="text-base text-slate-600">
                  You have successfully completed and passed the{" "}
                  <strong className="text-slate-900">{exam.title}</strong>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-1">
                  <XCircle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-slate-900">Assessment Completed</h1>
                <p className="text-base text-slate-600">
                  You did not achieve the required passing score for{" "}
                  <strong className="text-slate-900">{exam.title}</strong>
                </p>
              </div>
            )}

            {/* Candidate & Course Information Grid */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Candidate Details
                </span>
                <div className="font-bold text-base text-slate-900">{student.name}</div>
                <div className="text-xs text-slate-600 font-mono">
                  Roll / Reg: <strong className="text-slate-800">{student.registrationNumber}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  {student.department} &bull; {student.college}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Course & Trainer
                </span>
                <div className="font-bold text-base text-slate-900">{course.courseName}</div>
                <div className="text-xs text-slate-600">
                  Course Code: <strong className="font-mono text-blue-600">{course.courseCode}</strong> &bull; Duration: {course.duration}
                </div>
                <div className="text-xs text-slate-600">
                  Trainer: <strong className="text-slate-800">{course.trainerName}</strong> ({course.trainerDesignation})
                </div>
              </div>
            </div>

            {/* Performance Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Final Score</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  {attempt.score} <span className="text-sm font-normal text-slate-400">/ {exam.totalQuestions}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Percentage</div>
                <div className="text-2xl font-black text-blue-600 mt-1">
                  {attempt.percentage.toFixed(1)}%
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Correct / Wrong</div>
                <div className="text-lg font-bold text-slate-800 mt-1">
                  <span className="text-emerald-600">{attempt.correctCount}</span> /{" "}
                  <span className="text-red-500">{attempt.wrongCount}</span>
                </div>
                <div className="text-[11px] text-slate-400">{attempt.unansweredCount} Unanswered</div>
              </div>

              <div
                className={`p-4 rounded-xl border ${
                  isPassed ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                }`}
              >
                <div className="text-xs font-medium text-slate-500">Result</div>
                <div
                  className={`text-2xl font-black mt-1 ${
                    isPassed ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  {isPassed ? "PASS" : "FAIL"}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Showcase Section (If Passed) */}
          {isPassed && certificate && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 mb-1">
                    <Award className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Verified Digital Certificate Minted
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900">Official Certificate of Completion</h2>
                </div>

                <Link
                  href={`/verify/${certificate.certificateId}`}
                  target="_blank"
                  className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  Public Verification Page
                </Link>
              </div>

              {/* Render the Certificate */}
              <CertificateView
                certificateId={certificate.certificateId}
                studentName={student.name}
                registrationNumber={student.registrationNumber}
                college={student.college}
                courseName={course.courseName}
                courseCode={course.courseCode}
                trainerName={course.trainerName}
                trainerDesignation={course.trainerDesignation}
                issueDate={certificate.issueDate}
                score={attempt.score}
                percentage={attempt.percentage}
              />
            </div>
          )}

          {/* Answer Review Section (Requirement 21: Admin controlled) */}
          {breakdown && breakdown.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Question Answer Review</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive evaluation record of your submitted responses
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReview(!showReview)}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {showReview ? "Hide Details" : "Review All Answers"}
                  {showReview ? (
                    <ChevronUp className="w-4 h-4 ml-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </button>
              </div>

              {showReview && (
                <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
                  {breakdown.map((item: any, idx: number) => {
                    const isCorrect = item.status === "CORRECT";
                    const isUnanswered = item.status === "UNANSWERED";

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border text-sm ${
                          isCorrect
                            ? "bg-emerald-50/50 border-emerald-200"
                            : isUnanswered
                            ? "bg-slate-50 border-slate-200"
                            : "bg-red-50/50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-bold text-slate-900">
                            Q{idx + 1}. {item.question}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                              isCorrect
                                ? "bg-emerald-100 text-emerald-800"
                                : isUnanswered
                                ? "bg-slate-200 text-slate-700"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 my-2">
                          <div>
                            Your Answer:{" "}
                            <strong
                              className={`font-semibold ${
                                isCorrect ? "text-emerald-700" : "text-red-700"
                              }`}
                            >
                              {item.studentAnswer
                                ? `Option ${item.studentAnswer}: ${item.options[item.studentAnswer]}`
                                : "Not Answered"}
                            </strong>
                          </div>
                          <div>
                            Correct Answer:{" "}
                            <strong className="text-emerald-700 font-semibold">
                              Option {item.correctAnswer}: {item.options[item.correctAnswer]}
                            </strong>
                          </div>
                        </div>

                        {item.explanation && (
                          <div className="mt-2 text-xs text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/60">
                            <strong>Explanation:</strong> {item.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
