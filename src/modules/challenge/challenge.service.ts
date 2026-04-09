import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errorHelpers/AppError";
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
      isBanned: false,
      isDeleted: false,
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

const getSuggestions = async (searchTerm: string, category?: string) => {
  return await prisma.challenge.findMany({
    where: {
      title: {
        contains: searchTerm,
        mode: "insensitive",
      },
      category: category || undefined,
      isBanned: false,
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      category: true, // Optional: helps user distinguish between similar titles
    },
    take: 8, // Keep the list short for the dropdown UI
  });
};

const getSingleChallenge = async (id: string, userId: string | null) => {
  // 1. Define the time range for "Today"
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const challenge = await prisma.challenge.findUnique({
    where: { id, isBanned: false, isDeleted: false },
    include: {
      creator: {
        select: { id: true, name: true, image: true, status: true },
      },
      participations: {
        where: {
          status: "ACTIVE",
        },
        take: 10,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
          participations: {
            where: { status: "ACTIVE" },
          },
        },
      },
      // check if the specific user has voted
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

  let myParticipation = null;
  if (userId) {
    myParticipation = await prisma.participation.findUnique({
      where: {
        userId_challengeId: { userId, challengeId: id },
      },
    });
  }

  // count completions for today specifically
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
    isJoined: myParticipation?.status === "ACTIVE",
    hasAccess: !!myParticipation, // check participation record
    participationStatus: myParticipation?.status || null,
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
    where: { id, isBanned: false, isDeleted: false },
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
    where: { id, isBanned: false },
  });

  if (!challenge || challenge.isDeleted) {
    throw new AppError("Challenge not found", status.NOT_FOUND);
  }

  if (challenge.creatorId !== user.id && user.role !== "ADMIN") {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  return prisma.challenge.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      participations: {
        updateMany: {
          where: { status: "ACTIVE" },
          data: { status: "LEFT" },
        },
      },
    },
  });
};

export const ChallengeService = {
  createChallenge,
  getChallenges,
  getSuggestions,
  getSingleChallenge,
  updateChallenge,
  deleteChallenge,
};
