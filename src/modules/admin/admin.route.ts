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

export const AdminRoutes = router;
