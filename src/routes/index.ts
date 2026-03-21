import { Router } from "express";
import { ChallengeRoutes } from "../modules/challenge/challenge.route";

const router = Router();

router.use("/challenges", ChallengeRoutes);

export const IndexRoutes = router;
