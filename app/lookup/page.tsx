"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  FileSearch,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  User,
  Hash,
  BookOpen,
} from "lucide-react";

export default function StudentLookupPage() {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationNumber.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("/api/student/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationNumber: registrationNumber.trim(),
          courseCode: courseCode.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      } else {
        setError(resData.error || "No matching student exam records found.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 mb-3">
              <FileSearch className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Candidate Exam & Certificate Retrieval
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Find My Exam Results</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Lookup your completed assessments, view your final scores, and access your earned
              certificates using your Registration Number.
            </p>
          </div>

          {/* Search Card */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4 text-blue-500" />
                    </div>
                    <input
                      type="text"
                      required
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. 22CS045"
                      className="block w-full pl-10 pr-4 py-2.5 text-sm font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Course Code (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="e.g. ML15"
                      className="block w-full pl-10 pr-4 py-2.5 text-sm font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !registrationNumber.trim()}
                className="w-full inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="flex items-center">
                    <Search className="w-4 h-4 mr-2" /> Find Exam Records
                  </span>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                {error}
              </div>
            )}
          </div>

          {/* Results List */}
          {data && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{data.student.name}</h3>
                  <p className="text-xs text-slate-500">
                    {data.student.registrationNumber} &bull; {data.student.department} ({data.student.college})
                  </p>
                </div>
                <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                  {data.attempts.length} Record(s) Found
                </span>
              </div>

              <div className="space-y-3">
                {data.attempts.map((att: any) => {
                  const isPassed = att.result === "PASSED";
                  return (
                    <div
                      key={att.id}
                      className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {att.courseCode}
                          </span>
                          <h4 className="font-bold text-slate-900 text-base">{att.courseName}</h4>
                        </div>
                        <p className="text-xs text-slate-500">{att.examTitle}</p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-slate-900">
                            {att.percentage ? `${att.percentage.toFixed(1)}%` : "Incomplete"}
                          </div>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              isPassed
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {att.result}
                          </span>
                        </div>

                        <Link
                          href={`/results/${att.id}`}
                          className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
                        >
                          View Result
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
