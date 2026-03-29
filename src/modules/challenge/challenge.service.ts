import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errorHelpers/AppError";
import { ChallengeStatus } from "../../../generated/prisma/enums";
import {
  CreateChallengePayload,
  UpdateChallengePayload,
} from "./challenge.validation";
import { IRequestUser } from "../../interfaces/requestUser.interface";

const createChallenge = async (
  userId: string,
  payload: CreateChallengePayload,
) => {
  return prisma.challenge.create({
    data: {
      ...payload,
      creatorId: userId,

      // create a participation for the creator of the challenge
      participations: {
        create: {
          userId,
        },
      },
    },
    include: {
      participations: true,
    },
  });
};

const getChallenges = async (query: any) => {
  const { search, category, featured } = query;

  // Convert string query "true"/"false" to actual boolean if present
  const isFeatured =
    featured === "true" ? true : featured === "false" ? false : undefined;

  return prisma.challenge.findMany({
    where: {
      // status: "APPROVED",
      title: {
        contains: search,
        mode: "insensitive",
      },
      category: category || undefined,
      featured: isFeatured,
    },
    include: {
      creator: true,
      participations: {
        where: { status: "ACTIVE" },
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
          participations: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getSingleChallenge = async (id: string, userId: string | null) => {
  // 1. Define the time range for "Today"
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, name: true, image: true, status: true },
      },
      participations: {
        where: {
          status: "ACTIVE", // Only fetch members who haven't left
        },
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      // 1. OPTIMIZATION: Just get the count, not the records
      _count: {
        select: {
          votes: true,
          comments: true,
          participations: {
            where: { status: "ACTIVE" },
          },
        },
      },
      // 2. LOGIC: Check if the specific user has voted
      votes: userId
        ? {
            where: {
              userId: userId,
            },
            take: 1,
          }
        : false,
    },
  });

  if (!challenge) {
    throw new AppError("Challenge not found", status.NOT_FOUND);
  }

  // 2. NECESSARY ADDITION: Count completions for today specifically
  const completedToday = await prisma.progress.count({
    where: {
      participation: {
        challengeId: id,
        status: "ACTIVE",
      },
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
      completed: true,
    },
  });

  return {
    ...challenge,
    votedByMe: challenge.votes?.length > 0,
    completedToday,
  };
};

const updateChallenge = async (
  id: string,
  user: IRequestUser,
  payload: UpdateChallengePayload,
) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) {
    throw new AppError("Challenge not found", status.NOT_FOUND);
  }

  if (challenge.creatorId !== user.id && user.role !== "ADMIN") {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  return prisma.challenge.update({
    where: { id },
    data: payload,
  });
};

const deleteChallenge = async (id: string, user: IRequestUser) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) {
    throw new AppError("Challenge not found", status.NOT_FOUND);
  }

  if (challenge.creatorId !== user.id && user.role !== "ADMIN") {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  return prisma.challenge.delete({
    where: { id },
  });
};

const updateChallengeStatus = async (id: string, status: ChallengeStatus) => {
  return prisma.challenge.update({
    where: { id },
    data: { status },
  });
};

export const ChallengeService = {
  createChallenge,
  getChallenges,
  getSingleChallenge,
  updateChallenge,
  deleteChallenge,
  updateChallengeStatus,
};
