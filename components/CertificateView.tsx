"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Download, Share2, CheckCircle2, ShieldCheck, Printer } from "lucide-react";
import { formatDate } from "@/lib/utils";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CertificateViewProps {
  certificateId: string;
  studentName: string;
  registrationNumber: string;
  college?: string;
  courseName: string;
  courseCode: string;
  trainerName: string;
  trainerDesignation?: string;
  issueDate: string | Date;
  score?: number;
  percentage?: number;
}

export default function CertificateView({
  certificateId,
  studentName,
  registrationNumber,
  college,
  courseName,
  courseCode,
  trainerName,
  trainerDesignation = "AI Trainer",
  issueDate,
  score,
  percentage,
}: CertificateViewProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  // Generate QR code for certificate verification link
  useEffect(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://tekzow.com";
    const verifyUrl = `${origin}/verify/${certificateId}`;
    QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("Error generating QR code:", err));
  }, [certificateId]);

  const handleDownloadPdf = async () => {
    if (!certRef.current) return;
    setDownloading(true);

    try {
      const element = certRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      // Landscape A4 dimensions: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 297;
      const pdfHeight = 210;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Tekzow_Certificate_${certificateId}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Could not generate PDF. Please try printing to PDF using the Print button.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Buttons */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2 text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Verified Credential: <strong className="font-mono text-blue-600">{certificateId}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Certificate
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow-md transition-all"
          >
            {downloading ? (
              <div className="flex items-center space-x-1.5">
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </div>
            ) : (
              <span className="flex items-center">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Download PDF Certificate
              </span>
            )}
          </button>
        </div>
      </div>

      {/* The Printable Certificate Canvas */}
      <div className="overflow-x-auto flex justify-center p-2">
        <div
          id="certificate-print-area"
          ref={certRef}
          className="relative bg-white text-slate-900 shadow-xl border-12 border-[#1E3E62] p-8 sm:p-12 w-[900px] h-[636px] shrink-0 flex flex-col justify-between"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, rgba(240, 247, 255, 0.7) 0%, #ffffff 100%)",
          }}
        >
          {/* Inner Golden Double Border */}
          <div className="absolute inset-3 border-2 border-amber-400 pointer-events-none" />
          <div className="absolute inset-4.5 border border-amber-300/60 pointer-events-none" />

          {/* Decorative Corner Ornaments */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-500" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-500" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-500" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-500" />

          {/* Certificate Header */}
          <div className="text-center pt-2 relative z-10">
            <div className="relative h-14 w-52 mx-auto mb-2">
              <Image
                src="/images/tekzow-logo.png"
                alt="Tekzow Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-[11px] font-bold tracking-[0.25em] text-[#1E3E62] uppercase">
              Online Examination & Certification Authority
            </div>
            <h2 className="text-3xl font-serif font-black tracking-wider text-slate-900 mt-2 uppercase">
              Certificate of Completion
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 via-[#007BFF] to-amber-400 mx-auto mt-2 rounded-full" />
          </div>

          {/* Certificate Body */}
          <div className="text-center my-auto py-2 relative z-10">
            <p className="text-xs font-serif italic text-slate-500 mb-1">
              This is to certify that
            </p>
            <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-blue-950 tracking-wide underline decoration-amber-400/80 decoration-2 underline-offset-4 capitalize">
              {studentName}
            </h3>
            <p className="text-xs font-mono text-slate-600 mt-1">
              Registration Number: <strong className="text-slate-800">{registrationNumber}</strong>
              {college && <span> &bull; {college}</span>}
            </p>

            <p className="text-xs font-serif italic text-slate-600 mt-4 max-w-xl mx-auto leading-relaxed">
              has successfully completed the comprehensive curriculum and assessment for
            </p>

            <div className="text-xl sm:text-2xl font-extrabold text-[#0B192C] uppercase tracking-wider mt-1">
              {courseName}
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Course Code: <strong className="font-mono text-blue-700">{courseCode}</strong> &bull; Examination Grade:{" "}
              <strong className="text-emerald-700">
                {percentage !== undefined ? `${percentage.toFixed(1)}%` : "PASSED"}
              </strong>
            </p>
          </div>

          {/* Certificate Footer */}
          <div className="pt-4 border-t border-slate-200 grid grid-cols-3 items-end relative z-10 text-xs">
            {/* Trainer & Designation */}
            <div className="text-left">
              <div className="font-serif italic text-base font-bold text-slate-800 mb-0.5 font-script">
                {trainerName}
              </div>
              <div className="w-36 h-0.5 bg-slate-400 mb-1" />
              <div className="font-bold text-slate-900">{trainerName}</div>
              <div className="text-[10px] text-slate-500">{trainerDesignation}</div>
            </div>

            {/* Verification QR Code & Certificate ID */}
            <div className="text-center flex flex-col items-center">
              {qrDataUrl && (
                <div className="w-16 h-16 relative mb-1 border border-slate-200 bg-white p-1 rounded-sm shadow-2xs">
                  <Image src={qrDataUrl} alt="Verify QR" width={64} height={64} />
                </div>
              )}
              <div className="text-[9px] uppercase tracking-wider text-slate-400">
                Certificate ID
              </div>
              <div className="font-mono font-bold text-xs text-blue-800 tracking-wider">
                {certificateId}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">
                Issued: {formatDate(issueDate)}
              </div>
            </div>

            {/* Authorized Signatory */}
            <div className="text-right flex flex-col items-end">
              <div className="font-serif italic text-base font-bold text-blue-900 mb-0.5 tracking-wider">
                Tekzow Board
              </div>
              <div className="w-36 h-0.5 bg-slate-400 mb-1" />
              <div className="font-bold text-slate-900">Authorized Signatory</div>
              <div className="text-[10px] text-slate-500">Academic Certification Council</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
