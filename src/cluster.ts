import fs from 'node:fs';
import path from 'node:path';
import cluster from 'node:cluster';
import os from 'node:os';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { Product } from './types/product';

type Message = {
  type: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'RESET';
  payload?: any;
  requestId: string;
};

type ResponseMessage = {
  requestId: string;
  response?: any;
  error?: string;
};
const numCPUs = os.cpus().length;
const BASE_PORT = Number(process.env.PORT) || 4000;
const DB_PATH = path.resolve(process.cwd(), 'db.json');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} running`);

  const loadProducts = (): Product[] => {
    try {
      if (fs.existsSync(DB_PATH)) {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading db.json:', err);
    }
    return [];
  };

  const saveProducts = (data: Product[]) => {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Error reading db.json:', err);
    }
  };

  const products: Product[] = loadProducts();
  const workers: number[] = [];
  let current = 0;

  for (let i = 0; i < numCPUs - 1; i++) {
    const port = BASE_PORT + i + 1;
    const worker = cluster.fork({ PORT: port });

    workers.push(port);

    worker.on('message', (msg: Message) => {
      const { type, payload, requestId } = msg;
      let response: any;

      try {
        if (type === 'READ') {
          response = [...products];
        } 
        else if (type === 'CREATE') {
          const newProduct: Product = { ...payload, id: randomUUID() };
          products.push(newProduct);
          saveProducts(products);
          response = newProduct;
        } 
        else if (type === 'UPDATE') {
          const index = products.findIndex(p => p.id === payload.id);
          if (index !== -1) {
            products[index] = { ...products[index], ...payload };
            saveProducts(products);
            response = products[index];
          } else {
            response = null;
          }
        } 
        else if (type === 'DELETE') {
          const index = products.findIndex(p => p.id === payload.id);
          if (index !== -1) {
            products.splice(index, 1);
            saveProducts(products);
            response = true;
          } else {
            response = false;
          }
        } 
        else if (type === 'RESET') {
          products.length = 0;
          saveProducts(products);
          response = true;
        }

        worker.send({ requestId, response } as ResponseMessage);

      } catch (err: any) {
        worker.send({
          requestId,
          error: err.message || 'Unknown error'
        } as ResponseMessage);
      }
    });
  }

  const server = http.createServer((req, res) => {
    if (workers.length === 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'No workers available' }));
    }

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

    proxy.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Bad Gateway', error: err.message }));
    });

    req.pipe(proxy, { end: true });
  });

  server.listen(BASE_PORT, () => {
    console.log(`Load balancer running on port ${BASE_PORT}`);
  });

} else {
  import('./server');
}