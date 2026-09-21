"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Search, ArrowRight, Award, CheckCircle2 } from "lucide-react";

export default function CertificateVerifySearchPage() {
  const router = useRouter();
  const [certId, setCertId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certId.trim().toUpperCase();
    if (cleanId) {
      router.push(`/verify/${cleanId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
            Public Credential Verification
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Verify a Tekzow Certificate
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
            Employers, academic bodies, and candidates can verify the validity of any Tekzow issued
            digital certificate using its unique Certificate ID.
          </p>

          {/* Search Box */}
          <div className="mt-8 bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200">
            <form onSubmit={handleSearch} className="space-y-4">
              <label htmlFor="certInput" className="block text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                Enter Certificate ID
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5 text-blue-500" />
                </div>
                <input
                  id="certInput"
                  type="text"
                  required
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="e.g. TZ-ML-2026-000123"
                  className="block w-full pl-11 pr-4 py-3.5 text-base font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={!certId.trim()}
                className="w-full inline-flex items-center justify-center px-6 py-3.5 text-base font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
              >
                <span>Verify Credential Authenticity</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </form>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="font-bold text-xs text-slate-900">Tamper-Proof</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Records are generated server-side upon successful exam evaluation.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-blue-600 mb-2" />
              <h4 className="font-bold text-xs text-slate-900">Instant Lookup</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Real-time validation against the central database without delay.
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <Award className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="font-bold text-xs text-slate-900">Academic Integrity</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Displays verified candidate name, course code, and trainer details.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
