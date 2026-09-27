import { z } from "zod";

const productBaseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  description: z.string().optional().default(""),
  price: z.coerce.number().nonnegative("Price must be 0 or more"),
  sale_price: z.coerce.number().nonnegative().optional().or(z.literal("")).optional(),
  sale_starts_at: z.string().optional().or(z.literal("")).optional(),
  sale_ends_at: z.string().optional().or(z.literal("")).optional(),
  stock: z.coerce.number().int().nonnegative("Stock must be 0 or more"),
  category_id: z.string().uuid().optional().or(z.literal("")).optional(),
  image_url: z.string().url().optional().or(z.literal("")).optional(),
  is_active: z.coerce.boolean().default(true),
});

export const productSchema = productBaseSchema
  .refine(
    (data) => {
      if (data.sale_price === undefined || data.sale_price === "" || data.sale_price === 0) {
        return true;
      }
      return Number(data.sale_price) < Number(data.price);
    },
    { message: "Sale price must be less than the regular price.", path: ["sale_price"] }
  )
  .refine(
    (data) => {
      if (!data.sale_starts_at || !data.sale_ends_at) return true;
      return new Date(data.sale_starts_at) < new Date(data.sale_ends_at);
    },
    { message: "Sale end date must be after the start date.", path: ["sale_ends_at"] }
  );

export type ProductInput = z.infer<typeof productBaseSchema>;
