import z from "zod";

export const createCommentSchema = z.object({
  challengeId: z.uuid(),
  content: z.string().min(1).max(500),
  parentId: z.uuid().optional(),
});
