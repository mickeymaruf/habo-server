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

  // handle existing participation ("re-join" logic)
  const existing = await prisma.participation.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId,
      },
    },
  });

  if (existing) {
    // If they are already active, throw error
    if (existing.status === "ACTIVE") {
      throw new AppError("Already joined this challenge", status.BAD_REQUEST);
    }

    // If they previously left, reactivate the record
    return prisma.participation.update({
      where: {
        userId_challengeId: { userId, challengeId },
      },
      data: {
        status: "ACTIVE",
      },
    });
  }

  return prisma.participation.create({
    data: {
      userId,
      challengeId,
      status: "ACTIVE",
    },
  });
};

const getMyParticipations = async (userId: string) => {
  return prisma.participation.findMany({
    where: {
      userId,
      status: "ACTIVE", // CRITICAL: Only show challenges I am currently in
    },
    include: {
      challenge: {
        include: {
          participations: {
            where: { status: "ACTIVE" }, // Only show other ACTIVE members in the list
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
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
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
      challenge: {
        include: {
          _count: {
            select: {
              // Only count ACTIVE participants for the "Total Members" stat
              participations: { where: { status: "ACTIVE" } },
            },
          },
        },
      },
      progressLogs: true,
    },
  });

  if (!participation || participation.status === "LEFT") {
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

  return prisma.participation.update({
    where: {
      id: participation.id,
    },
    data: {
      status: "LEFT",
    },
  });
};

export const ParticipationService = {
  joinChallenge,
  getMyParticipations,
  getSingleParticipation,
  leaveChallenge,
};
