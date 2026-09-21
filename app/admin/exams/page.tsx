"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Clock,
  Award,
  HelpCircle,
  Sliders,
  CheckSquare,
  Square,
  Sparkles,
} from "lucide-react";

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    duration: 60,
    totalQuestions: 30,
    marksPerQuestion: 1.0,
    negativeMark: 0.0,
    passingPercentage: 50.0,
    status: "PUBLISHED",
    randomizeQuestions: true,
    randomizeOptions: true,
    showResultImmediately: true,
    showCorrectAnswers: true,
    allowReview: true,
    fullscreenRequired: true,
    tabSwitchWarning: true,
    maxTabSwitches: 5,
    certificateGeneration: true,
  });

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exams");
      const data = await res.json();
      if (res.ok) setExams(data.exams || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch (e) {}
  };

  const handleOpenAdd = () => {
    setEditingExam(null);
    setFormData({
      courseId: courses[0]?.id || "",
      title: "Comprehensive Final Assessment",
      duration: 60,
      totalQuestions: 30,
      marksPerQuestion: 1.0,
      negativeMark: 0.0,
      passingPercentage: 50.0,
      status: "PUBLISHED",
      randomizeQuestions: true,
      randomizeOptions: true,
      showResultImmediately: true,
      showCorrectAnswers: true,
      allowReview: true,
      fullscreenRequired: true,
      tabSwitchWarning: true,
      maxTabSwitches: 5,
      certificateGeneration: true,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (exam: any) => {
    setEditingExam(exam);
    setFormData({
      courseId: exam.courseId,
      title: exam.title,
      duration: exam.duration,
      totalQuestions: exam.totalQuestions,
      marksPerQuestion: exam.marksPerQuestion,
      negativeMark: exam.negativeMark,
      passingPercentage: exam.passingPercentage,
      status: exam.status,
      randomizeQuestions: exam.randomizeQuestions,
      randomizeOptions: exam.randomizeOptions,
      showResultImmediately: exam.showResultImmediately,
      showCorrectAnswers: exam.showCorrectAnswers,
      allowReview: exam.allowReview,
      fullscreenRequired: exam.fullscreenRequired,
      tabSwitchWarning: exam.tabSwitchWarning,
      maxTabSwitches: exam.maxTabSwitches,
      certificateGeneration: exam.certificateGeneration,
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId || !formData.title.trim()) {
      setFormError("Course and Exam Title are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const url = editingExam ? `/api/exams/${editingExam.id}` : "/api/exams";
      const method = editingExam ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save examination configuration.");
      } else {
        setShowModal(false);
        fetchExams();
      }
    } catch (e) {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete exam "${title}"?`)) return;
    try {
      const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
      if (res.ok) fetchExams();
    } catch (e) {
      alert("Failed to delete exam.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Examination Configuration</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure examination rules, timing, anti-cheating tolerances, scoring formulas, and certificate eligibility.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Exam
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            Loading examination profiles...
          </div>
        ) : exams.length > 0 ? (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {exam.course.courseCode}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      exam.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : exam.status === "DRAFT"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {exam.status}
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-snug">{exam.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Course: {exam.course.courseName}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-slate-100 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-slate-400 font-medium">Duration</div>
                    <div className="font-bold text-slate-900 mt-0.5">{exam.duration}m</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-slate-400 font-medium">Questions</div>
                    <div className="font-bold text-slate-900 mt-0.5">{exam.totalQuestions}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-slate-400 font-medium">Pass Mark</div>
                    <div className="font-bold text-emerald-600 mt-0.5">{exam.passingPercentage}%</div>
                  </div>
                </div>

                {/* Badges of Key Settings */}
                <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-600">
                  {exam.randomizeQuestions && (
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">Random Qs</span>
                  )}
                  {exam.fullscreenRequired && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium">Fullscreen</span>
                  )}
                  {exam.showCorrectAnswers && (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">Show Answers</span>
                  )}
                  {exam.certificateGeneration && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">Auto-Certificate</span>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{exam._count?.attempts ?? 0} attempt(s)</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEdit(exam)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id, exam.title)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No examinations configured. Click "Create Exam" to begin.
          </div>
        )}
      </div>

      {/* Create / Edit Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingExam ? "Configure Examination & Security Settings" : "Create New Examination"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Linked Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                  >
                    <option value="">Select a course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.courseName} ({c.courseCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Exam Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Machine Learning Final Assessment"
                    className="block w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Metrics & Scoring */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.totalQuestions}
                    onChange={(e) =>
                      setFormData({ ...formData, totalQuestions: Number(e.target.value) })
                    }
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Passing (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.passingPercentage}
                    onChange={(e) =>
                      setFormData({ ...formData, passingPercentage: Number(e.target.value) })
                    }
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Negative Mark
                  </label>
                  <input
                    type="number"
                    step={0.25}
                    min={0}
                    value={formData.negativeMark}
                    onChange={(e) =>
                      setFormData({ ...formData, negativeMark: Number(e.target.value) })
                    }
                    className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Exam Security & Anti-Cheating Settings (Requirement 27) */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-blue-700 mb-3 flex items-center">
                  <Sliders className="w-3.5 h-3.5 mr-1" />
                  Anti-Cheating & Randomization Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.randomizeQuestions}
                      onChange={(e) =>
                        setFormData({ ...formData, randomizeQuestions: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Randomize Questions</span>
                      <p className="text-[11px] text-slate-500">Shuffles question order per candidate</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fullscreenRequired}
                      onChange={(e) =>
                        setFormData({ ...formData, fullscreenRequired: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Enforce Fullscreen</span>
                      <p className="text-[11px] text-slate-500">Prompts & flags fullscreen exits</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.tabSwitchWarning}
                      onChange={(e) =>
                        setFormData({ ...formData, tabSwitchWarning: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Detect Tab Switching</span>
                      <p className="text-[11px] text-slate-500">Records window blur & tab exits</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showCorrectAnswers}
                      onChange={(e) =>
                        setFormData({ ...formData, showCorrectAnswers: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Show Answers After Exam</span>
                      <p className="text-[11px] text-slate-500">Allows candidates to review answers</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.certificateGeneration}
                      onChange={(e) =>
                        setFormData({ ...formData, certificateGeneration: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div>
                      <span className="font-bold text-slate-800">Mint Certificate on Pass</span>
                      <p className="text-[11px] text-slate-500">Mints verifiable certificate ID</p>
                    </div>
                  </label>

                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Status</span>
                      <p className="text-[11px] text-slate-500">Exam accessibility state</p>
                    </div>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="px-2 py-1 text-xs bg-white border border-slate-300 rounded font-semibold text-slate-800"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {saving ? "Saving..." : editingExam ? "Update Exam" : "Create Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
