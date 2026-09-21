import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { generateCourseCode } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET /api/courses - List courses
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { courseName: { contains: search } },
        { courseCode: { contains: search } },
        { trainerName: { contains: search } },
      ];
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            exams: true,
            questions: true,
            certificates: true,
          },
        },
        exams: {
          select: {
            id: true,
            title: true,
            duration: true,
            totalQuestions: true,
            status: true,
            _count: {
              select: {
                attempts: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

// POST /api/courses - Create course (Admin protected)
export async function POST(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      courseName,
      courseCode,
      autoGenerateCode,
      description,
      duration,
      trainerName,
      trainerDesignation,
      status,
    } = body;

    if (!courseName) {
      return NextResponse.json({ error: "Course Name is required" }, { status: 400 });
    }

    let finalCode = (courseCode || "").trim().toUpperCase();
    if (autoGenerateCode || !finalCode) {
      const prefix = courseName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "CRS";
      finalCode = generateCourseCode(prefix);
    }

    // Check unique courseCode
    const existing = await prisma.course.findUnique({
      where: { courseCode: finalCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Course code "${finalCode}" is already taken. Please choose another or auto-generate.` },
        { status: 409 }
      );
    }

    const course = await prisma.course.create({
      data: {
        courseName: courseName.trim(),
        courseCode: finalCode,
        description: description?.trim() || null,
        duration: duration?.trim() || "15 Hours",
        trainerName: trainerName?.trim() || "Sankar K",
        trainerDesignation: trainerDesignation?.trim() || "AI Trainer",
        status: status || "PUBLISHED",
      },
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
