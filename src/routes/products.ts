import { FastifyInstance } from 'fastify';
import { readProducts, writeProducts } from '../database/memoryDb';
import { Product, ProductInput, ProductInputSchema, ProductSchema } from '../types/product';
import { randomUUID } from 'crypto';
import z from 'zod';

export async function productRoutes(fastify: FastifyInstance) {
    fastify.get('/api/products', async (request, reply) => {
        const products = await readProducts();
        return reply.status(200).send(products);
    });
    
    fastify.get('/api/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            z.string().uuid().parse(id);
        } catch {
            return reply.status(400).send({ message: 'Invalid UUID' });
        }

        const products = await readProducts();
        const product = products.find((p) => p.id === id);
        if (!product) {
            return reply.status(404).send({ message: 'Product not found' })
        }
        return reply.status(200).send(product);;
    });

    fastify.post('/api/products', async (request, reply) => {
        try {
            const body: ProductInput = ProductInputSchema.parse(request.body);
            const products =  await readProducts();
            const newProduct: Product = { ...body, id: randomUUID() };
            products.push(newProduct);

             await writeProducts(products);
            return reply.status(201).send(newProduct);
        } catch (err: any) {
            return reply.status(400).send({ message: err.errors ? err.errors : err.message });
        }
    });

    fastify.put('/api/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            z.string().uuid().parse(id);
             const products =  await readProducts();
            const index = products.findIndex((p) => p.id === id);
            if (index === -1) {
                return reply.status(404).send({ message: 'Product not found' });

            }
            const body: ProductInput = ProductInputSchema.parse(request.body);
            const updateProduct: Product = { ...body, id };
            products[index] = updateProduct;
            await writeProducts(products);
            return reply.status(200).send(updateProduct);
        } catch (err: any) {
            return reply.status(400).send({ message: err.errors ? err.errors : err.message });
        }
    });

    fastify.delete('/api/products/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            z.string().uuid().parse(id);
             const products = await readProducts();
            const index = products.findIndex((p) => p.id === id);
            if (index === -1) {
                return reply.status(404).send({ message: 'Product not found' });
            }
            products.splice(index, 1);
            await writeProducts(products);
            return reply.status(204).send();
        } catch {
            return reply.status(400).send({ message: 'Invalid UUID' })
        }
    });
}