import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errorHelpers/AppError";
import { startOfDay } from "date-fns";

const createProgress = async (
  userId: string,
  payload: { participationId: string; note?: string },
) => {
  const { participationId, note } = payload;

  const today = startOfDay(new Date());

  // check participation exists
  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
    include: { challenge: true },
  });

  if (!participation) {
    throw new AppError("Participation not found", status.NOT_FOUND);
  }

  // prevent logging if they left the challenge
  if (participation.status === "LEFT") {
    throw new AppError(
      "You cannot log progress for a challenge you have left. Please rejoin first.",
      status.FORBIDDEN,
    );
  }

  // ownership check
  if (participation.userId !== userId) {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  // 🚫 prevent future/backfill (strict mode)
  // (optional: allow yesterday later if needed)

  // prevent duplicate (same day)
  const existing = await prisma.progress.findUnique({
    where: {
      participationId_date: {
        participationId,
        date: today,
      },
    },
  });

  if (existing) {
    throw new AppError("Already checked today", status.BAD_REQUEST);
  }

  // create progress
  const progress = await prisma.progress.create({
    data: {
      participationId,
      date: today,
      note,
    },
  });

  // update participation progress %
  const totalDays = participation.challenge.durationDays;

  const totalCompleted = await prisma.progress.count({
    where: { participationId },
  });

  // ensure progress never exceeds 100%
  const progressPercent = Math.min(
    Math.floor((totalCompleted / totalDays) * 100),
    100,
  );

  const updatedParticipation = await prisma.participation.update({
    where: { id: participationId },
    data: {
      progress: progressPercent,
      // Mark as completed only if they hit 100%
      completed: progressPercent === 100,
    },
  });

  return {
    progress,
    participation: updatedParticipation,
  };
};

const getProgress = async (userId: string, participationId: string) => {
  const participation = await prisma.participation.findUnique({
    where: { id: participationId },
  });

  // If they left, they shouldn't be able to fetch the active progress view
  if (!participation || participation.status === "LEFT") {
    throw new AppError("Active participation not found", status.NOT_FOUND);
  }

  if (participation.userId !== userId) {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  return prisma.progress.findMany({
    where: { participationId },
    orderBy: {
      date: "asc", // ✅ instead of day
    },
  });
};

export const ProgressService = {
  createProgress,
  getProgress,
};
