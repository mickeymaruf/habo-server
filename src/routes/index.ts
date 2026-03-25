import { Router } from "express";
import { ChallengeRoutes } from "../modules/challenge/challenge.route";
import { ParticipationRoutes } from "../modules/participation/participation.route";
import { ProgressRoutes } from "../modules/progress/progress.route";
import { PaymentRoutes } from "../modules/payment/payment.route";

const router = Router();

router.use("/challenges", ChallengeRoutes);
router.use("/participations", ParticipationRoutes);
router.use("/progress", ProgressRoutes);
router.use("/payments", PaymentRoutes);

export const IndexRoutes = router;
