import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getAllPayments = catchAsync(async (req, res) => {
  const result = await AdminService.getAllPayments();

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Admin payment records retrieved successfully",
    data: result,
  });
});

const getBannedChallenges = catchAsync(async (req, res) => {
  const result = await AdminService.getBannedChallenges(req.user);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Banned challenges retrieved successfully",
    data: result,
  });
});

const banChallenge = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await AdminService.banChallenge(
    req.params.id as string,
    user,
    req.body,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Challenge banned successfully",
    data: result,
  });
});

const unbanChallenge = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await AdminService.unbanChallenge(
    req.params.id as string,
    user,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Challenge unbanned successfully",
    data: result,
  });
});

export const AdminController = {
  getAllPayments,
  banChallenge,
  unbanChallenge,
  getBannedChallenges,
};
