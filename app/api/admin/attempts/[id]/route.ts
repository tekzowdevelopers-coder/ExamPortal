import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        exam: {
          include: {
            course: true,
          },
        },
        certificate: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Parse answers JSON
    let studentAnswers: Record<string, string> = {};
    try {
      studentAnswers = JSON.parse(attempt.answers || "{}");
    } catch (e) {
      studentAnswers = {};
    }

    // Parse question order
    let questionIds: string[] = [];
    try {
      const parsed = JSON.parse(attempt.questionOrder || "[]");
      if (Array.isArray(parsed)) {
        questionIds = parsed.map((item: any) => (typeof item === "string" ? item : item.id));
      }
    } catch (e) {
      questionIds = [];
    }

    // If questionIds is empty, fetch all questions under exam or course
    let questions: any[] = [];
    if (questionIds.length > 0) {
      const fetched = await prisma.question.findMany({
        where: { id: { in: questionIds } },
      });
      // Preserve order
      const qMap = new Map(fetched.map((q) => [q.id, q]));
      questions = questionIds.map((id) => qMap.get(id)).filter(Boolean);
    } else {
      questions = await prisma.question.findMany({
        where: { courseId: attempt.exam.courseId },
        take: attempt.exam.totalQuestions,
      });
    }

    // Construct detailed review sheet
    const breakdown = questions.map((q, idx) => {
      const studentAns = studentAnswers[q.id] || null;
      const isCorrect = studentAns === q.correctAnswer;
      const isUnanswered = !studentAns;
      let status = "UNANSWERED";
      if (!isUnanswered) {
        status = isCorrect ? "CORRECT" : "WRONG";
      }

      return {
        number: idx + 1,
        id: q.id,
        question: q.question,
        options: {
          A: q.optionA,
          B: q.optionB,
          C: q.optionC,
          D: q.optionD,
        },
        studentAnswer: studentAns,
        correctAnswer: q.correctAnswer,
        isCorrect,
        status,
        marksEarned: isCorrect ? q.marks : 0,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty,
      };
    });

    // Parse events log
    let eventsLog: any[] = [];
    try {
      eventsLog = JSON.parse(attempt.eventsLog || "[]");
    } catch (e) {
      eventsLog = [];
    }

    return NextResponse.json({
      success: true,
      attempt,
      breakdown,
      eventsLog,
    });
  } catch (error: any) {
    console.error("Error fetching attempt details:", error);
    return NextResponse.json({ error: "Failed to fetch attempt details" }, { status: 500 });
  }
}
