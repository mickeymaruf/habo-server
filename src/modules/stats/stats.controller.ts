import { Request, Response } from "express";
import status from "http-status";
import { StatsService } from "./stats.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const getDashboardStatsData = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await StatsService.getDashboardStatsData(user);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Stats data retrieved successfully!",
      data: result,
    });
  },
);

export const StatsController = {
  getDashboardStatsData,
};
