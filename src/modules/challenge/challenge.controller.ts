import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ChallengeService } from "./challenge.service";
import { auth } from "../../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

const createChallenge = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await ChallengeService.createChallenge(user.id, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Challenge created successfully",
    data: result,
  });
});

const getChallenges = catchAsync(async (req, res) => {
  const result = await ChallengeService.getChallenges(req.query);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Challenges fetched successfully",
    data: result,
  });
});

const getSingleChallenge = catchAsync(async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const result = await ChallengeService.getSingleChallenge(
    req.params.id as string,
    session?.user?.id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Challenge fetched successfully",
    data: result,
  });
});

const updateChallenge = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await ChallengeService.updateChallenge(
    req.params.id as string,
    user,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Challenge updated successfully",
    data: result,
  });
});

const deleteChallenge = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await ChallengeService.deleteChallenge(
    req.params.id as string,
    user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Challenge deleted successfully",
    data: result,
  });
});

const updateChallengeStatus = catchAsync(async (req, res) => {
  const result = await ChallengeService.updateChallengeStatus(
    req.params.id as string,
    req.body.status,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Challenge status updated",
    data: result,
  });
});

export const ChallengeController = {
  createChallenge,
  getChallenges,
  getSingleChallenge,
  updateChallenge,
  deleteChallenge,
  updateChallengeStatus,
};
