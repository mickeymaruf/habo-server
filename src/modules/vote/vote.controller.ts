import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { VoteService } from "./vote.service";

const voteChallenge = catchAsync(async (req, res) => {
  const result = await VoteService.voteChallenge(req.user.id, req.body);

  console.log(result);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message:
      req.body.value === 1
        ? "Challenge upvoted successfully"
        : "Challenge downvoted successfully",
    data: result,
  });
});

const removeVote = catchAsync(async (req, res) => {
  await VoteService.removeVote(req.user.id, req.params.challengeId as string);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Vote removed successfully",
    data: null,
  });
});

const getChallengeVotes = catchAsync(async (req, res) => {
  const result = await VoteService.getChallengeVotes(
    req.params.challengeId as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Votes fetched successfully",
    data: result,
  });
});

export const VoteController = {
  voteChallenge,
  removeVote,
  getChallengeVotes,
};
