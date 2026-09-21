import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { attemptId, eventType, details } = await req.json();

    if (!attemptId || !eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });

    if (!attempt || attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ success: false });
    }

    let eventsLog: any[] = [];
    try {
      eventsLog = JSON.parse(attempt.eventsLog || "[]");
    } catch (e) {
      eventsLog = [];
    }

    const newEvent = {
      event: eventType,
      timestamp: new Date().toISOString(),
      details: details || "",
    };

    eventsLog.push(newEvent);

    const isTabSwitch = eventType === "TAB_SWITCH" || eventType === "WINDOW_BLUR";
    const isFullscreenExit = eventType === "FULLSCREEN_EXIT";

    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        eventsLog: JSON.stringify(eventsLog),
        ...(isTabSwitch && { tabSwitchCount: { increment: 1 } }),
        ...(isFullscreenExit && { fullscreenExitCount: { increment: 1 } }),
      },
    });

    return NextResponse.json({
      success: true,
      tabSwitchCount: attempt.tabSwitchCount + (isTabSwitch ? 1 : 0),
      fullscreenExitCount: attempt.fullscreenExitCount + (isFullscreenExit ? 1 : 0),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log event" }, { status: 500 });
  }
}
