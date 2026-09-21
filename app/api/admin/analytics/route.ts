import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalCourses,
      totalStudents,
      totalExams,
      totalAttempts,
      submittedAttempts,
      totalCertificates,
      courses,
      recentExams,
    ] = await Promise.all([
      prisma.course.count(),
      prisma.student.count(),
      prisma.exam.count(),
      prisma.examAttempt.count(),
      prisma.examAttempt.findMany({
        where: { status: "SUBMITTED" },
        select: {
          score: true,
          percentage: true,
          result: true,
          examId: true,
          createdAt: true,
        },
      }),
      prisma.certificate.count(),
      prisma.course.findMany({
        select: {
          id: true,
          courseName: true,
          courseCode: true,
          _count: {
            select: { exams: true, questions: true, certificates: true },
          },
        },
      }),
      prisma.exam.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          course: true,
          _count: {
            select: { attempts: true },
          },
        },
      }),
    ]);

    const passedCount = submittedAttempts.filter((a) => a.result === "PASSED").length;
    const failedCount = submittedAttempts.filter((a) => a.result === "FAILED").length;
    const passRate =
      submittedAttempts.length > 0
        ? ((passedCount / submittedAttempts.length) * 100).toFixed(1)
        : "0.0";

    const scores = submittedAttempts.map((a) => a.percentage);
    const avgScore =
      scores.length > 0
        ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(1)
        : "0.0";
    const highestScore = scores.length > 0 ? Math.max(...scores).toFixed(1) : "0.0";
    const lowestScore = scores.length > 0 ? Math.min(...scores).toFixed(1) : "0.0";

    // Score distribution buckets
    const distribution = [
      { range: "0-20%", count: 0 },
      { range: "21-40%", count: 0 },
      { range: "41-60%", count: 0 },
      { range: "61-80%", count: 0 },
      { range: "81-100%", count: 0 },
    ];

    scores.forEach((s) => {
      if (s <= 20) distribution[0].count++;
      else if (s <= 40) distribution[1].count++;
      else if (s <= 60) distribution[2].count++;
      else if (s <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalCourses,
        totalStudents,
        totalExams,
        totalAttempts,
        submittedCount: submittedAttempts.length,
        passedCount,
        failedCount,
        passRate,
        avgScore,
        highestScore,
        lowestScore,
        totalCertificates,
      },
      distribution,
      courses,
      recentExams,
    });
  } catch (error: any) {
    console.error("Error generating analytics:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
