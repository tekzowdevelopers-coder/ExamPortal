import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { courseCode } = await req.json();

    if (!courseCode || typeof courseCode !== "string") {
      return NextResponse.json(
        { error: "Please enter a valid course code." },
        { status: 400 }
      );
    }

    const cleanCode = courseCode.trim().toUpperCase();

    const course = await prisma.course.findUnique({
      where: { courseCode: cleanCode },
      include: {
        exams: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        {
          error: "Invalid Course Code. Please check the code and try again.",
        },
        { status: 404 }
      );
    }

    if (course.status === "CLOSED") {
      return NextResponse.json(
        {
          error: "This course is closed. Please contact your trainer or administrator.",
        },
        { status: 403 }
      );
    }

    if (course.status === "DRAFT") {
      return NextResponse.json(
        {
          error: "This course examination is not yet published.",
        },
        { status: 403 }
      );
    }

    const activeExam = course.exams[0];
    if (!activeExam) {
      return NextResponse.json(
        {
          error: "No published examination found for this course. Please contact your trainer.",
        },
        { status: 404 }
      );
    }

    // Check available question count in bank
    const availableQuestions = await prisma.question.count({
      where: { courseId: course.id },
    });

    return NextResponse.json({
      success: true,
      course: {
        id: course.id,
        courseName: course.courseName,
        courseCode: course.courseCode,
        description: course.description,
        duration: course.duration,
        trainerName: course.trainerName,
        trainerDesignation: course.trainerDesignation,
      },
      exam: {
        id: activeExam.id,
        title: activeExam.title,
        duration: activeExam.duration,
        totalQuestions: Math.min(activeExam.totalQuestions, Math.max(availableQuestions, 1)),
        passingPercentage: activeExam.passingPercentage,
        marksPerQuestion: activeExam.marksPerQuestion,
        fullscreenRequired: activeExam.fullscreenRequired,
      },
    });
  } catch (error: any) {
    console.error("Error validating course code:", error);
    return NextResponse.json(
      { error: "Failed to validate course code" },
      { status: 500 }
    );
  }
}
