import { Router } from "express";
import { ChallengeRoutes } from "../modules/challenge/challenge.route";
import { ParticipationRoutes } from "../modules/participation/participation.route";
import { ProgressRoutes } from "../modules/progress/progress.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { StatsRoutes } from "../modules/stats/stats.route";
import { CommentRoutes } from "../modules/comment/comment.route";
import { VoteRoutes } from "../modules/vote/vote.route";
import { LeaderboardRoutes } from "../modules/leaderboard/leaderboard.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { UserChallengeRoutes } from "../modules/user-challenge/user-challenge.route";

const router = Router();

router.use("/challenges", ChallengeRoutes);
router.use("/participations", ParticipationRoutes);
router.use("/progress", ProgressRoutes);
router.use("/payments", PaymentRoutes);
router.use("/stats", StatsRoutes);
router.use("/comments", CommentRoutes);
router.use("/votes", VoteRoutes);
router.use("/leaderboard", LeaderboardRoutes);
router.use("/admin", AdminRoutes);
router.use("/users", UserChallengeRoutes);

export const IndexRoutes = router;
