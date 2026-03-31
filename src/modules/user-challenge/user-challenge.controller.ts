import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserChallengeService } from "./user-challenge.service";

const getMyChallenges = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await UserChallengeService.getUserChallengesData(userId);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User challenges and history retrieved successfully",
    data: result,
  });
});

export const UserChallengeController = {
  getMyChallenges,
};
