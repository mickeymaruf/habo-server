import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { ParticipationController } from "./participation.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { joinChallengeZodSchema } from "./participation.validation";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

// join challenge
router.post(
  "/",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  validateRequest(joinChallengeZodSchema),
  ParticipationController.joinChallenge,
);

// my participations
router.get(
  "/me",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ParticipationController.getMyParticipations,
);

// single participation
router.get(
  "/:id",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ParticipationController.getSingleParticipation,
);

// leave challenge
router.delete(
  "/:challengeId",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ParticipationController.leaveChallenge,
);

export const ParticipationRoutes = router;
