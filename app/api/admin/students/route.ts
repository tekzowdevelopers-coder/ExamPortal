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
    const search = searchParams.get("search") || "";
    const college = searchParams.get("college") || "";
    const department = searchParams.get("department") || "";
    const exportCsv = searchParams.get("export") === "true";

    const where: any = {};
    if (college && college !== "ALL") where.college = college;
    if (department && department !== "ALL") where.department = department;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { registrationNumber: { contains: search } },
        { email: { contains: search } },
        { college: { contains: search } },
        { department: { contains: search } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        attempts: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            exam: {
              include: { course: true },
            },
            certificate: true,
          },
        },
        _count: {
          select: { attempts: true, certificates: true },
        },
      },
    });

    if (exportCsv) {
      const escapeCsv = (str: string | null | undefined) => {
        if (!str) return '""';
        return `"${str.replace(/"/g, '""')}"`;
      };

      const headers = [
        "Name",
        "Registration Number",
        "College",
        "Department",
        "Email",
        "Phone",
        "Latest Course",
        "Score",
        "Percentage",
        "Result",
        "Certificate ID",
        "Registered At",
      ];

      const rows = students.map((s) => {
        const latestAttempt = s.attempts[0];
        return [
          escapeCsv(s.name),
          escapeCsv(s.registrationNumber),
          escapeCsv(s.college),
          escapeCsv(s.department),
          escapeCsv(s.email),
          escapeCsv(s.phone),
          escapeCsv(latestAttempt?.exam?.course?.courseName || "None"),
          latestAttempt ? latestAttempt.score : "N/A",
          latestAttempt ? `${latestAttempt.percentage.toFixed(1)}%` : "N/A",
          escapeCsv(latestAttempt ? latestAttempt.result : "NOT_ATTEMPTED"),
          escapeCsv(latestAttempt?.certificate?.certificateId || "None"),
          escapeCsv(s.createdAt.toISOString().split("T")[0]),
        ];
      });

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="tekzow_students.csv"',
        },
      });
    }

    // Get unique colleges and departments for filtering
    const allColleges = await prisma.student.findMany({
      select: { college: true },
      distinct: ["college"],
    });
    const allDepartments = await prisma.student.findMany({
      select: { department: true },
      distinct: ["department"],
    });

    return NextResponse.json({
      success: true,
      students,
      colleges: allColleges.map((c) => c.college).filter(Boolean),
      departments: allDepartments.map((d) => d.department).filter(Boolean),
    });
  } catch (error: any) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
