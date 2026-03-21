import fastify from "fastify";
import { productRoutes } from "../src/routes/products";
import supertest from 'supertest';
import { resetDb } from "../src/database/memoryDb";

let app: any;
let productId: string;

beforeAll(async () => {
  app = fastify();
  app.register(productRoutes);
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  resetDb();
});

describe('API products', () => {

  it('GET empty', async () => {
    const response = await supertest(app.server).get('/api/products');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('POST /api/products should create product', async () => {
    const response = await supertest(app.server)
      .post('/api/products')
      .send({
        name: 'Test Product',
        description: 'Test Description',
        price: 10,
        category: 'books',
        inStock: true,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    productId = response.body.id;
  });

  it('GET /api/products/:id should return the created product', async () => {
    const response = await supertest(app.server).get(`/api/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(productId);
  });

  it('PUT update product', async () => {
    const res = await supertest(app.server)
      .put(`/api/products/${productId}`)
      .send({
        name: 'Updated',
        description: 'Desc',
        price: 20,
        category: 'books',
        inStock: false
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('DELETE product', async () => {
    const res = await supertest(app.server).delete(`/api/products/${productId}`);
    expect(res.status).toBe(204);
  });

  it('GET deleted product 404', async () => {
    const res = await supertest(app.server).get(`/api/products/${productId}`);
    expect(res.status).toBe(404);
  });

  it('POST invalid body should return 400', async () => {
   const res = await supertest(app.server)
    .post('/api/products')
    .send({
      name: '',
      description: '',
      price: -10,
      category: '',
      inStock: true
    });
    expect(res.status).toBe(400);
  });

});