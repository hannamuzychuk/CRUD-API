import fastify from "fastify";
import { productRoutes } from "../src/routes/products";
import supertest from 'supertest';



let app: any;
let productId: string;

beforeAll(async () => {
    app = fastify();
    app.register(productRoutes);
    await app.ready();
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
});


function beforeAll(arg0: () => Promise<void>) {
    throw new Error("Function not implemented.");
}

