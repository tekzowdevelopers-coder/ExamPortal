import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: {
        course: true,
        _count: {
          select: { questions: true, attempts: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 });
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

    const updated = await prisma.exam.update({
      where: { id: params.id },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.duration !== undefined && { duration: Number(body.duration) }),
        ...(body.totalQuestions !== undefined && { totalQuestions: Number(body.totalQuestions) }),
        ...(body.marksPerQuestion !== undefined && { marksPerQuestion: Number(body.marksPerQuestion) }),
        ...(body.negativeMark !== undefined && { negativeMark: Number(body.negativeMark) }),
        ...(body.passingPercentage !== undefined && { passingPercentage: Number(body.passingPercentage) }),
        ...(body.status && { status: body.status }),
        ...(body.randomizeQuestions !== undefined && { randomizeQuestions: !!body.randomizeQuestions }),
        ...(body.randomizeOptions !== undefined && { randomizeOptions: !!body.randomizeOptions }),
        ...(body.showResultImmediately !== undefined && { showResultImmediately: !!body.showResultImmediately }),
        ...(body.showCorrectAnswers !== undefined && { showCorrectAnswers: !!body.showCorrectAnswers }),
        ...(body.allowReview !== undefined && { allowReview: !!body.allowReview }),
        ...(body.fullscreenRequired !== undefined && { fullscreenRequired: !!body.fullscreenRequired }),
        ...(body.tabSwitchWarning !== undefined && { tabSwitchWarning: !!body.tabSwitchWarning }),
        ...(body.maxTabSwitches !== undefined && { maxTabSwitches: Number(body.maxTabSwitches) }),
        ...(body.certificateGeneration !== undefined && { certificateGeneration: !!body.certificateGeneration }),
      },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error: any) {
    console.error("Error updating exam:", error);
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
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

    await prisma.exam.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Exam deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete exam" }, { status: 500 });
  }
}
