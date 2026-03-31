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

export const AdminController = {
  getAllPayments,
};
