import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { ChallengeController } from "./challenge.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createChallengeZodSchema,
  updateChallengeZodSchema,
} from "./challenge.validation";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  validateRequest(createChallengeZodSchema),
  ChallengeController.createChallenge,
);
router.get("/", ChallengeController.getChallenges);
router.get("/:id", ChallengeController.getSingleChallenge);
router.patch(
  "/:id",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  validateRequest(updateChallengeZodSchema),
  ChallengeController.updateChallenge,
);
router.delete(
  "/:id",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  ChallengeController.deleteChallenge,
);

export const ChallengeRoutes = router;
