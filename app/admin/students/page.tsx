"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Award,
  ArrowRight,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");

  useEffect(() => {
    fetchStudents();
  }, [selectedCollege, selectedDept]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCollege !== "ALL") params.append("college", selectedCollege);
      if (selectedDept !== "ALL") params.append("department", selectedDept);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
        if (data.colleges) setColleges(data.colleges);
        if (data.departments) setDepartments(data.departments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q) ||
      s.college.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View registered candidates, academic institution affiliations, scores, and issued certificates.
          </p>
        </div>

        <a
          href="/api/admin/students?export=true"
          className="inline-flex items-center px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition-colors"
        >
          <Download className="w-4 h-4 mr-1.5 text-slate-600" />
          Export All Students (CSV)
        </a>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, reg no, college..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900"
          />
        </div>

        <div>
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
          >
            <option value="ALL">All Colleges</option>
            {colleges.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table (Requirement 25) */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Reg No</th>
                <th className="py-3 px-6">College</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Course</th>
                <th className="py-3 px-6 text-right">Score</th>
                <th className="py-3 px-6 text-center">Result</th>
                <th className="py-3 px-6 text-center">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading student directory...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((s) => {
                  const latest = s.attempts[0];
                  const isPassed = latest?.result === "PASSED";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{s.name}</td>
                      <td className="py-4 px-6 font-mono font-semibold text-slate-700">
                        {s.registrationNumber}
                      </td>
                      <td className="py-4 px-6 text-slate-600 max-w-xs truncate">{s.college}</td>
                      <td className="py-4 px-6 text-slate-600">{s.department}</td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {latest?.exam?.course?.courseName || "—"}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {latest ? `${latest.score} (${latest.percentage.toFixed(0)}%)` : "—"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {latest ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold ${
                              isPassed
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {latest.result}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not attempted</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {latest?.certificate ? (
                          <Link
                            href={`/verify/${latest.certificate.certificateId}`}
                            target="_blank"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-mono font-bold"
                          >
                            <Award className="w-3.5 h-3.5 mr-1 text-amber-500" />
                            {latest.certificate.certificateId.slice(-8)}
                          </Link>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No student records found.
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
