import { Router } from "express";
import { ChallengeRoutes } from "../modules/challenge/challenge.route";
import { ParticipationRoutes } from "../modules/participation/participation.route";
import { ProgressRoutes } from "../modules/progress/progress.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { StatsRoutes } from "../modules/stats/stats.route";
import { CommentRoutes } from "../modules/comment/comment.route";

const router = Router();

router.use("/challenges", ChallengeRoutes);
router.use("/participations", ParticipationRoutes);
router.use("/progress", ProgressRoutes);
router.use("/payments", PaymentRoutes);
router.use("/stats", StatsRoutes);
router.use("/comments", CommentRoutes);

export const IndexRoutes = router;
