import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, question });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
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

    const updated = await prisma.question.update({
      where: { id: params.id },
      data: {
        ...(body.question && { question: body.question.trim() }),
        ...(body.optionA && { optionA: body.optionA.trim() }),
        ...(body.optionB && { optionB: body.optionB.trim() }),
        ...(body.optionC && { optionC: body.optionC.trim() }),
        ...(body.optionD && { optionD: body.optionD.trim() }),
        ...(body.correctAnswer && { correctAnswer: body.correctAnswer.trim().toUpperCase() }),
        ...(body.explanation !== undefined && { explanation: body.explanation?.trim() || null }),
        ...(body.marks !== undefined && { marks: Number(body.marks) }),
        ...(body.difficulty && { difficulty: body.difficulty }),
        ...(body.topic && { topic: body.topic.trim() }),
      },
    });

    return NextResponse.json({ success: true, question: updated });
  } catch (error: any) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
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

    await prisma.question.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Question deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
