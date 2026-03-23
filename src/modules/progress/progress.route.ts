import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { ProgressController } from "./progress.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

// mark daily progress
router.post(
  "/",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ProgressController.createProgress,
);

// get progress for a participation
router.get(
  "/:participationId",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ProgressController.getProgress,
);

export const ProgressRoutes = router;
