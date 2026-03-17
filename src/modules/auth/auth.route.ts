import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.get(
  "/me",
  checkAuth(UserRole.ADMIN, UserRole.USER),
  AuthController.getMe,
);

export const AuthRoutes = router;
