import { z } from 'zod';

export const ProductSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    descryption: z.string(),
    price: z.number().positive(),
    category: z.string(),
    inStock: z.boolean(),
});

export type Product = z.infer<typeof ProductSchema>;
export const ProductInputSchema = ProductSchema.omit({ id: true });
export type ProductInput = z.infer<typeof ProductInputSchema>;