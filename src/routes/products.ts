import { FastifyInstance } from 'fastify';
import { createProduct, deleteProduct, readProducts, updateProduct, getProductById } from '../database/memoryDb';
import { ProductInput, ProductInputSchema } from '../types/product';
import z from 'zod';

const paramsSchema = z.object({
  id: z.string().uuid()
});

export async function productRoutes(fastify: FastifyInstance) {

  fastify.get('/api/products', async (_request, reply) => {
    const products = await readProducts();
    return reply.status(200).send(products);
  });

  fastify.get('/api/products/:id', async (request, reply) => {
    const parse = paramsSchema.safeParse(request.params); 

    if (!parse.success) {
      return reply.status(400).send({ message: 'Invalid UUID' });
    }

    const { id } = parse.data;

    const product = await getProductById(id); 

    if (!product) {
      return reply.status(404).send({ message: 'Product not found' }); 
    }

    return reply.status(200).send(product);
  });

  fastify.post('/api/products', async (request, reply) => {
    try {
      const body: ProductInput = ProductInputSchema.parse(request.body);
      const newProduct = await createProduct(body);
      return reply.status(201).send(newProduct);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ message: err.issues.map(i => i.message) });
      }
      throw err; 
    }
  });

  fastify.put('/api/products/:id', async (request, reply) => {
    const parseParams = paramsSchema.safeParse(request.params);

    if (!parseParams.success) {
      return reply.status(400).send({ message: 'Invalid UUID' });
    }

    const { id } = parseParams.data;

    try {
      const body: ProductInput = ProductInputSchema.parse(request.body);

      const updated = await updateProduct({ ...body, id });

      if (!updated) {
        return reply.status(404).send({ message: 'Product not found' });
      }

      return reply.status(200).send(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ message: err.issues.map(i => i.message) });
      }
      throw err;
    }
  });

  fastify.delete('/api/products/:id', async (request, reply) => {
    const parse = paramsSchema.safeParse(request.params);

    if (!parse.success) {
      return reply.status(400).send({ message: 'Invalid UUID' });
    }

    const { id } = parse.data;

    const deleted = await deleteProduct(id);

    if (!deleted) {
      return reply.status(404).send({ message: 'Product not found' }); 
    }

    return reply.status(204).send();
  });
}