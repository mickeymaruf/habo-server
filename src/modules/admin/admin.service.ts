import status from "http-status";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errorHelpers/AppError";

const getAllPayments = async () => {
  const payments = await prisma.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      challenge: {
        select: {
          id: true,
          title: true,
          price: true,
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate high-level stats for the Admin Dashboard stickers
  const stats = {
    totalRevenue: payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((acc, p) => acc + p.amount, 0),
    successfulCount: payments.filter((p) => p.status === "SUCCESS").length,
    failedCount: payments.filter((p) => p.status === "FAILED").length,
    pendingCount: payments.filter((p) => p.status === "PENDING").length,
  };

  return { payments, stats };
};

const getBannedChallenges = async (user: IRequestUser) => {
  if (user.role !== "ADMIN") {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  return await prisma.challenge.findMany({
    where: {
      isBanned: true,
    },
    include: {
      creator: {
        select: {
          name: true,
          email: true,
        },
      },
      bannedBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      bannedAt: "desc",
    },
  });
};

const banChallenge = async (
  id: string,
  user: IRequestUser,
  payload: { reason?: string },
) => {
  if (user.role !== "ADMIN") {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) {
    throw new AppError("Challenge not found", status.NOT_FOUND);
  }

  if (challenge.isBanned) {
    throw new AppError("Challenge already banned", status.BAD_REQUEST);
  }

  return prisma.challenge.update({
    where: { id },
    data: {
      isBanned: true,
      banReason: payload?.reason,
      bannedAt: new Date(),
      bannedById: user.id,
    },
  });
};

const unbanChallenge = async (id: string, user: IRequestUser) => {
  if (user.role !== "ADMIN") {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id },
  });

  if (!challenge) {
    throw new AppError("Challenge not found", status.NOT_FOUND);
  }

  if (!challenge.isBanned) {
    throw new AppError("Challenge is not banned", status.BAD_REQUEST);
  }

  return prisma.challenge.update({
    where: { id },
    data: {
      isBanned: false,
      banReason: null,
      bannedAt: null,
      bannedById: null,
    },
  });
};

export const AdminService = {
  getAllPayments,
  getBannedChallenges,
  banChallenge,
  unbanChallenge,
};
