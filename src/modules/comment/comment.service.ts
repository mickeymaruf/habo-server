import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/errorHelpers/AppError";
import { UserRole } from "../../../generated/prisma/enums";

const createComment = async (
  userId: string,
  payload: {
    challengeId: string;
    content: string;
    parentId?: string;
  },
) => {
  if (payload.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: payload.parentId },
    });

    if (!parent) {
      throw new AppError("Parent comment not found", status.NOT_FOUND);
    }
  }

  return prisma.comment.create({
    data: {
      content: payload.content,
      challengeId: payload.challengeId,
      userId,
      parentId: payload.parentId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });
};

const getCommentsByChallenge = async (challengeId: string, userId?: string) => {
  const comments = await prisma.comment.findMany({
    where: {
      challengeId,
      parentId: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },

      // Only check likes if userId exists
      likes: userId ? { where: { userId }, select: { userId: true } } : false, // skip likes array for unauthenticated users

      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, name: true, image: true } },
          likes: userId
            ? { where: { userId }, select: { userId: true } }
            : false,
          _count: { select: { likes: true } },
        },
      },

      _count: { select: { likes: true, replies: true } },
    },
  });

  // Transform for frontend
  return comments.map((comment) => ({
    ...comment,
    likedByMe: userId ? comment.likes.length > 0 : false,
    likes: undefined,
    replies: comment.replies.map((reply) => ({
      ...reply,
      likedByMe: userId ? reply.likes.length > 0 : false,
      likes: undefined,
    })),
  }));
};

const deleteComment = async (
  user: { id: string; role: UserRole },
  commentId: string,
) => {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new AppError("Comment not found", status.NOT_FOUND);
  }

  const canDelete = comment.userId === user.id || user.role === UserRole.ADMIN;

  if (!canDelete) {
    throw new AppError("Unauthorized", status.FORBIDDEN);
  }

  return await prisma.comment.delete({
    where: { id: commentId },
  });
};

const likeComment = async (userId: string, commentId: string) => {
  return await prisma.commentLike.upsert({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
    create: { userId, commentId },
    update: {},
  });
};

const unlikeComment = async (userId: string, commentId: string) => {
  return prisma.commentLike.delete({
    where: {
      userId_commentId: {
        userId,
        commentId,
      },
    },
  });
};

export const CommentService = {
  createComment,
  getCommentsByChallenge,
  deleteComment,
  likeComment,
  unlikeComment,
};
