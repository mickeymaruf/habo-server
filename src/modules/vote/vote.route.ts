import { Router } from "express";
import checkAuth from "../../middlewares/checkAuth";
import { UserRole } from "../../../generated/prisma/enums";
import { VoteController } from "./vote.controller";

const router = Router();

router.post("/", checkAuth(UserRole.USER), VoteController.voteChallenge);

router.delete(
  "/:challengeId",
  checkAuth(UserRole.USER),
  VoteController.removeVote,
);

router.get("/:challengeId", VoteController.getChallengeVotes);

export const VoteRoutes = router;
