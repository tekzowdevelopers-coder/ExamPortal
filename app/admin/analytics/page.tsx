"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  PieChart,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
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
        Compiling examination analytics & charts...
      </div>
    );
  }

  const { stats, distribution, courses } = data;
  const passedCount = stats.passedCount || 0;
  const failedCount = stats.failedCount || 0;
  const totalSubmitted = stats.submittedCount || 1;
  const passPercent = ((passedCount / totalSubmitted) * 100).toFixed(1);
  const failPercent = ((failedCount / totalSubmitted) * 100).toFixed(1);

  // Maximum count for histogram scaling
  const maxBucket = Math.max(...distribution.map((d: any) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assessment Analytics & Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Real-time statistical evaluation of cohort score distributions, pass rates, and course activity.
        </p>
      </div>

      {/* Metrics Row (Requirement 26) */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Attempts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalAttempts}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Passed</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{stats.passedCount}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Failed</div>
          <div className="text-2xl font-black text-red-600 mt-1">{stats.failedCount}</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pass Rate</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{stats.passRate}%</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Score</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.avgScore}%</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highest Score</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{stats.highestScore}%</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certificates</div>
          <div className="text-2xl font-black text-purple-600 mt-1">{stats.totalCertificates}</div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Histogram */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Score Distribution Histogram
            </h3>
            <span className="text-xs text-slate-500">Percentage Buckets</span>
          </div>

          <div className="space-y-3 pt-2">
            {distribution.map((bucket: any, idx: number) => {
              const widthPct = (bucket.count / maxBucket) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{bucket.range}</span>
                    <span className="font-mono text-slate-900 font-bold">{bucket.count} students</span>
                  </div>
                  <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-sky-500 rounded-lg transition-all duration-500"
                      style={{ width: `${Math.max(widthPct, bucket.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pass vs Fail Ratio */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-emerald-600" />
                Pass vs Fail Ratio
              </h3>
              <span className="text-xs text-slate-500">{stats.submittedCount} Submissions</span>
            </div>

            {/* Split Bar */}
            <div className="mt-6">
              <div className="h-8 w-full rounded-xl overflow-hidden flex bg-slate-100 shadow-inner">
                <div
                  className="h-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                  style={{ width: `${passPercent}%` }}
                >
                  {passedCount > 0 ? `${passPercent}%` : ""}
                </div>
                <div
                  className="h-full bg-red-500 flex items-center justify-center text-xs font-bold text-white transition-all duration-500"
                  style={{ width: `${failPercent}%` }}
                >
                  {failedCount > 0 ? `${failPercent}%` : ""}
                </div>
              </div>
            </div>

            {/* Legend Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Passed Candidates</span>
                </div>
                <div className="text-2xl font-black text-emerald-700 mt-2">{passedCount}</div>
                <p className="text-xs text-emerald-600 mt-0.5">{passPercent}% of submissions</p>
              </div>

              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center space-x-2 text-red-800 font-bold text-sm">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>Failed Candidates</span>
                </div>
                <div className="text-2xl font-black text-red-700 mt-2">{failedCount}</div>
                <p className="text-xs text-red-600 mt-0.5">{failPercent}% of submissions</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 text-center">
            Passing threshold configured at standard 50.0%
          </div>
        </div>
      </div>

      {/* Attempts by Course Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Performance By Course Curriculum</h3>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <th className="py-3 px-6">Course</th>
              <th className="py-3 px-6">Course Code</th>
              <th className="py-3 px-6 text-center">Exams</th>
              <th className="py-3 px-6 text-center">Question Pool</th>
              <th className="py-3 px-6 text-center">Certificates Issued</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {courses.map((c: any) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-bold text-slate-900">{c.courseName}</td>
                <td className="py-4 px-6 font-mono font-bold text-blue-600">{c.courseCode}</td>
                <td className="py-4 px-6 text-center font-semibold">{c._count?.exams ?? 0}</td>
                <td className="py-4 px-6 text-center font-bold text-slate-800">
                  {c._count?.questions ?? 0}
                </td>
                <td className="py-4 px-6 text-center font-bold text-emerald-600">
                  {c._count?.certificates ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
