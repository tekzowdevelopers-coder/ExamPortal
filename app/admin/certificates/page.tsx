"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  User,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/certificates");
      const data = await res.json();
      if (res.ok) setCertificates(data.certificates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (certificateId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "VALID" ? "REVOKED" : "VALID";
    try {
      const res = await fetch("/api/admin/certificates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId, status: nextStatus }),
      });
      if (res.ok) fetchCertificates();
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const filtered = certificates.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.certificateId.toLowerCase().includes(q) ||
      c.student.name.toLowerCase().includes(q) ||
      c.student.registrationNumber.toLowerCase().includes(q) ||
      c.course.courseName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Issued Digital Certificates</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit and verify all automatically minted certificates, unique identifiers, and revocation status.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Certificate ID, candidate name..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900"
          />
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-3 px-6">Certificate ID</th>
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-6">Registration No</th>
                <th className="py-3 px-6">Course</th>
                <th className="py-3 px-6 text-right">Score</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-right">Issue Date</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading credentials registry...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((cert) => {
                  const isValid = cert.verificationStatus === "VALID";
                  return (
                    <tr key={cert.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-blue-700">
                        {cert.certificateId}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">{cert.student.name}</td>
                      <td className="py-4 px-6 font-mono text-slate-600">
                        {cert.student.registrationNumber}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {cert.course.courseName}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {cert.attempt?.score ?? "—"} ({cert.attempt?.percentage.toFixed(0)}%)
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                            isValid
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {cert.verificationStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500">
                        {formatDate(cert.issueDate)}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/verify/${cert.certificateId}`}
                          target="_blank"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Verify <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(cert.certificateId, cert.verificationStatus)}
                          className={`text-xs underline ${
                            isValid ? "text-red-500 hover:text-red-700" : "text-emerald-600 hover:text-emerald-800"
                          }`}
                        >
                          {isValid ? "Revoke" : "Re-Validate"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No certificates issued yet. Certificates are minted automatically when candidates pass assessments.
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
