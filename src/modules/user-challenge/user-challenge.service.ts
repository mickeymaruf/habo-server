import { prisma } from "../../lib/prisma";

const getUserChallengesData = async (userId: string) => {
  // 1. Challenges the user CREATED
  const createdChallenges = await prisma.challenge.findMany({
    where: { creatorId: userId },
    include: {
      _count: {
        select: {
          participations: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. History: Challenges where user is NOT active OR has finished
  const participationHistory = await prisma.participation.findMany({
    where: {
      userId,
      OR: [
        { status: "LEFT" }, // User quit
        { completed: true }, // User finished the goal
      ],
      // Ensure we don't show currently active, non-completed ones
      NOT: {
        AND: [{ status: "ACTIVE" }, { completed: false }],
      },
    },
    include: {
      challenge: {
        select: {
          id: true,
          title: true,
          category: true,
          isPremium: true,
          durationDays: true,
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return {
    created: createdChallenges,
    history: participationHistory,
  };
};

export const UserChallengeService = {
  getUserChallengesData,
};
