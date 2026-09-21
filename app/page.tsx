"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  HelpCircle,
  Award,
  UserCheck,
  Sparkles,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [courseCode, setCourseCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedData, setValidatedData] = useState<{
    course: any;
    exam: any;
  } | null>(null);

  const handleValidateCode = async (e?: React.FormEvent, codeToUse?: string) => {
    if (e) e.preventDefault();
    const code = (codeToUse || courseCode).trim().toUpperCase();

    if (!code) {
      setError("Please enter a valid course code.");
      return;
    }

    setLoading(true);
    setError(null);
    setValidatedData(null);

    try {
      const res = await fetch("/api/student/validate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode: code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Course code not found. Please check the code and try again.");
      } else {
        setValidatedData(data);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartRegistration = () => {
    if (!validatedData) return;
    // Store validated course & exam in sessionStorage for smooth registration
    sessionStorage.setItem("tekzow_course", JSON.stringify(validatedData.course));
    sessionStorage.setItem("tekzow_exam", JSON.stringify(validatedData.exam));
    router.push(`/register?courseCode=${validatedData.course.courseCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-radial from-blue-50/70 via-white to-white py-12 lg:py-18">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Tekzow Badge */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-500 animate-pulse" />
              Official Tekzow Examination & Certification Portal
            </div>

            <div className="relative h-16 w-56 sm:w-64 mx-auto mb-6">
              <Image
                src="/images/tekzow-logo.png"
                alt="Tekzow Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Online Examination &{" "}
              <span className="bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">
                Certificate Portal
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Enter the unique course code provided by your trainer to verify your eligibility,
              take the timed assessment, and instantly earn your accredited certificate.
            </p>

            {/* Course Code Input Form */}
            <div className="mt-10 max-w-xl mx-auto">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200/80 transition-all hover:border-blue-300">
                <form onSubmit={(e) => handleValidateCode(e)} className="space-y-4">
                  <label
                    htmlFor="courseCodeInput"
                    className="block text-left text-sm font-bold text-slate-800"
                  >
                    Enter Your Course Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      id="courseCodeInput"
                      type="text"
                      value={courseCode}
                      onChange={(e) => {
                        setCourseCode(e.target.value);
                        setError(null);
                      }}
                      placeholder="e.g. ML15"
                      className="block w-full pl-12 pr-4 py-3.5 text-lg font-mono font-bold tracking-wider text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white uppercase placeholder:normal-case placeholder:font-normal placeholder:text-slate-400 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !courseCode.trim()}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Validating Course Code...</span>
                      </div>
                    ) : (
                      <span className="flex items-center">
                        Verify & Continue <ArrowRight className="ml-2 w-5 h-5" />
                      </span>
                    )}
                  </button>
                </form>

                {/* Quick Test Demo Helper */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Demo Course:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCourseCode("ML15");
                      handleValidateCode(undefined, "ML15");
                    }}
                    className="font-mono font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 transition-colors"
                  >
                    Use Code: ML15
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-left flex items-start space-x-3 text-sm text-red-800 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">Invalid Course Code</h4>
                      <p className="text-red-700 mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                {/* Course Found Card */}
                {validatedData && (
                  <div className="mt-6 p-5 sm:p-6 rounded-xl bg-emerald-50/80 border-2 border-emerald-500/80 text-left animate-fadeIn">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold text-base mb-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <span>Course Found ✓</span>
                    </div>

                    <div className="space-y-3 bg-white p-4 rounded-lg border border-emerald-200/60 shadow-xs text-sm">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Course
                        </span>
                        <div className="text-lg font-bold text-slate-900">
                          {validatedData.course.courseName}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Course Code
                          </span>
                          <div className="font-mono font-bold text-blue-600">
                            {validatedData.course.courseCode}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Duration
                          </span>
                          <div className="font-semibold text-slate-700">
                            {validatedData.course.duration}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Trainer
                          </span>
                          <div className="font-semibold text-slate-800">
                            {validatedData.course.trainerName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {validatedData.course.trainerDesignation}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Assessment
                          </span>
                          <div className="font-semibold text-slate-800">
                            {validatedData.exam.title}
                          </div>
                          <div className="text-xs text-slate-500">
                            {validatedData.exam.totalQuestions} MCQs &bull; {validatedData.exam.duration} Mins
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartRegistration}
                      className="mt-5 w-full inline-flex items-center justify-center px-6 py-3.5 text-base font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all"
                    >
                      Start Registration <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Pillars */}
        <section className="py-14 bg-slate-50/60 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl font-bold text-slate-900">
                Examination Architecture & Security
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Engineered with strict academic standards to guarantee fair evaluation and reliable credentialing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Anti-Cheating Engine</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Real-time fullscreen enforcement, tab-switch tracking, copy/paste prevention,
                  and randomized question pools to minimize answer sharing.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Authoritative Timer & Auto-Save</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every selection saves automatically to prevent data loss. The server-authoritative
                  countdown submits automatically upon time expiration.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Certificate Minting</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Candidates achieving the required passing score automatically receive a verifiable,
                  downloadable PDF certificate with a globally unique verification ID.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
