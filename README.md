# CRUD-API

# Product Catalog CRUD API

A simple and scalable RESTful API for a Product Catalog built with **Fastify**, **TypeScript**, and **Zod**.

## 🚀 Features

- **Full CRUD**: Create, Read, Update, and Delete products.
- **Validation**: Strict schema validation using **Zod**.
- **In-Memory DB**: Persistent storage using a local JSON file.
- **Scaling**: Horizontal scaling support using Node.js **Cluster API** with a built-in Round-robin Load Balancer.
- **Testing**: API scenarios covered with **Supertest**.

---

## 🛠️ Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file based on **.env.example:Bashcp .env**. example .env
4. 🏃 **Running the Application**
   _Development Mode_
   Runs the server with hot-reload (using tsx or nodemon):Bash **npm run start:dev**
   _Production Mode_
   Builds the TypeScript code and runs the bundled application:
   Bash **npm run start:prod**
   _Multi-instance Mode (Horizontal Scaling)_
   Starts a load balancer on PORT and worker instances on PORT + n (using all available CPU cores minus one):
   Bash **npm run start:multi**
5. 🧪 **Testing**
   To run the API test scenarios:
   Bash **npm test**
6. 📨 **API Endpoints**
   Method,Endpoint,Description,Expected Status
   GET,/products,Fetch all products,200
   GET,/products/{id},Fetch a specific product by UUID,200 / 400 / 404
   POST,/products,Create a new product,201 / 400
   PUT,/products/{id},Update an existing product,200 / 400 / 404
   DELETE,/products/{id},Remove a product from the catalog,204 / 400 / 404

7. **Product Data Structure**
   {
   "id": "uuid-string",
   "name": "string",
   "description": "string",
   "price": "number (> 0)",
   "category": "string",
   "inStock": "boolean"
   }

8. 📂 **Project Structure**
   src/server.ts - Application entry point & error handling.
   src/cluster.ts - Cluster management & Load balancer.
   src/routes/ - API route definitions.
   src/database/ - JSON file persistence logic.
   src/types/ - Zod schemas and TypeScript interfaces.
   db.json - Local database storage (created automatically).
