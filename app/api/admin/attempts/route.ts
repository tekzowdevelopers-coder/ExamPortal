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

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId");
    const courseId = searchParams.get("courseId");
    const result = searchParams.get("result");
    const search = searchParams.get("search");

    const where: any = {};
    if (examId) where.examId = examId;
    if (courseId) where.exam = { courseId };
    if (result && result !== "ALL") where.result = result;
    if (search) {
      where.student = {
        OR: [
          { name: { contains: search } },
          { registrationNumber: { contains: search } },
          { college: { contains: search } },
        ],
      };
    }

    const attempts = await prisma.examAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        student: true,
        exam: {
          include: {
            course: true,
          },
        },
        certificate: true,
      },
    });

    return NextResponse.json({ success: true, attempts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}
