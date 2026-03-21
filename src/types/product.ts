import { z } from 'zod';

export const ProductSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().min(1),
    price: z.number().positive(),
    category: z.string().min(1),
    inStock: z.boolean(),
});

export type Product = z.infer<typeof ProductSchema>;
export const ProductInputSchema = ProductSchema.omit({ id: true });
export type ProductInput = z.infer<typeof ProductInputSchema>;