import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const where: any = {};
    if (courseId) where.courseId = courseId;

    const questions = await prisma.question.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: { course: true },
    });

    const escapeCsv = (str: string | null | undefined) => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""');
      return `"${clean}"`;
    };

    const headers = [
      "Question",
      "Option A",
      "Option B",
      "Option C",
      "Option D",
      "Correct Answer",
      "Marks",
      "Topic",
      "Difficulty",
      "Explanation",
      "Course Code",
    ];

    const rows = questions.map((q) => [
      escapeCsv(q.question),
      escapeCsv(q.optionA),
      escapeCsv(q.optionB),
      escapeCsv(q.optionC),
      escapeCsv(q.optionD),
      escapeCsv(q.correctAnswer),
      q.marks,
      escapeCsv(q.topic),
      escapeCsv(q.difficulty),
      escapeCsv(q.explanation),
      escapeCsv(q.course.courseCode),
    ]);

    const csvData = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvData, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="tekzow_question_bank.csv"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export questions" }, { status: 500 });
  }
}
