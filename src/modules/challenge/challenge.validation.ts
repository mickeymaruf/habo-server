import z from "zod";

export const createChallengeZodSchema = z
  .object({
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    durationDays: z.number().positive("Duration must be a positive number"),
    category: z.string().min(2, "Category must be at least 2 characters"),
    isPremium: z.boolean().optional(),
    featured: z.boolean().optional(),
    price: z
      .number("Price must be a number")
      .positive("Price must be greater than 0")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.isPremium) return data.price !== undefined;
      if (!data.isPremium) return data.price === undefined;
      return true;
    },
    {
      message: "Price must exist only for premium challenges",
      path: ["price"],
    },
  );

export const updateChallengeZodSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").optional(),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    durationDays: z
      .number()
      .positive("Duration must be a positive number")
      .optional(),
    category: z
      .string()
      .min(2, "Category must be at least 2 characters")
      .optional(),
    isPremium: z.boolean().optional(),
    featured: z.boolean().optional(),
    price: z
      .number("Price must be a number")
      .positive("Price must be greater than 0")
      .optional(),
  })
  .refine(
    (data) => {
      // If isPremium is explicitly provided
      if (data.isPremium === true) return data.price !== undefined;
      if (data.isPremium === false) return data.price === undefined;

      // If isPremium is not being updated, allow partial updates
      return true;
    },
    {
      message: "Price must exist only for premium challenges",
      path: ["price"],
    },
  );

export type CreateChallengePayload = z.infer<typeof createChallengeZodSchema>;
export type UpdateChallengePayload = z.infer<typeof updateChallengeZodSchema>;
