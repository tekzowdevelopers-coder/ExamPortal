import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Award, CheckCircle2 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="relative h-12 w-44">
              <Image
                src="/images/tekzow-logo.png"
                alt="Tekzow Logo"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Tekzow Examination Portal is an enterprise-grade online MCQ assessment platform
              delivering secure testing, anti-cheating deterrence, automated real-time evaluation,
              and tamper-proof digital certificate generation.
            </p>
            <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2">
              <span className="inline-flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                Anti-Cheating Engine
              </span>
              <span className="inline-flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-blue-500" />
                Secure Evaluation
              </span>
              <span className="inline-flex items-center">
                <Award className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Verified Certificates
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Take Examination
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-blue-600 transition-colors">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/lookup" className="hover:text-blue-600 transition-colors">
                  Candidate Result Lookup
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-blue-600 transition-colors">
                  Admin & Trainer Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">
              Support & Verification
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Certificates issued through this portal carry a unique identification code and can be
              publicly validated anytime by academic institutions and employers.
            </p>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Verification URL format:</span>
              <br />
              <code className="text-blue-600">tekzow.com/verify/[CERT-ID]</code>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tekzow Technologies. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Powered by Tekzow Assessment Engine &bull; Confidential & Secure
          </p>
        </div>
      </div>
    </footer>
  );
}
