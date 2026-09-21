import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
      include: { course: true },
    });

    if (!exam || exam.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "This examination is not currently available." },
        { status: 404 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    // Check for existing attempt
    let attempt = await prisma.examAttempt.findFirst({
      where: {
        studentId,
        examId: exam.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (attempt) {
      if (attempt.status === "SUBMITTED") {
        return NextResponse.json(
          {
            error: "You have already submitted this exam. Duplicate attempts are disabled.",
            alreadySubmitted: true,
            attemptId: attempt.id,
          },
          { status: 403 }
        );
      }

      // Check expiry
      const now = Date.now();
      const expires = new Date(attempt.expiresAt).getTime();
      if (expires <= now) {
        await prisma.examAttempt.update({
          where: { id: attempt.id },
          data: { status: "EXPIRED" },
        });
        return NextResponse.json(
          {
            error: "Exam time has expired for this attempt.",
            attemptId: attempt.id,
          },
          { status: 403 }
        );
      }

      // Resume existing attempt
      const questionOrder: any[] = JSON.parse(attempt.questionOrder || "[]");
      const questionIds = questionOrder.map((q) => (typeof q === "string" ? q : q.id));

      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
      });
      const qMap = new Map(questions.map((q) => [q.id, q]));

      // Format questions for client (STRICTLY NO correctAnswer or explanation)
      const sanitizedQuestions = questionOrder.map((item, idx) => {
        const qId = typeof item === "string" ? item : item.id;
        const q = qMap.get(qId);
        if (!q) return null;

        return {
          number: idx + 1,
          id: q.id,
          question: q.question,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          marks: q.marks,
          topic: q.topic,
          difficulty: q.difficulty,
        };
      }).filter(Boolean);

      let existingAnswers = {};
      try {
        existingAnswers = JSON.parse(attempt.answers || "{}");
      } catch (e) {}

      return NextResponse.json({
        success: true,
        resumed: true,
        attemptId: attempt.id,
        expiresAt: attempt.expiresAt,
        durationSeconds: Math.floor((expires - now) / 1000),
        exam: {
          id: exam.id,
          title: exam.title,
          duration: exam.duration,
          totalQuestions: sanitizedQuestions.length,
          marksPerQuestion: exam.marksPerQuestion,
          fullscreenRequired: exam.fullscreenRequired,
          tabSwitchWarning: exam.tabSwitchWarning,
          maxTabSwitches: exam.maxTabSwitches,
          course: {
            courseName: exam.course.courseName,
            courseCode: exam.course.courseCode,
            trainerName: exam.course.trainerName,
          },
        },
        student: {
          id: student.id,
          name: student.name,
          registrationNumber: student.registrationNumber,
          college: student.college,
          department: student.department,
        },
        questions: sanitizedQuestions,
        savedAnswers: existingAnswers,
      });
    }

    // --- CREATE NEW EXAM ATTEMPT ---
    // Fetch all available questions in bank for this course or exam
    let pool = await prisma.question.findMany({
      where: {
        OR: [{ examId: exam.id }, { courseId: exam.courseId }],
      },
    });

    if (pool.length === 0) {
      return NextResponse.json(
        { error: "No questions are currently available for this examination." },
        { status: 400 }
      );
    }

    // Question randomization
    if (exam.randomizeQuestions) {
      pool = shuffleArray(pool);
    }

    // Select required number of questions
    const selected = pool.slice(0, Math.min(exam.totalQuestions, pool.length));

    // Prepare questionOrder metadata for persistence
    const questionOrder = selected.map((q) => ({ id: q.id }));

    const durationMinutes = exam.duration;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const initialEvent = {
      event: "EXAM_STARTED",
      timestamp: new Date().toISOString(),
      details: `Exam started by ${student.name} (${student.registrationNumber})`,
    };

    attempt = await prisma.examAttempt.create({
      data: {
        studentId,
        examId: exam.id,
        startedAt: new Date(),
        expiresAt,
        answers: "{}",
        questionOrder: JSON.stringify(questionOrder),
        status: "IN_PROGRESS",
        eventsLog: JSON.stringify([initialEvent]),
      },
    });

    // Format questions for client (STRICT: NO correctAnswer or explanation)
    const sanitizedQuestions = selected.map((q, idx) => ({
      number: idx + 1,
      id: q.id,
      question: q.question,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      marks: q.marks,
      topic: q.topic,
      difficulty: q.difficulty,
    }));

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      expiresAt,
      durationSeconds: durationMinutes * 60,
      exam: {
        id: exam.id,
        title: exam.title,
        duration: exam.duration,
        totalQuestions: sanitizedQuestions.length,
        marksPerQuestion: exam.marksPerQuestion,
        fullscreenRequired: exam.fullscreenRequired,
        tabSwitchWarning: exam.tabSwitchWarning,
        maxTabSwitches: exam.maxTabSwitches,
        course: {
          courseName: exam.course.courseName,
          courseCode: exam.course.courseCode,
          trainerName: exam.course.trainerName,
        },
      },
      student: {
        id: student.id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        college: student.college,
        department: student.department,
      },
      questions: sanitizedQuestions,
      savedAnswers: {},
    });
  } catch (error: any) {
    console.error("Error starting exam attempt:", error);
    return NextResponse.json(
      { error: "Failed to initialize exam session." },
      { status: 500 }
    );
  }
}
