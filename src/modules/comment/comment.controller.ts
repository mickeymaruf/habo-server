import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CommentService } from "./comment.service";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const createComment = catchAsync(async (req, res) => {
  const result = await CommentService.createComment(req.user.id, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const getCommentsByChallenge = catchAsync(async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const result = await CommentService.getCommentsByChallenge(
    req.params.challengeId as string,
    session?.user?.id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Comments fetched successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  await CommentService.deleteComment(req.user, req.params.commentId as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Comment deleted successfully",
    data: null,
  });
});

const likeComment = catchAsync(async (req, res) => {
  const result = await CommentService.likeComment(
    req.user.id,
    req.params.commentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment liked successfully",
    data: result,
  });
});

const unlikeComment = catchAsync(async (req, res) => {
  await CommentService.unlikeComment(
    req.user.id,
    req.params.commentId as string,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Comment unliked successfully",
    data: null,
  });
});

export const CommentController = {
  createComment,
  getCommentsByChallenge,
  deleteComment,
  likeComment,
  unlikeComment,
};
