"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  HelpCircle,
  FileCheck,
  User,
  GraduationCap,
  Maximize2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AttemptDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const attemptId = params.id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/attempts/${attemptId}`);
      const resData = await res.json();
      if (res.ok) setData(resData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        Loading candidate attempt audit record...
      </div>
    );
  }

  const { attempt, breakdown, eventsLog } = data;
  const isPassed = attempt.result === "PASSED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/attempts"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to all attempts
        </Link>
        <span className="font-mono text-xs text-slate-400">Attempt ID: {attempt.id}</span>
      </div>

      {/* Candidate & Assessment Summary Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Candidate Profile
          </span>
          <h2 className="text-xl font-bold text-slate-900">{attempt.student.name}</h2>
          <div className="font-mono text-xs text-slate-600">
            Reg: <strong>{attempt.student.registrationNumber}</strong>
          </div>
          <div className="text-xs text-slate-500">
            {attempt.student.department} &bull; {attempt.student.college}
          </div>
          {attempt.student.email && (
            <div className="text-xs text-blue-600 font-mono">{attempt.student.email}</div>
          )}
        </div>

        <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Assessment Details
          </span>
          <div className="font-bold text-base text-slate-900">{attempt.exam.title}</div>
          <div className="text-xs text-slate-600">
            Course: <strong>{attempt.exam.course.courseName}</strong> ({attempt.exam.course.courseCode})
          </div>
          <div className="text-xs text-slate-500">
            Submitted: {formatDate(attempt.submittedAt || attempt.createdAt)}
          </div>
          {attempt.certificate && (
            <div className="pt-1">
              <Link
                href={`/verify/${attempt.certificate.certificateId}`}
                target="_blank"
                className="inline-flex items-center text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200"
              >
                <Award className="w-3.5 h-3.5 mr-1 text-purple-600" />
                Cert ID: {attempt.certificate.certificateId}
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Performance & Result
          </span>
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-black text-slate-900">
              {attempt.score}{" "}
              <span className="text-sm font-normal text-slate-400">
                ({attempt.percentage.toFixed(1)}%)
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                isPassed ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
              }`}
            >
              {attempt.result}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400">Correct</div>
              <div className="font-bold text-emerald-600">{attempt.correctCount}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400">Wrong</div>
              <div className="font-bold text-red-600">{attempt.wrongCount}</div>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <div className="text-slate-400">Unanswered</div>
              <div className="font-bold text-slate-600">{attempt.unansweredCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Cheating Incident Activity Summary (Requirement 35) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <ShieldAlert className="w-5 h-5 mr-2 text-amber-600" />
            Anti-Cheating Activity Summary
          </h3>
          <span className="text-xs text-slate-500">Authoritative Server Audit Log</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
            <div className="text-amber-800 font-semibold">Tab Switches</div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">
              {attempt.tabSwitchCount}
            </div>
          </div>
          <div className="p-3 bg-red-50/70 rounded-xl border border-red-200">
            <div className="text-red-800 font-semibold">Fullscreen Exits</div>
            <div className="text-xl font-extrabold text-red-900 mt-0.5">
              {attempt.fullscreenExitCount}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-600 font-semibold">Total Audit Events</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {eventsLog.length}
            </div>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
            <div className="text-emerald-800 font-semibold">Submission Mode</div>
            <div className="text-sm font-bold text-emerald-900 mt-1">
              {attempt.status === "SUBMITTED" ? "Manual / Auto Verified" : attempt.status}
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        {eventsLog.length > 0 && (
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-500 mb-2">Event Timeline Log:</div>
            <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px]">
              {eventsLog.map((ev: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold text-blue-700">{ev.event}</span>
                  <span className="text-slate-500">{ev.details || "—"}</span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Question-By-Question Review Sheet (Requirement 21) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">
            Complete Answer Sheet Review (Ground Truth vs Student Response)
          </h3>
          <p className="text-xs text-slate-500">
            Complete question-by-question candidate response audit
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-6">Question</th>
                <th className="py-3 px-4 text-center">Student Answer</th>
                <th className="py-3 px-4 text-center">Correct Answer</th>
                <th className="py-3 px-4 text-center">Result</th>
                <th className="py-3 px-4 text-right">Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {breakdown.map((q: any) => {
                const isCorrect = q.status === "CORRECT";
                const isUnanswered = q.status === "UNANSWERED";

                return (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400 text-center">{q.number}</td>
                    <td className="py-3 px-6 max-w-md">
                      <div className="font-semibold text-slate-900">{q.question}</div>
                      {q.explanation && (
                        <div className="text-[11px] text-slate-500 mt-1 italic">
                          Exp: {q.explanation}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {q.studentAnswer ? (
                        <span
                          className={`px-2 py-1 rounded ${
                            isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          Option {q.studentAnswer}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-200">
                        Option {q.correctAnswer}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] ${
                          isCorrect
                            ? "bg-emerald-100 text-emerald-800"
                            : isUnanswered
                            ? "bg-slate-100 text-slate-600"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {q.marksEarned}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
