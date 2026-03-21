import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { ChallengeController } from "./challenge.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ChallengeController.createChallenge,
);
router.get("/", ChallengeController.getChallenges);
router.get("/:id", ChallengeController.getSingleChallenge);
router.patch(
  "/:id",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ChallengeController.updateChallenge,
);
router.delete(
  "/:id",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ChallengeController.deleteChallenge,
);
router.patch(
  "/:id/status",
  checkAuth(UserRole.ADMIN),
  ChallengeController.updateChallengeStatus,
);

export const ChallengeRoutes = router;
