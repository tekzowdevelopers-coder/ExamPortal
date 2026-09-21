import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { attemptId, questionId, selectedOption } = await req.json();

    if (!attemptId || !questionId) {
      return NextResponse.json(
        { error: "Attempt ID and Question ID are required" },
        { status: 400 }
      );
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "This exam has already been finalized." },
        { status: 403 }
      );
    }

    // Check expiry window with 30s network grace period
    const now = Date.now();
    const expires = new Date(attempt.expiresAt).getTime();
    if (now > expires + 30000) {
      return NextResponse.json(
        { error: "Exam time has concluded." },
        { status: 403 }
      );
    }

    // Parse existing answers
    let answers: Record<string, string> = {};
    try {
      answers = JSON.parse(attempt.answers || "{}");
    } catch (e) {
      answers = {};
    }

    if (selectedOption === null || selectedOption === "") {
      delete answers[questionId];
    } else {
      answers[questionId] = selectedOption;
    }

    const updated = await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        answers: JSON.stringify(answers),
      },
      select: {
        id: true,
        answers: true,
      },
    });

    return NextResponse.json({
      success: true,
      savedAt: new Date().toISOString(),
      answeredCount: Object.keys(answers).length,
    });
  } catch (error: any) {
    console.error("Error auto-saving answer:", error);
    return NextResponse.json({ error: "Failed to save answer" }, { status: 500 });
  }
}
