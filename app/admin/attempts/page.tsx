"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminAttemptsPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");

  useEffect(() => {
    fetchAttempts();
  }, [resultFilter]);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      let url = "/api/admin/attempts";
      if (resultFilter !== "ALL") url += `?result=${resultFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) setAttempts(data.attempts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = attempts.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.student.name.toLowerCase().includes(q) ||
      a.student.registrationNumber.toLowerCase().includes(q) ||
      a.exam.title.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidate Examination Attempts</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit candidate sessions, anti-cheating flags, score outcomes, and detailed answer sheets.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name, reg no..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500">Result:</span>
          {["ALL", "PASSED", "FAILED", "PENDING"].map((res) => (
            <button
              key={res}
              onClick={() => setResultFilter(res)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                resultFilter === res
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-6">Candidate</th>
                <th className="py-3 px-6">Course & Exam</th>
                <th className="py-3 px-6 text-right">Score</th>
                <th className="py-3 px-6 text-center">Result</th>
                <th className="py-3 px-6 text-center">Security Flags</th>
                <th className="py-3 px-6 text-right">Date</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading examination attempts...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((att) => {
                  const isPassed = att.result === "PASSED";
                  const hasFlags = att.tabSwitchCount > 0 || att.fullscreenExitCount > 0;

                  return (
                    <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{att.student.name}</div>
                        <div className="font-mono text-slate-500 text-[11px]">
                          {att.student.registrationNumber}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">
                          {att.exam.course.courseName}
                        </div>
                        <div className="text-[11px] text-slate-400">{att.exam.title}</div>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {att.score} ({att.percentage.toFixed(1)}%)
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            isPassed
                              ? "bg-emerald-100 text-emerald-800"
                              : att.result === "FAILED"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {att.result}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {hasFlags ? (
                          <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-semibold">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            {att.tabSwitchCount} tab, {att.fullscreenExitCount} fs exit
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium inline-flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Clean
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500">
                        {formatDate(att.submittedAt || att.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/admin/attempts/${att.id}`}
                          className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          Audit Review <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No examination attempt records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
