import { Router } from "express";
import { LeaderboardController } from "./leaderboard.controller";

const router = Router();

// Route for Top Challenges (Calculated by Engagement)
router.get("/top-challenges", LeaderboardController.getTopChallenges);

// Route for Top Users (Calculated by Consistency & Completion)
router.get("/users", LeaderboardController.getTopUsers);

export const LeaderboardRoutes = router;
