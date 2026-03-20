import dotenv from "dotenv";
import fastify from "fastify";
import { productRoutes } from "./routes/products";
import { request } from "node:http";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const server = fastify({ logger: true });
server.register(productRoutes);

server.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ message: 'Resource not found' });
});

server.setErrorHandler((error, request, reply) => {
    reply.status(500).send({ message: 'Internal Server Error' });
});

server.listen({ port: PORT, host: '0.0.0.0' })
    .then(() => console.log(`Server running on port ${PORT}`))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
