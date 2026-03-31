import { prisma } from "../../lib/prisma";

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

export const AdminService = {
  getAllPayments,
};
