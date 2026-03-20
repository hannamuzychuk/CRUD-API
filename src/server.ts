import dotenv from "dotenv";
import fastify from "fastify";
import { productRoutes } from "./routes/products";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const app = fastify({ logger: true });
app.register(productRoutes);

app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ message: 'Resource not found' });
});

app.setErrorHandler((error, request, reply) => {
    reply.status(500).send({ message: 'Internal Server Error' });
});

app.listen({ port: PORT, host: '0.0.0.0' })
    .then(() => console.log(`Server running on port ${PORT}`))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
