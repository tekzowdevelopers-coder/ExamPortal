"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Users,
  FileCheck2,
  FileText,
  Award,
  TrendingUp,
  PlusCircle,
  Upload,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "TOTAL COURSES",
      value: data?.stats?.totalCourses ?? "--",
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      link: "/admin/courses",
    },
    {
      title: "TOTAL STUDENTS",
      value: data?.stats?.totalStudents ?? "--",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      link: "/admin/students",
    },
    {
      title: "TOTAL EXAMS",
      value: data?.stats?.totalExams ?? "--",
      icon: FileCheck2,
      color: "text-sky-600 bg-sky-50 border-sky-200",
      link: "/admin/exams",
    },
    {
      title: "TOTAL ATTEMPTS",
      value: data?.stats?.totalAttempts ?? "--",
      icon: FileText,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/admin/attempts",
    },
    {
      title: "PASS RATE",
      value: data?.stats ? `${data.stats.passRate}%` : "--",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      link: "/admin/analytics",
    },
    {
      title: "CERTIFICATES",
      value: data?.stats?.totalCertificates ?? "--",
      icon: Award,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      link: "/admin/certificates",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            Tekzow Assessment & Certification Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Administrator Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of course enrollments, active MCQ question banks, real-time exam attempts, and
            issued credentials.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/courses?action=add"
            className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Course
          </Link>
          <Link
            href="/admin/questions"
            className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4 mr-1.5 text-blue-600" />
            Manage Questions
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 group-hover:text-slate-600 transition-colors">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                {card.value}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Exams Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Examinations</h2>
            <p className="text-xs text-slate-500">
              Overview of active assessment sessions and candidate attempts
            </p>
          </div>
          <Link
            href="/admin/exams"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center"
          >
            View All Exams <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-6">Course</th>
                <th className="py-3 px-6">Course Code</th>
                <th className="py-3 px-6">Exam Title</th>
                <th className="py-3 px-6 text-right">Duration</th>
                <th className="py-3 px-6 text-right">Attempts</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data?.recentExams && data.recentExams.length > 0 ? (
                data.recentExams.map((exam: any) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {exam.course.courseName}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-blue-600">
                      {exam.course.courseCode}
                    </td>
                    <td className="py-4 px-6 text-slate-800">{exam.title}</td>
                    <td className="py-4 px-6 text-right text-slate-600">{exam.duration} Mins</td>
                    <td className="py-4 px-6 text-right font-bold text-slate-900">
                      {exam._count?.attempts ?? 0}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          exam.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-800"
                            : exam.status === "DRAFT"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/exams`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    No examination records configured yet.
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
