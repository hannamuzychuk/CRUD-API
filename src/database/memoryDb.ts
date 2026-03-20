import path from "path";
import { Product } from "../types/product";
import fs from 'fs/promises';

const dbPath = path.join(__dirname, 'db.json');

export async function readProducts(): Promise<Product[]> {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch {
        await fs.writeFile(dbPath, '[]');
        return [];
    }
}

export async function writeProducts(products: Product[]) {
    await fs.writeFile(dbPath, JSON.stringify(products, null, 2));
}