import dotenv from "dotenv";
import fastify from "fastify";
import { productRoutes } from "./routes/products";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const app = fastify({ logger: true });

app.register(productRoutes);

app.setNotFoundHandler((_request, reply) => {
  reply.status(404).send({ message: 'Resource not found' });
});

app.setErrorHandler((error: unknown, _request, reply) => {

  const err = error as any;
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (statusCode < 500) {

    return reply.status(statusCode).send({ message });
  }

  app.log.error(error);
  return reply.status(500).send({ 
    message: 'Internal Server Error' 
  });
});

app.listen({ port: PORT, host: '0.0.0.0' })
  .then(() => {
    app.log.info(`Server running on port ${PORT}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });