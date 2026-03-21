import z from "zod";

export const joinChallengeZodSchema = z.object({
  challengeId: z.uuid("Invalid challenge ID"),
});
