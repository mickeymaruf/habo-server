import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ParticipationService } from "./participation.service";

const joinChallenge = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await ParticipationService.joinChallenge(
    user.id,
    req.body.challengeId,
  );

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Joined challenge successfully",
    data: result,
  });
});

const getMyParticipations = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await ParticipationService.getMyParticipations(user.id);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Participations fetched successfully",
    data: result,
  });
});

const getSingleParticipation = catchAsync(async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const result = await ParticipationService.getSingleParticipation(
    user.id,
    id as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Participation fetched successfully",
    data: result,
  });
});

const leaveChallenge = catchAsync(async (req, res) => {
  const user = req.user;
  const { challengeId } = req.params;

  const result = await ParticipationService.leaveChallenge(
    user.id,
    challengeId as string,
  );

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Left challenge successfully",
    data: result,
  });
});

export const ParticipationController = {
  joinChallenge,
  getMyParticipations,
  getSingleParticipation,
  leaveChallenge,
};
