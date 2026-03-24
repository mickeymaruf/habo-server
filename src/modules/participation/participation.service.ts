import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errorHelpers/AppError";

const joinChallenge = async (userId: string, challengeId: string) => {
  // check challenge exists
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge) {
    throw new AppError("Challenge not found", status.NOT_FOUND);
  }

  // prevent duplicate join
  const existing = await prisma.participation.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
  });

  if (existing) {
    throw new AppError("Already joined this challenge", status.BAD_REQUEST);
  }

  return prisma.participation.create({
    data: {
      userId,
      challengeId,
    },
  });
};

const getMyParticipations = async (userId: string) => {
  return prisma.participation.findMany({
    where: { userId },
    include: {
      challenge: {
        include: {
          participations: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      progressLogs: true,
    },
    orderBy: {
      joinedAt: "desc",
    },
  });
};

const getSingleParticipation = async (userId: string, challengeId: string) => {
  const participation = await prisma.participation.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
    include: {
      challenge: true,
      progressLogs: true,
    },
  });

  if (!participation) {
    throw new AppError("Participation not found", status.NOT_FOUND);
  }

  return participation;
};

const leaveChallenge = async (userId: string, challengeId: string) => {
  const participation = await prisma.participation.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
  });

  if (!participation) {
    throw new AppError("Participation not found", status.NOT_FOUND);
  }

  return prisma.participation.delete({
    where: {
      id: participation.id,
    },
  });
};

export const ParticipationService = {
  joinChallenge,
  getMyParticipations,
  getSingleParticipation,
  leaveChallenge,
};
