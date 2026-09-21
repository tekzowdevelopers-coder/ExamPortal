"use client";

import React, { useState, useEffect } from "react";
import {
  FileQuestion,
  Plus,
  Search,
  Upload,
  Download,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Filter,
  FileText,
  HelpCircle,
} from "lucide-react";

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [search, setSearch] = useState("");

  // Add / Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [formData, setFormData] = useState({
    courseId: "",
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    explanation: "",
    marks: 1.0,
    difficulty: "MEDIUM",
    topic: "Machine Learning Fundamentals",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // CSV Import Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCourseId, setImportCourseId] = useState("");
  const [csvText, setCsvText] = useState("");
  const [importPreview, setImportPreview] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedCourse, selectedTopic, selectedDifficulty]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      if (res.ok && data.courses) {
        setCourses(data.courses);
        if (data.courses.length > 0 && !selectedCourse) {
          setSelectedCourse(data.courses[0].id);
          setImportCourseId(data.courses[0].id);
        }
      }
    } catch (e) {}
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCourse) params.append("courseId", selectedCourse);
      if (selectedTopic !== "ALL") params.append("topic", selectedTopic);
      if (selectedDifficulty !== "ALL") params.append("difficulty", selectedDifficulty);

      const res = await fetch(`/api/questions?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
        if (data.topics) setTopics(data.topics);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      courseId: selectedCourse || courses[0]?.id || "",
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: "",
      marks: 1.0,
      difficulty: "MEDIUM",
      topic: topics[0] || "Machine Learning Fundamentals",
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (q: any) => {
    setEditingQuestion(q);
    setFormData({
      courseId: q.courseId,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      marks: q.marks,
      difficulty: q.difficulty,
      topic: q.topic,
    });
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.optionA.trim() || !formData.optionB.trim()) {
      setFormError("Question and all options are required.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const url = editingQuestion ? `/api/questions/${editingQuestion.id}` : "/api/questions";
      const method = editingQuestion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to save question.");
      } else {
        setShowAddModal(false);
        fetchQuestions();
      }
    } catch (e) {
      setFormError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
      if (res.ok) fetchQuestions();
    } catch (e) {
      alert("Failed to delete question.");
    }
  };

  // CSV Import preview & commit
  const handlePreviewCsv = async () => {
    if (!csvText.trim()) {
      setImportError("Please enter or paste CSV content.");
      return;
    }

    setImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: importCourseId || selectedCourse,
          csvContent: csvText,
          commit: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "Failed to parse CSV.");
      } else {
        setImportPreview(data);
      }
    } catch (e) {
      setImportError("Network error parsing CSV.");
    } finally {
      setImporting(false);
    }
  };

  const handleCommitImport = async () => {
    setImporting(true);
    try {
      const res = await fetch("/api/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: importCourseId || selectedCourse,
          csvContent: csvText,
          commit: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.committed) {
        alert(`Successfully imported ${data.importedCount} questions!`);
        setShowImportModal(false);
        setImportPreview(null);
        setCsvText("");
        fetchQuestions();
      } else {
        setImportError(data.error || "Import failed.");
      }
    } catch (e) {
      setImportError("Network error committing import.");
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sample = `Question,Option A,Option B,Option C,Option D,Correct Answer,Marks,Topic,Difficulty,Explanation
"What algorithm is commonly used for clustering?","Linear Regression","Logistic Regression","K-Means","Random Forest","C",1,"Unsupervised Learning","EASY","K-Means clusters unlabeled points around K centroids."
"Which metric measures the harmonic mean of Precision and Recall?","Accuracy","F1-Score","Specificity","MAE","B",1,"Model Evaluation","MEDIUM","F1-Score balances Precision and Recall."`;

    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tekzow_sample_mcq_import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredQuestions = questions.filter((q) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      q.question.toLowerCase().includes(s) ||
      q.topic.toLowerCase().includes(s) ||
      (q.explanation && q.explanation.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">MCQ Question Bank</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage question banks, topics, difficulty tags, ground truth answers, and bulk CSV uploads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={`/api/questions/export${selectedCourse ? `?courseId=${selectedCourse}` : ""}`}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-600" />
            Export CSV
          </a>

          <button
            onClick={() => {
              setShowImportModal(true);
              setImportPreview(null);
              setImportError(null);
            }}
            className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 mr-1.5 text-blue-600" />
            Import Questions
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Question
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Course select */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.courseName} ({c.courseCode})
                </option>
              ))}
            </select>
          </div>

          {/* Topic filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
            >
              <option value="ALL">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Difficulty
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
            >
              <option value="ALL">All Levels</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Search Questions
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Keywords..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
          <span>{filteredQuestions.length} Questions in Pool</span>
          <span>Single-choice MCQs</span>
        </div>

        {loading ? (
          <div className="bg-white p-12 text-center text-slate-400 text-sm rounded-2xl border border-slate-200">
            Loading question bank...
          </div>
        ) : filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{q.question}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span className="font-semibold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded">
                        {q.topic}
                      </span>
                      <span>&bull;</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          q.difficulty === "EASY"
                            ? "bg-emerald-50 text-emerald-700"
                            : q.difficulty === "MEDIUM"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span>&bull;</span>
                      <span>Marks: <strong>{q.marks}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
                {[
                  { key: "A", text: q.optionA },
                  { key: "B", text: q.optionB },
                  { key: "C", text: q.optionC },
                  { key: "D", text: q.optionD },
                ].map((opt) => {
                  const isCorrect = q.correctAnswer === opt.key;
                  return (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-lg border flex items-center space-x-2.5 ${
                        isCorrect
                          ? "bg-emerald-50/70 border-emerald-300 text-emerald-900 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="truncate">{opt.text}</span>
                      {isCorrect && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation (if provided) */}
              {q.explanation && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center text-slate-400 text-sm rounded-2xl border border-slate-200">
            No questions found in this course. Use "Add Question" or "Import Questions" to populate.
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingQuestion ? "Edit MCQ Question" : "Add New MCQ Question"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. Which type of Machine Learning uses labeled training data?"
                  className="w-full p-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              {/* Options A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["A", "B", "C", "D"].map((key) => (
                  <div key={key}>
                    <label className="block font-bold text-slate-600 mb-1">
                      Option {key} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={(formData as any)[`option${key}`]}
                      onChange={(e) =>
                        setFormData({ ...formData, [`option${key}`]: e.target.value })
                      }
                      placeholder={`Option ${key} text`}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                ))}
              </div>

              {/* Correct Answer & Marks */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Correct Answer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                    className="w-full p-2 text-xs bg-emerald-50 border border-emerald-300 font-bold text-emerald-800 rounded-lg"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Marks
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Topic / Category
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Machine Learning Fundamentals"
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Explanation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Shown to students during answer review if enabled..."
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                >
                  {saving ? "Saving..." : editingQuestion ? "Update Question" : "Add to Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Question Import Modal with Preview (Requirement 36) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bulk Import MCQ Questions (CSV)</h3>
                <p className="text-xs text-slate-500">
                  Upload CSV questions with automatic validation check before inserting.
                </p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">Paste CSV Content</label>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center text-[11px]"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download Sample CSV Template
                </button>
              </div>

              <textarea
                rows={7}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  setImportPreview(null);
                }}
                placeholder={`Question,Option A,Option B,Option C,Option D,Correct Answer,Marks,Topic,Difficulty,Explanation
"What is ML?","Option A","Option B","Option C","Option D","B",1,"Fundamentals","EASY","Explanation text"`}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900"
              />

              {/* Validation Result Preview Card (Requirement 36) */}
              {importPreview && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between font-bold text-sm">
                    <span>{importPreview.totalFound} Questions Found</span>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-emerald-600 font-bold">
                        {importPreview.validCount} Valid ✓
                      </span>
                      {importPreview.invalidCount > 0 && (
                        <span className="text-red-600 font-bold">
                          {importPreview.invalidCount} Invalid ✕
                        </span>
                      )}
                    </div>
                  </div>

                  {importPreview.errors && importPreview.errors.length > 0 && (
                    <div className="max-h-32 overflow-y-auto p-2 bg-red-50/80 rounded-lg border border-red-200 space-y-1">
                      <div className="font-bold text-red-800 text-[11px]">Errors Detected:</div>
                      {importPreview.errors.map((err: any, i: number) => (
                        <div key={i} className="text-[10px] text-red-700">
                          Row {err.row}: {err.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl"
                >
                  Cancel
                </button>

                {!importPreview ? (
                  <button
                    type="button"
                    disabled={importing || !csvText.trim()}
                    onClick={handlePreviewCsv}
                    className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                  >
                    {importing ? "Validating..." : "Validate CSV Records"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={importing || importPreview.validCount === 0}
                    onClick={handleCommitImport}
                    className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                  >
                    {importing
                      ? "Importing..."
                      : `Import ${importPreview.validCount} Valid Questions`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
