import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      registrationNumber,
      college,
      department,
      courseCode,
      email,
      phone,
      batch,
      yearSemester,
    } = await req.json();

    if (!name || !registrationNumber || !college || !department || !courseCode) {
      return NextResponse.json(
        {
          error: "Full Name, Registration Number, College, Department, and Course Code are required.",
        },
        { status: 400 }
      );
    }

    const cleanRegNo = registrationNumber.trim().toUpperCase();
    const cleanCourseCode = courseCode.trim().toUpperCase();

    // Verify course
    const course = await prisma.course.findUnique({
      where: { courseCode: cleanCourseCode },
      include: {
        exams: {
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!course || course.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Course is invalid or not currently published." },
        { status: 404 }
      );
    }

    const exam = course.exams[0];
    if (!exam) {
      return NextResponse.json(
        { error: "No published examination found for this course." },
        { status: 404 }
      );
    }

    // Upsert student record
    let student = await prisma.student.findFirst({
      where: {
        registrationNumber: cleanRegNo,
      },
    });

    if (!student) {
      student = await prisma.student.create({
        data: {
          name: name.trim(),
          registrationNumber: cleanRegNo,
          college: college.trim(),
          department: department.trim(),
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          batch: batch?.trim() || null,
          yearSemester: yearSemester?.trim() || null,
        },
      });
    } else {
      // Update details
      student = await prisma.student.update({
        where: { id: student.id },
        data: {
          name: name.trim(),
          college: college.trim(),
          department: department.trim(),
          ...(email && { email: email.trim() }),
          ...(phone && { phone: phone.trim() }),
          ...(batch && { batch: batch.trim() }),
        },
      });
    }

    // Check existing attempts for this exam
    const existingAttempt = await prisma.examAttempt.findFirst({
      where: {
        studentId: student.id,
        examId: exam.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (existingAttempt) {
      if (existingAttempt.status === "SUBMITTED") {
        return NextResponse.json(
          {
            error: "You have already completed this examination. A second attempt is not available.",
            alreadySubmitted: true,
            attemptId: existingAttempt.id,
          },
          { status: 403 }
        );
      }

      // Check if existing attempt is expired
      const isExpired = new Date(existingAttempt.expiresAt).getTime() < Date.now();
      if (isExpired && existingAttempt.status === "IN_PROGRESS") {
        await prisma.examAttempt.update({
          where: { id: existingAttempt.id },
          data: { status: "EXPIRED" },
        });
        return NextResponse.json(
          {
            error: "Your previous exam session has expired.",
            alreadySubmitted: true,
            attemptId: existingAttempt.id,
          },
          { status: 403 }
        );
      }

      // If active and valid, allow resuming
      if (existingAttempt.status === "IN_PROGRESS") {
        return NextResponse.json({
          success: true,
          resumed: true,
          student,
          course,
          exam,
          attemptId: existingAttempt.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      student,
      course,
      exam,
      canStart: true,
    });
  } catch (error: any) {
    console.error("Error during student registration:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
