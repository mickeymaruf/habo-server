## ⚙️ Backend Setup: Habo (Node.js & Express)

### **1. Prerequisites**
* **Node.js:** v18.17 or later.
* **Database:** A running PostgreSQL instance (Local or Cloud like Neon DB).
* **Tools:** `npm` or `yarn`.

### **2. Installation & Environment**
1.  **Navigate to the backend directory:**
    ```bash
    cd habo-server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Setup Environment Variables:**
    Copy the example environment file to create your local configuration:
    ```bash
    cp .env.example .env
    ```
    > **Note:** Open `.env` and provide your `DATABASE_URL`, `JWT_ACCESS_SECRET`, and `STRIPE_SECRET_KEY`.

### **3. Database Initialization**
1.  **Sync Prisma Schema:**
    Generate the Prisma client and push the schema to your database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
    *(Use `npx prisma migrate dev` if you prefer tracking formal migration history during development).*

### **4. Development Workflow**
1.  **Start the server:**
    ```bash
    npm run dev
    ```
2.  **Access the API:** The server will typically run at `http://localhost:5000`.

---

## 🏗️ Architecture: Module-Route-Service Pattern

To ensure scalability and clean code, the backend is organized into distinct layers:

* **Routes:** Define the entry points and HTTP methods (e.g., `challenge.routes.ts`).
* **Controllers:** Handle request parsing, call the appropriate services, and return HTTP responses.
* **Services:** Contain the **core business logic** and direct Prisma queries. This keeps logic reusable and independent of the transport layer.
* **Middlewares:** Handle centralized tasks like **JWT Authentication**, Role-Based Access Control (RBAC), and global error handling.

---

## 🔐 Authentication & Security
* **Better Auth:** Implemented using robust JWT strategies with short-lived access tokens and secure storage logic.
* **RBAC (Role-Based Access Control):** Specific routes are restricted to `ADMIN` roles (e.g., challenge approval, user banning).
* **Validation:** All incoming request bodies are strictly validated using **Zod** schemas before reaching the controller.

---

## 🛠️ Backend Technologies

| Core Tool | Purpose |
| :--- | :--- |
| **Node.js & Express 5** | High-performance server framework for building the REST API. |
| **TypeScript** | For static typing and building a more reliable, maintainable codebase. |
| **Prisma ORM** | Typesafe database client for interacting with PostgreSQL. |
| **Better Auth** | Modern, secure authentication framework for managing users and sessions. |
| **Stripe** | Infrastructure for handling premium challenge payments and webhooks. |
| **Zod** | Schema-based validation for all incoming request data. |

---