"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  User,
  Hash,
  Building,
  GraduationCap,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  KeyRound,
} from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [courseCode, setCourseCode] = useState(searchParams.get("courseCode") || "");
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [batch, setBatch] = useState("");
  const [yearSemester, setYearSemester] = useState("");

  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cachedCourse = sessionStorage.getItem("tekzow_course");
    const cachedExam = sessionStorage.getItem("tekzow_exam");
    if (cachedCourse && cachedExam) {
      try {
        const c = JSON.parse(cachedCourse);
        const e = JSON.parse(cachedExam);
        if (!courseCode || courseCode.toUpperCase() === c.courseCode.toUpperCase()) {
          setCourseInfo(c);
          setExamInfo(e);
          if (!courseCode) setCourseCode(c.courseCode);
          return;
        }
      } catch (err) {}
    }

    if (courseCode) {
      fetchCourseDetails(courseCode);
    }
  }, [courseCode]);

  const fetchCourseDetails = async (code: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/validate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode: code.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setCourseInfo(data.course);
        setExamInfo(data.exam);
        sessionStorage.setItem("tekzow_course", JSON.stringify(data.course));
        sessionStorage.setItem("tekzow_exam", JSON.stringify(data.exam));
      } else {
        setError(data.error || "Course code could not be verified.");
      }
    } catch (e) {
      setError("Network error while validating course.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !registrationNumber.trim() || !college.trim() || !department.trim()) {
      setError("Please fill in all mandatory fields (marked with *).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          registrationNumber: registrationNumber.trim(),
          college: college.trim(),
          department: department.trim(),
          courseCode: courseCode.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          batch: batch.trim() || undefined,
          yearSemester: yearSemester.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadySubmitted) {
          setError("You have already completed this examination. A second attempt is not available.");
          if (data.attemptId) {
            setTimeout(() => {
              router.push(`/results/${data.attemptId}`);
            }, 2500);
          }
        } else {
          setError(data.error || "Registration failed. Please verify your details.");
        }
        setSubmitting(false);
        return;
      }

      sessionStorage.setItem("tekzow_student", JSON.stringify(data.student));
      sessionStorage.setItem("tekzow_course", JSON.stringify(data.course));
      sessionStorage.setItem("tekzow_exam", JSON.stringify(data.exam));

      router.push(`/instructions?examId=${data.exam.id}&studentId=${data.student.id}`);
    } catch (err) {
      setError("Unable to connect to registration service.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="relative h-12 w-48 mx-auto mb-3">
          <Image
            src="/images/tekzow-logo.png"
            alt="Tekzow Logo"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Candidate Examination Registration
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Please enter your academic credentials accurately. Your name and registration number
          will appear on your final completion certificate.
        </p>
      </div>

      {/* Course Summary Card */}
      {courseInfo && examInfo && (
        <div className="mb-6 p-4 sm:p-5 bg-white rounded-xl border border-blue-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-1">
              Enrolled Course
            </span>
            <h3 className="text-lg font-bold text-slate-900">{courseInfo.courseName}</h3>
            <p className="text-xs text-slate-500">
              Trainer: <span className="font-semibold text-slate-700">{courseInfo.trainerName}</span> ({courseInfo.trainerDesignation})
            </p>
          </div>

          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 text-right sm:text-left text-xs">
            <div className="text-slate-500">Exam: <span className="font-semibold text-slate-800">{examInfo.title}</span></div>
            <div className="text-slate-500">
              Duration: <span className="font-semibold text-blue-600">{examInfo.duration} Mins</span> &bull; Questions: <span className="font-semibold text-blue-600">{examInfo.totalQuestions}</span>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-sm text-red-800 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">Notice</h4>
              <p className="text-red-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Code Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Course Code <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4 text-blue-500" />
              </div>
              <input
                type="text"
                required
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g. ML15"
                className="block w-full pl-10 pr-4 py-2.5 text-sm font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase text-slate-900"
              />
            </div>
          </div>

          {/* Student Personal Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name (As on Certificate) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Registration Number / Roll No <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. 22CS045"
                  className="block w-full pl-10 pr-4 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Academic Institution Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                College / Institute Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. National Institute of Technology"
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Department / Branch <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Optional Contact Details */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Optional Contact Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Registration...</span>
              </div>
            ) : (
              <span className="flex items-center">
                Continue to Exam Instructions <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-slate-400">Loading registration form...</div>
          }
        >
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
