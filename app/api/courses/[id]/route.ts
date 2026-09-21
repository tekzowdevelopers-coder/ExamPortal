import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        exams: true,
        _count: {
          select: { questions: true, certificates: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      courseName,
      courseCode,
      description,
      duration,
      trainerName,
      trainerDesignation,
      status,
    } = body;

    // Check code collision if code changed
    if (courseCode) {
      const cleanCode = courseCode.trim().toUpperCase();
      const existing = await prisma.course.findFirst({
        where: {
          courseCode: cleanCode,
          NOT: { id: params.id },
        },
      });
      if (existing) {
        return NextResponse.json(
          { error: `Course code "${cleanCode}" is already in use by another course.` },
          { status: 409 }
        );
      }
    }

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(courseName && { courseName: courseName.trim() }),
        ...(courseCode && { courseCode: courseCode.trim().toUpperCase() }),
        ...(description !== undefined && { description }),
        ...(duration && { duration }),
        ...(trainerName && { trainerName }),
        ...(trainerDesignation && { trainerDesignation }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.course.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
