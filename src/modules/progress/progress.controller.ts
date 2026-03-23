import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProgressService } from "./progress.service";

const createProgress = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await ProgressService.createProgress(user.id, req.body);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Progress added successfully",
    data: result,
  });
});

const getProgress = catchAsync(async (req, res) => {
  const user = req.user;
  const { participationId } = req.params;

  const result = await ProgressService.getProgress(
    user.id,
    participationId as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Progress fetched successfully",
    data: result,
  });
});

export const ProgressController = {
  createProgress,
  getProgress,
};
