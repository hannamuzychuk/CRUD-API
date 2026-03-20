import cluster from 'node:cluster';
import os from 'node:os';
import http from 'node:http';

const numCPUs = os.availableParallelism();
const BASE_PORT = Number(process.env.PORT) || 4000;

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} running`);

    let current = 0;
    const workers: number[] = [];

    // create workers
    for (let i = 0; i < numCPUs - 1; i++) {
        const port = BASE_PORT + i + 1;
        const worker = cluster.fork({ PORT: port });
        workers.push(port);
    }

    // load balancer
    const server = http.createServer((req, res) => {
        const targetPort = workers[current];
        current = (current + 1) % workers.length;

        const proxy = http.request(
            {
                hostname: 'localhost',
                port: targetPort,
                path: req.url,
                method: req.method,
                headers: req.headers,
            },
            (proxyRes) => {
                res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                proxyRes.pipe(res, { end: true });
            }
        );

        req.pipe(proxy, { end: true });
    });

    server.listen(BASE_PORT, () => {
        console.log(`Load balancer running on port ${BASE_PORT}`);
    });

} else {
    import('./server');
}