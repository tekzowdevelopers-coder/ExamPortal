"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  XCircle,
  Award,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  KeyRound,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

export default function CertificateVerifyDetailPage({
  params,
}: {
  params: { certificateId: string };
}) {
  const certificateId = decodeURIComponent(params.certificateId);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/certificates/verify/${certificateId}`);
      const resData = await res.json();
      if (res.ok && resData.verified) {
        setData(resData.certificate);
      } else {
        setError(resData.error || "Certificate could not be authenticated.");
      }
    } catch (e) {
      setError("Network error validating certificate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <Link
            href="/verify"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Verify another certificate
          </Link>

          {loading ? (
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Verifying certificate authenticity against Tekzow registry...
              </p>
            </div>
          ) : error || !data ? (
            <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-red-300 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Certificate Not Verified</h2>
              <p className="text-sm text-red-700 max-w-md mx-auto">{error}</p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-xs text-slate-600 inline-block">
                Queried ID: <strong>{certificateId}</strong>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-500/80 overflow-hidden">
              {/* Header Badge */}
              <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-200" />
                  <span className="font-extrabold tracking-wide text-base">
                    Certificate Verified ✓
                  </span>
                </div>
                <span className="text-xs uppercase tracking-wider bg-emerald-700/80 px-2.5 py-1 rounded-full font-semibold">
                  Official Record
                </span>
              </div>

              {/* Certificate Verification Details Card */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-slate-100">
                  <div className="relative h-10 w-36">
                    <Image
                      src="/images/tekzow-logo.png"
                      alt="Tekzow Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Certificate ID
                    </span>
                    <span className="font-mono font-bold text-sm text-blue-800">
                      {data.certificateId}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Student
                    </span>
                    <span className="sm:col-span-2 font-bold text-slate-900 text-base">
                      {data.studentName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Registration No
                    </span>
                    <span className="sm:col-span-2 font-mono font-semibold text-slate-800">
                      {data.registrationNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Course
                    </span>
                    <span className="sm:col-span-2 font-bold text-slate-900 text-base">
                      {data.courseName}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Course Code
                    </span>
                    <span className="sm:col-span-2 font-mono font-bold text-blue-600">
                      {data.courseCode}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Trainer
                    </span>
                    <span className="sm:col-span-2 font-semibold text-slate-800">
                      {data.trainerName} ({data.trainerDesignation})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Completion Date
                    </span>
                    <span className="sm:col-span-2 text-slate-800 font-medium">
                      {data.completionDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 py-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Issued By
                    </span>
                    <span className="sm:col-span-2 text-slate-700 font-semibold">
                      {data.issuedBy}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="inline-flex items-center text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Cryptographically Authenticated
                  </span>
                  <span>Tekzow Registry</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
