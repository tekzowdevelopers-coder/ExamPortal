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
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { certificateId: { contains: search } },
        { student: { name: { contains: search } } },
        { student: { registrationNumber: { contains: search } } },
        { course: { courseName: { contains: search } } },
      ];
    }

    const certificates = await prisma.certificate.findMany({
      where,
      orderBy: { issueDate: "desc" },
      include: {
        student: true,
        course: true,
        attempt: {
          select: {
            score: true,
            percentage: true,
            submittedAt: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, certificates });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getAdminSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { certificateId, status } = await req.json();

    if (!certificateId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const cert = await prisma.certificate.update({
      where: { certificateId },
      data: { verificationStatus: status },
    });

    return NextResponse.json({ success: true, certificate: cert });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 });
  }
}
