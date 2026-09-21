import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, examId, csvContent, commit } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "Target Course is required" }, { status: 400 });
    }
    if (!csvContent || typeof csvContent !== "string") {
      return NextResponse.json({ error: "CSV content is required" }, { status: 400 });
    }

    // Parse CSV rows cleanly handling quotes
    const lines = csvContent
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV must contain a header row and at least one data row" },
        { status: 400 }
      );
    }

    // Header parser
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

    // Find indices
    const findIdx = (keywords: string[]) =>
      header.findIndex((h) => keywords.some((k) => h.includes(k)));

    const qIdx = findIdx(["question"]);
    const aIdx = findIdx(["optiona", "opta", "a"]);
    const bIdx = findIdx(["optionb", "optb", "b"]);
    const cIdx = findIdx(["optionc", "optc", "c"]);
    const dIdx = findIdx(["optiond", "optd", "d"]);
    const ansIdx = findIdx(["correctanswer", "correct", "answer"]);
    const markIdx = findIdx(["mark", "score"]);
    const topicIdx = findIdx(["topic", "category"]);
    const diffIdx = findIdx(["difficulty", "level"]);
    const expIdx = findIdx(["explanation", "reason"]);

    if (qIdx === -1 || aIdx === -1 || bIdx === -1 || cIdx === -1 || dIdx === -1 || ansIdx === -1) {
      return NextResponse.json(
        {
          error:
            "CSV Header must contain: Question, Option A, Option B, Option C, Option D, and Correct Answer.",
        },
        { status: 400 }
      );
    }

    const validQuestions: any[] = [];
    const errors: { row: number; reason: string; raw: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const rowCols = parseCsvLine(lines[i]);
      const rowNum = i + 1;

      const questionText = rowCols[qIdx]?.replace(/^"|"$/g, "").trim();
      const optA = rowCols[aIdx]?.replace(/^"|"$/g, "").trim();
      const optB = rowCols[bIdx]?.replace(/^"|"$/g, "").trim();
      const optC = rowCols[cIdx]?.replace(/^"|"$/g, "").trim();
      const optD = rowCols[dIdx]?.replace(/^"|"$/g, "").trim();
      let correct = rowCols[ansIdx]?.replace(/^"|"$/g, "").trim().toUpperCase();

      // Normalize correct answer e.g. "Option A" -> "A"
      if (correct.startsWith("OPTION")) {
        correct = correct.replace("OPTION", "").trim();
      }

      if (!questionText) {
        errors.push({ row: rowNum, reason: "Question text is missing", raw: lines[i] });
        continue;
      }
      if (!optA || !optB || !optC || !optD) {
        errors.push({ row: rowNum, reason: "One or more options (A, B, C, D) are empty", raw: lines[i] });
        continue;
      }
      if (!["A", "B", "C", "D"].includes(correct)) {
        errors.push({
          row: rowNum,
          reason: `Invalid correct answer "${correct}". Must be A, B, C, or D.`,
          raw: lines[i],
        });
        continue;
      }

      const marks = markIdx !== -1 && !isNaN(Number(rowCols[markIdx])) ? Number(rowCols[markIdx]) : 1.0;
      const topic = topicIdx !== -1 && rowCols[topicIdx] ? rowCols[topicIdx].trim() : "General";
      let difficulty = diffIdx !== -1 && rowCols[diffIdx] ? rowCols[diffIdx].trim().toUpperCase() : "MEDIUM";
      if (!["EASY", "MEDIUM", "HARD"].includes(difficulty)) difficulty = "MEDIUM";
      const explanation = expIdx !== -1 && rowCols[expIdx] ? rowCols[expIdx].trim() : null;

      validQuestions.push({
        courseId,
        examId: examId || null,
        question: questionText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: correct,
        explanation,
        marks,
        difficulty,
        topic,
      });
    }

    if (!commit) {
      // Just preview
      return NextResponse.json({
        success: true,
        preview: true,
        totalFound: lines.length - 1,
        validCount: validQuestions.length,
        invalidCount: errors.length,
        errors,
        sampleValid: validQuestions.slice(0, 3),
      });
    }

    // Commit mode: insert all valid questions
    if (validQuestions.length > 0) {
      await prisma.question.createMany({
        data: validQuestions,
      });
    }

    return NextResponse.json({
      success: true,
      committed: true,
      importedCount: validQuestions.length,
      skippedCount: errors.length,
      errors,
    });
  } catch (error: any) {
    console.error("Error importing questions:", error);
    return NextResponse.json({ error: "Failed to process question import" }, { status: 500 });
  }
}
