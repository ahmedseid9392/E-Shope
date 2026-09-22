import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().optional().default(""),
  price: z.coerce.number().nonnegative("Price must be 0 or more"),
  sale_price: z.coerce.number().nonnegative().optional().or(z.literal("")).optional(),
  stock: z.coerce.number().int().nonnegative("Stock must be 0 or more"),
  category_id: z.string().uuid().optional().or(z.literal("")).optional(),
  is_active: z.coerce.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
