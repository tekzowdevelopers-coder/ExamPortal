import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateCertificateId } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { attemptId, finalAnswers, submissionReason } = await req.json();

    if (!attemptId) {
      return NextResponse.json({ error: "Attempt ID is required" }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: { course: true },
        },
        student: true,
        certificate: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // If already submitted, return existing result
    if (attempt.status === "SUBMITTED") {
      return NextResponse.json({
        success: true,
        alreadySubmitted: true,
        result: {
          score: attempt.score,
          percentage: attempt.percentage,
          result: attempt.result,
          correctCount: attempt.correctCount,
          wrongCount: attempt.wrongCount,
          unansweredCount: attempt.unansweredCount,
          certificateId: attempt.certificate?.certificateId || null,
        },
      });
    }

    // Merge any final answers with existing saved answers
    let studentAnswers: Record<string, string> = {};
    try {
      studentAnswers = JSON.parse(attempt.answers || "{}");
    } catch (e) {}

    if (finalAnswers && typeof finalAnswers === "object") {
      studentAnswers = { ...studentAnswers, ...finalAnswers };
    }

    // Parse question IDs from questionOrder
    let questionIds: string[] = [];
    try {
      const order = JSON.parse(attempt.questionOrder || "[]");
      questionIds = order.map((item: any) => (typeof item === "string" ? item : item.id));
    } catch (e) {
      questionIds = [];
    }

    // Fetch official questions with ground truth answers
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
    });

    const qMap = new Map(questions.map((q) => [q.id, q]));

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;
    let maxPossibleScore = 0;

    const negativeMark = attempt.exam.negativeMark || 0;

    questionIds.forEach((qId) => {
      const q = qMap.get(qId);
      if (!q) return;

      const marks = q.marks || 1.0;
      maxPossibleScore += marks;

      const studentAns = studentAnswers[q.id];
      if (!studentAns) {
        unansweredCount++;
      } else if (studentAns.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        correctCount++;
        totalScore += marks;
      } else {
        wrongCount++;
        totalScore -= negativeMark;
      }
    });

    // Score cannot be negative
    totalScore = Math.max(0, totalScore);

    const percentage =
      maxPossibleScore > 0
        ? parseFloat(((totalScore / maxPossibleScore) * 100).toFixed(2))
        : 0;

    const isPassed = percentage >= attempt.exam.passingPercentage;
    const resultStatus = isPassed ? "PASSED" : "FAILED";

    // Update events log
    let eventsLog: any[] = [];
    try {
      eventsLog = JSON.parse(attempt.eventsLog || "[]");
    } catch (e) {}

    eventsLog.push({
      event: "EXAM_SUBMITTED",
      timestamp: new Date().toISOString(),
      details: submissionReason || "Submitted by student",
    });

    // Update attempt
    const updatedAttempt = await prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        answers: JSON.stringify(studentAnswers),
        submittedAt: new Date(),
        status: "SUBMITTED",
        score: totalScore,
        percentage,
        correctCount,
        wrongCount,
        unansweredCount,
        result: resultStatus,
        eventsLog: JSON.stringify(eventsLog),
      },
    });

    // Generate Certificate if passed and enabled
    let certificate = null;
    if (isPassed && attempt.exam.certificateGeneration) {
      // Check if certificate already exists
      const existingCert = await prisma.certificate.findUnique({
        where: { examAttemptId: attempt.id },
      });

      if (!existingCert) {
        let certId = generateCertificateId(attempt.exam.course.courseCode);
        // Ensure uniqueness
        let exists = await prisma.certificate.findUnique({ where: { certificateId: certId } });
        while (exists) {
          certId = generateCertificateId(attempt.exam.course.courseCode);
          exists = await prisma.certificate.findUnique({ where: { certificateId: certId } });
        }

        certificate = await prisma.certificate.create({
          data: {
            certificateId: certId,
            studentId: attempt.studentId,
            courseId: attempt.exam.courseId,
            examAttemptId: attempt.id,
            issueDate: new Date(),
            verificationStatus: "VALID",
          },
        });
      } else {
        certificate = existingCert;
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        attemptId: updatedAttempt.id,
        score: totalScore,
        maxScore: maxPossibleScore,
        percentage,
        correctCount,
        wrongCount,
        unansweredCount,
        result: resultStatus,
        isPassed,
        certificateId: certificate ? certificate.certificateId : null,
      },
    });
  } catch (error: any) {
    console.error("Error evaluating exam submission:", error);
    return NextResponse.json({ error: "Failed to evaluate exam." }, { status: 500 });
  }
}
