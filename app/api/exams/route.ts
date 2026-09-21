import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");

    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (status && status !== "ALL") where.status = status;

    const exams = await prisma.exam.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            courseName: true,
            courseCode: true,
            trainerName: true,
          },
        },
        _count: {
          select: {
            questions: true,
            attempts: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
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
      title,
      duration,
      totalQuestions,
      marksPerQuestion,
      negativeMark,
      passingPercentage,
      status,
      randomizeQuestions,
      randomizeOptions,
      showResultImmediately,
      showCorrectAnswers,
      allowReview,
      fullscreenRequired,
      tabSwitchWarning,
      maxTabSwitches,
      certificateGeneration,
    } = body;

    if (!courseId || !title) {
      return NextResponse.json(
        { error: "Course and Exam Title are required" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        courseId,
        title: title.trim(),
        duration: Number(duration) || 60,
        totalQuestions: Number(totalQuestions) || 30,
        marksPerQuestion: Number(marksPerQuestion) || 1.0,
        negativeMark: Number(negativeMark) || 0.0,
        passingPercentage: Number(passingPercentage) || 50.0,
        status: status || "PUBLISHED",
        randomizeQuestions: randomizeQuestions !== undefined ? !!randomizeQuestions : true,
        randomizeOptions: randomizeOptions !== undefined ? !!randomizeOptions : true,
        showResultImmediately: showResultImmediately !== undefined ? !!showResultImmediately : true,
        showCorrectAnswers: showCorrectAnswers !== undefined ? !!showCorrectAnswers : false,
        allowReview: allowReview !== undefined ? !!allowReview : true,
        fullscreenRequired: fullscreenRequired !== undefined ? !!fullscreenRequired : true,
        tabSwitchWarning: tabSwitchWarning !== undefined ? !!tabSwitchWarning : true,
        maxTabSwitches: Number(maxTabSwitches) || 5,
        certificateGeneration: certificateGeneration !== undefined ? !!certificateGeneration : true,
      },
    });

    return NextResponse.json({ success: true, exam }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating exam:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
