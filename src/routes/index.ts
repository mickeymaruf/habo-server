import { Router } from "express";
import { ChallengeRoutes } from "../modules/challenge/challenge.route";
import { ParticipationRoutes } from "../modules/participation/participation.route";

const router = Router();

router.use("/challenges", ChallengeRoutes);
router.use("/participation", ParticipationRoutes);

export const IndexRoutes = router;
