import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        exam: {
          include: { course: true },
        },
        certificate: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Parse question answers
    let studentAnswers: Record<string, string> = {};
    try {
      studentAnswers = JSON.parse(attempt.answers || "{}");
    } catch (e) {}

    // Parse question order
    let questionIds: string[] = [];
    try {
      const order = JSON.parse(attempt.questionOrder || "[]");
      questionIds = order.map((item: any) => (typeof item === "string" ? item : item.id));
    } catch (e) {}

    let breakdown = null;

    // Only expose answers if exam settings allow it!
    if (attempt.exam.showCorrectAnswers) {
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
      });
      const qMap = new Map(questions.map((q) => [q.id, q]));

      breakdown = questionIds.map((qId, idx) => {
        const q = qMap.get(qId);
        if (!q) return null;
        const studentAns = studentAnswers[q.id] || null;
        const isCorrect = studentAns === q.correctAnswer;
        const isUnanswered = !studentAns;

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
          status: isUnanswered ? "UNANSWERED" : isCorrect ? "CORRECT" : "WRONG",
          explanation: q.explanation,
          marks: q.marks,
          topic: q.topic,
        };
      }).filter(Boolean);
    }

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        score: attempt.score,
        percentage: attempt.percentage,
        correctCount: attempt.correctCount,
        wrongCount: attempt.wrongCount,
        unansweredCount: attempt.unansweredCount,
        result: attempt.result,
        tabSwitchCount: attempt.tabSwitchCount,
      },
      student: {
        name: attempt.student.name,
        registrationNumber: attempt.student.registrationNumber,
        college: attempt.student.college,
        department: attempt.student.department,
        email: attempt.student.email,
      },
      course: {
        id: attempt.exam.course.id,
        courseName: attempt.exam.course.courseName,
        courseCode: attempt.exam.course.courseCode,
        duration: attempt.exam.course.duration,
        trainerName: attempt.exam.course.trainerName,
        trainerDesignation: attempt.exam.course.trainerDesignation,
      },
      exam: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        totalQuestions: attempt.exam.totalQuestions,
        passingPercentage: attempt.exam.passingPercentage,
        showCorrectAnswers: attempt.exam.showCorrectAnswers,
        showResultImmediately: attempt.exam.showResultImmediately,
      },
      certificate: attempt.certificate
        ? {
            id: attempt.certificate.id,
            certificateId: attempt.certificate.certificateId,
            issueDate: attempt.certificate.issueDate,
            verificationStatus: attempt.certificate.verificationStatus,
          }
        : null,
      breakdown,
    });
  } catch (error: any) {
    console.error("Error fetching attempt result:", error);
    return NextResponse.json({ error: "Failed to retrieve result" }, { status: 500 });
  }
}
