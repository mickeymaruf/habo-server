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
  const { search, category } = query;

  return prisma.challenge.findMany({
    where: {
      // status: "APPROVED",
      title: {
        contains: search,
        mode: "insensitive",
      },
      category: category || undefined,
    },
    include: {
      creator: true,
      participations: {
        include: {
          user: true,
        },
      },
      _count: {
        select: {
          votes: true,
          comments: true,
          participations: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getSingleChallenge = async (id: string, userId: string | null) => {
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      creator: {
        select: { id: true, name: true, image: true, status: true },
      },
      comments: {
        include: {
          user: {
            select: { name: true, image: true, status: true },
          },
        },
        omit: { challengeId: true },
      },
      participations: {
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
          participations: true,
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

  return {
    ...challenge,
    votedByMe: challenge.votes?.length > 0,
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
