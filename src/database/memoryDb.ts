import { Product } from '../types/product';
import { randomUUID } from 'node:crypto';

let localProducts: Product[] = [];

function sendToPrimary(type: string, payload?: any): Promise<any> {
  if (!process.send) {
    if (type === 'READ') return Promise.resolve([...localProducts]);
    if (type === 'CREATE') {
      const newP = { ...payload, id: randomUUID() };
      localProducts.push(newP);
      return Promise.resolve(newP);
    }
    if (type === 'UPDATE') {
      const index = localProducts.findIndex(p => p.id === payload.id);
      if (index !== -1) {
        localProducts[index] = { ...localProducts[index], ...payload };
        return Promise.resolve(localProducts[index]);
      }
      return Promise.resolve(null);
    }
    if (type === 'DELETE') {
      const index = localProducts.findIndex(p => p.id === payload.id);
      if (index !== -1) {
        localProducts.splice(index, 1);
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    }
    if (type === 'RESET') {
      localProducts = [];
      return Promise.resolve(true);
    }
  }

  return new Promise((resolve, reject) => {
    const requestId = randomUUID();
    const handler = (msg: any) => {
      if (msg.requestId === requestId) {
        process.off('message', handler);
        msg.error ? reject(new Error(msg.error)) : resolve(msg.response);
      }
    };
    process.on('message', handler);
    process.send!({ type, payload, requestId });
  });
}

export async function readProducts(): Promise<Product[]> {
  return await sendToPrimary('READ');
}

export async function getProductById(id: string): Promise<Product | null> {
  const products: Product[] = await readProducts();
  return products.find(p => p.id === id) || null;
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  return await sendToPrimary('CREATE', product);
}

export async function updateProduct(product: Product): Promise<Product | null> {
  return await sendToPrimary('UPDATE', product);
}

export async function deleteProduct(id: string): Promise<boolean> {
  return await sendToPrimary('DELETE', { id });
}

export function resetDb() {
    sendToPrimary('RESET');
}