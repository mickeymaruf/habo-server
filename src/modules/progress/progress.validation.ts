import z from "zod";

export const createProgressZodSchema = z.object({
  participationId: z.uuid("Invalid participation ID"),
  day: z.number().positive(),
  note: z.string().optional(),
});

export type CreateProgressPayload = z.infer<typeof createProgressZodSchema>;
