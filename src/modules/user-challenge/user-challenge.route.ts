import express from "express";
import { UserChallengeController } from "./user-challenge.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = express.Router();

router.get(
  "/my-challenges",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  UserChallengeController.getMyChallenges,
);

export const UserChallengeRoutes = router;
