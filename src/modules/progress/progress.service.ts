import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errorHelpers/AppError";
import { CreateProgressPayload } from "./progress.validation";

const createProgress = async (
  userId: string,
  payload: CreateProgressPayload,
) => {
  const { participationId, day, note } = payload;

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

  // prevent duplicate day entry
  const existing = await prisma.progress.findUnique({
    where: {
      participationId_day: {
        participationId,
        day,
      },
    },
  });

  if (existing) {
    throw new AppError(
      "Progress for this day already exists",
      status.BAD_REQUEST,
    );
  }

  // create progress
  const progress = await prisma.progress.create({
    data: {
      participationId,
      day,
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
      day: "asc",
    },
  });
};

export const ProgressService = {
  createProgress,
  getProgress,
};
