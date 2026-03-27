import express from "express";
import { StatsController } from "./stats.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = express.Router();

router.get(
  "/",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  StatsController.getDashboardStatsData,
);

export const StatsRoutes = router;
