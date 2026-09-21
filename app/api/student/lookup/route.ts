import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { registrationNumber, courseCode } = await req.json();

    if (!registrationNumber) {
      return NextResponse.json(
        { error: "Registration number is required" },
        { status: 400 }
      );
    }

    const cleanRegNo = registrationNumber.trim().toUpperCase();

    const student = await prisma.student.findFirst({
      where: { registrationNumber: cleanRegNo },
      include: {
        attempts: {
          where: courseCode
            ? { exam: { course: { courseCode: courseCode.trim().toUpperCase() } } }
            : {},
          orderBy: { createdAt: "desc" },
          include: {
            exam: {
              include: { course: true },
            },
            certificate: true,
          },
        },
      },
    });

    if (!student || student.attempts.length === 0) {
      return NextResponse.json(
        { error: "No examination records found for this registration number." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: {
        name: student.name,
        registrationNumber: student.registrationNumber,
        college: student.college,
        department: student.department,
      },
      attempts: student.attempts.map((a) => ({
        id: a.id,
        courseName: a.exam.course.courseName,
        courseCode: a.exam.course.courseCode,
        examTitle: a.exam.title,
        status: a.status,
        score: a.score,
        percentage: a.percentage,
        result: a.result,
        submittedAt: a.submittedAt,
        certificateId: a.certificate?.certificateId || null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
