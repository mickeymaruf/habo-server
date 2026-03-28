import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { LeaderboardService } from "./leaderboard.service";

const getTopChallenges = catchAsync(async (req, res) => {
  const result = await LeaderboardService.getTopChallenges();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Challenge leaderboard fetched successfully",
    data: result,
  });
});

const getTopUsers = catchAsync(async (req, res) => {
  const result = await LeaderboardService.getTopUsers();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User leaderboard fetched successfully",
    data: result,
  });
});

export const LeaderboardController = {
  getTopChallenges,
  getTopUsers,
};
