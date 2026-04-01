import express from "express";
import { AdminController } from "./admin.controller";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = express.Router();

router.get(
  "/payments",
  checkAuth(UserRole.ADMIN),
  AdminController.getAllPayments,
);

router.get(
  "/challenges/banned",
  checkAuth(UserRole.ADMIN),
  AdminController.getBannedChallenges,
);

router.post(
  "/challenge/:id/ban",
  checkAuth(UserRole.ADMIN),
  AdminController.banChallenge,
);

router.post(
  "/challenge/:id/unban",
  checkAuth(UserRole.ADMIN),
  AdminController.unbanChallenge,
);

export const AdminRoutes = router;
