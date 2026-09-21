import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (topic && topic !== "ALL") where.topic = topic;
    if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;
    if (search) {
      where.OR = [
        { question: { contains: search } },
        { topic: { contains: search } },
        { explanation: { contains: search } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        course: {
          select: {
            id: true,
            courseName: true,
            courseCode: true,
          },
        },
      },
    });

    // Also collect distinct topics for filter pills
    const topics = await prisma.question.findMany({
      where: courseId ? { courseId } : {},
      select: { topic: true },
      distinct: ["topic"],
    });

    return NextResponse.json({
      success: true,
      questions,
      topics: topics.map((t) => t.topic),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      courseId,
      examId,
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation,
      marks,
      difficulty,
      topic,
    } = body;

    if (!courseId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json(
        { error: "Course, question, all 4 options, and correct answer (A, B, C, D) are required" },
        { status: 400 }
      );
    }

    const created = await prisma.question.create({
      data: {
        courseId,
        examId: examId || null,
        question: question.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer: correctAnswer.trim().toUpperCase(),
        explanation: explanation?.trim() || null,
        marks: Number(marks) || 1.0,
        difficulty: difficulty || "MEDIUM",
        topic: topic?.trim() || "General",
      },
    });

    return NextResponse.json({ success: true, question: created }, { status: 201 });
  } catch (error: any) {
    console.error("Error adding question:", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
