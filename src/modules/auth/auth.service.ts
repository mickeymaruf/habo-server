import status from "http-status";
import { AppError } from "../../utils/errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", status.NOT_FOUND);
  }

  return user;
};

export const AuthService = {
  getMe,
};
