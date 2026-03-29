import status from "http-status";
import {
  ChallengeStatus,
  PaymentStatus,
  UserRole,
  UserStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { AppError } from "../../utils/errorHelpers/AppError";

const getDashboardStatsData = async (user: IRequestUser) => {
  let statsData;

  switch (user.role) {
    case UserRole.ADMIN:
      statsData = await getAdminStatsData();
      break;

    case UserRole.USER:
      statsData = await getUserStatsData(user);
      break;

    default:
      throw new AppError("Invalid user role", status.BAD_REQUEST);
  }

  return statsData;
};

const getAdminStatsData = async () => {
  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    totalChallenges,
    premiumChallenges,
    totalParticipations,
    activeParticipations,
    completedParticipations,
    totalComments,
    totalVotes,
    totalPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    prisma.user.count({ where: { status: UserStatus.BLOCKED } }),
    prisma.challenge.count(),
    prisma.challenge.count({ where: { isPremium: true } }),
    prisma.participation.count(),
    prisma.participation.count({ where: { status: "ACTIVE" } }),
    prisma.participation.count({ where: { completed: true } }),
    prisma.comment.count(),
    prisma.vote.count(),
    prisma.payment.count(),
  ]);

  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      status: PaymentStatus.SUCCESS,
    },
  });

  const [
    userStatusChart,
    challengeStatusChart,
    challengeCategoryChart,
    revenueChart,
    participationChart,
    topChallenges,
    paymentStatusChart,
  ] = await Promise.all([
    getUserStatusChartData(),
    getChallengeStatusChartData(),
    getChallengeCategoryChartData(),
    getRevenueChartData(),
    getParticipationChartData(),
    getTopChallengesChartData(),
    getPaymentStatusChartData(),
  ]);

  return {
    overview: {
      totalUsers,
      activeUsers,
      blockedUsers,
      totalChallenges,
      premiumChallenges,
      totalParticipations,
      completedParticipations,
      totalComments,
      totalVotes,
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
    },

    charts: {
      userStatusChart,
      challengeStatusChart,
      challengeCategoryChart,
      revenueChart,
      participationChart,
      topChallenges,
      paymentStatusChart,
    },
  };
};

const getUserStatsData = async (user: IRequestUser) => {
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const [
    createdChallenges,
    joinedChallenges,
    completedChallenges,
    totalComments,
    totalVotes,
    totalSpent,
  ] = await Promise.all([
    prisma.challenge.count({
      where: {
        creatorId: dbUser.id,
      },
    }),

    prisma.participation.count({
      where: {
        userId: dbUser.id,
        status: "ACTIVE", // ONLY count challenges they haven't left
      },
    }),

    prisma.participation.count({
      where: {
        userId: dbUser.id,
        completed: true,
      },
    }),

    prisma.comment.count({
      where: {
        userId: dbUser.id,
      },
    }),

    prisma.vote.count({
      where: {
        userId: dbUser.id,
      },
    }),

    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId: dbUser.id,
        status: PaymentStatus.SUCCESS,
      },
    }),
  ]);

  // Update the Progress Chart to include the "LEFT" status or exclude it
  const participationProgress = await prisma.participation.groupBy({
    by: ["completed", "status"], // Add status here
    _count: {
      id: true,
    },
    where: {
      userId: dbUser.id,
    },
  });

  return {
    createdChallenges,
    joinedChallenges,
    completedChallenges,
    totalComments,
    totalVotes,
    totalSpent: totalSpent._sum.amount || 0,
    participationProgress: participationProgress
      .filter((item) => item.status === "ACTIVE") // Usually, charts only show active goals
      .map((item) => ({
        status: item.completed ? "COMPLETED" : "IN_PROGRESS",
        count: item._count.id,
      })),
  };
};

const getUserStatusChartData = async () => {
  const data = await prisma.user.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  return data.map(({ status, _count }) => ({
    status,
    count: _count.id,
  }));
};

const getChallengeStatusChartData = async () => {
  const data = await prisma.challenge.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  return data.map(({ status, _count }) => ({
    status,
    count: _count.id,
  }));
};

const getChallengeCategoryChartData = async () => {
  const data = await prisma.challenge.groupBy({
    by: ["category"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        category: "desc",
      },
    },
  });

  return data.map(({ category, _count }) => ({
    category,
    count: _count.id,
  }));
};

const getPaymentStatusChartData = async () => {
  const data = await prisma.payment.groupBy({
    by: ["status"],
    _count: {
      id: true,
    },
  });

  return data.map(({ status, _count }) => ({
    status,
    count: _count.id,
  }));
};

const getParticipationChartData = async () => {
  const data = await prisma.$queryRaw<
    {
      month: Date;
      count: bigint;
    }[]
  >`
    SELECT DATE_TRUNC('month', "joinedAt") AS month,
    COUNT(*)::bigint AS count
    FROM "Participation"
    WHERE "status" = 'ACTIVE' -- Add this line
    GROUP BY month
    ORDER BY month ASC;
  `;

  return data.map((item) => ({
    month: item.month,
    count: Number(item.count),
  }));
};

const getRevenueChartData = async () => {
  const data = await prisma.$queryRaw<
    {
      month: Date;
      revenue: number;
    }[]
  >`
    SELECT DATE_TRUNC('month', "createdAt") AS month,
    COALESCE(SUM("amount"), 0) AS revenue
    FROM "Payment"
    WHERE "status" = 'SUCCESS'
    GROUP BY month
    ORDER BY month ASC;
  `;

  return data;
};

const getTopChallengesChartData = async () => {
  const challenges = await prisma.challenge.findMany({
    take: 5,
    orderBy: {
      participations: {
        _count: "desc",
      },
    },
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          // Count only active people for the "Top" ranking
          participations: { where: { status: "ACTIVE" } },
          comments: true,
          votes: true,
        },
      },
    },
  });

  return challenges.map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    participations: challenge._count.participations,
    comments: challenge._count.comments,
    votes: challenge._count.votes,
  }));
};

export const StatsService = {
  getDashboardStatsData,
};
