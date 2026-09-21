import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const certId = decodeURIComponent(params.certificateId).trim().toUpperCase();

    const certificate = await prisma.certificate.findUnique({
      where: { certificateId: certId },
      include: {
        student: {
          select: {
            name: true,
            registrationNumber: true,
            college: true,
            department: true,
          },
        },
        course: {
          select: {
            courseName: true,
            courseCode: true,
            trainerName: true,
            trainerDesignation: true,
            duration: true,
          },
        },
        attempt: {
          select: {
            score: true,
            percentage: true,
            submittedAt: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        {
          verified: false,
          error: `No certificate found with ID "${certId}". Please check the ID or contact Tekzow administrator.`,
        },
        { status: 404 }
      );
    }

    const isValid = certificate.verificationStatus === "VALID";

    return NextResponse.json({
      verified: isValid,
      status: certificate.verificationStatus,
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.student.name,
        registrationNumber: certificate.student.registrationNumber,
        college: certificate.student.college,
        department: certificate.student.department,
        courseName: certificate.course.courseName,
        courseCode: certificate.course.courseCode,
        duration: certificate.course.duration,
        trainerName: certificate.course.trainerName,
        trainerDesignation: certificate.course.trainerDesignation,
        completionDate: formatDate(certificate.issueDate),
        issueDate: certificate.issueDate,
        score: certificate.attempt?.score,
        percentage: certificate.attempt?.percentage,
        issuedBy: "Tekzow — Online Examination & Certificate Authority",
      },
    });
  } catch (error: any) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json({ error: "Certificate verification failed" }, { status: 500 });
  }
}
