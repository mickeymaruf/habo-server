import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-checkout",
  checkAuth(UserRole.USER, UserRole.ADMIN),
  PaymentController.createCheckoutSession,
);

export const PaymentRoutes = router;
