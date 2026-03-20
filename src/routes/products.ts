import { FastifyInstance } from 'fastify';
import { products } from '../database/memoryDb';
import { Product, ProductInput, ProductInputSchema, ProductSchema } from '../types/product';
import { randomUUID } from 'crypto';

export async function productRoutes(fastify: FastifyInstance) {
    fastify.get('/api.products', async () => products);

    fastify.get('api/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            ProductSchema.pick({ id: true }).parse({ id });
        } catch {
            return reply.status(400).send({ message: 'Invalid UUID' });
        }
        const product = products.find((p) => p.id === id);
        if (!product) {
            return reply.status(404).send({ message: 'Product not found' })
        }
    });

    fastify.post('/api/products', async (request, reply) => {
        try {
            const body: ProductInput = ProductInputSchema.parse(request.body);
            const newProduct: Product = { ...body, id: randomUUID() };
            products.push(newProduct);
            return reply.status(201).send(newProduct);
        } catch (err: any) {
            return reply.status(400).send({ message: err.errors ? err.errors : err.message });
        }
    });

    fastify.put('/api/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            ProductSchema.pick({ id: true }).parse({ id });
            const index = products.findIndex((p) => p.id === id);
            if (index === -1) {
                return reply.status(404).send({ message: 'Product not found' });

            }
            const body: ProductInput = ProductInputSchema.parse(request.body);
            const updateProduct: Product = { ...body, id };
            products[index] = updateProduct;
            return updateProduct;
        } catch (err: any) {
            return reply.status(400).send({ message: err.errors ? err.errors : err.message });
        }
    });

    fastify.delete('/api/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            ProductSchema.pick({ id: true }).parse({ id });
            const index = products.findIndex((p) => p.id === id);
            if (index === -1) {
                return reply.status(404).send({ message: 'Product not found' });
            }
            products.splice(index, 1);
            return reply.status(204).send();
        } catch {
            return reply.status(400).send({ message: 'Invalid UUID' })
        }
    });
}