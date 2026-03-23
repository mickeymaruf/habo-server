import { Router } from "express";
import { ChallengeRoutes } from "../modules/challenge/challenge.route";
import { ParticipationRoutes } from "../modules/participation/participation.route";

const router = Router();

router.use("/challenges", ChallengeRoutes);
router.use("/participations", ParticipationRoutes);
router.use("/progress", ParticipationRoutes);

export const IndexRoutes = router;
