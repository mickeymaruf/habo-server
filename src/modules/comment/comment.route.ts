import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { CommentController } from "./comment.controller";
import { createCommentSchema } from "./comment.validation";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.USER),
  validateRequest(createCommentSchema),
  CommentController.createComment,
);

router.get("/:challengeId", CommentController.getCommentsByChallenge);

router.delete(
  "/:commentId",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  CommentController.deleteComment,
);

router.post(
  "/:commentId/like",
  checkAuth(UserRole.USER),
  CommentController.likeComment,
);

router.delete(
  "/:commentId/like",
  checkAuth(UserRole.USER),
  CommentController.unlikeComment,
);

export const CommentRoutes = router;
