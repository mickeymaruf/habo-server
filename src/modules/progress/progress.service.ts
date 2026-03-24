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

  const progressPercent = Math.floor((totalCompleted / totalDays) * 100);

  const updatedParticipation = await prisma.participation.update({
    where: { id: participationId },
    data: {
      progress: progressPercent,
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

  if (!participation) {
    throw new AppError("Participation not found", status.NOT_FOUND);
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
