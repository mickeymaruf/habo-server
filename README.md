
---

# ⚙️ Habo Backend — Core API Service

The **Habo Backend** is a high-performance, typesafe REST API built to power the Habo community habit platform. It serves as the engine for user authentication, challenge management, and real-time progress tracking. By leveraging a **Module-Route-Service** architecture, it ensures that business logic remains decoupled from the delivery layer, allowing for a scalable and maintainable codebase.

* **Production API:** [https://habo-server.vercel.app](https://habo-server.vercel.app)
* **Infrastructure:** PostgreSQL hosted on Neon DB with Connection Pooling.

---

## 🛠️ Backend Technologies

| Core Tool | Purpose |
| :--- | :--- |
| **Node.js & Express 5** | High-performance server framework for the REST API. |
| **TypeScript (TSX/TSUP)** | Static typing and optimized ESM builds via `tsup`. |
| **Prisma ORM** | Type-safe database client and migration management. |
| **Better Auth** | Modern authentication framework for secure sessions and RBAC. |
| **Stripe** | Payment infrastructure for premium challenges and webhooks. |
| **Zod** | Runtime schema validation for all incoming API request data. |

---

## 🏗️ Architecture: Module-Route-Service Pattern

To ensure clean code and easy testing, the backend is organized into distinct layers:

* **Routes:** Define entry points and attach specific **Zod** validation middleware.
* **Controllers:** Handle the request/response lifecycle and error mapping.
* **Services:** The "brain" of the app. Contains all **business logic** and Prisma queries.
* **Middlewares:** Centrally handles **Better Auth** session checks and Role-Based Access Control (RBAC).

---

## 🚀 Setup & Installation

### **1. Prerequisites**
* **Node.js:** v18.17 or later.
* **Database:** A PostgreSQL instance (Local or Neon DB).
* **Stripe CLI:** Required for testing webhooks locally.

### **2. Getting Started**
1.  **Navigate to the directory:**
    ```bash
    cd habo-server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment:**
    Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
    > **Note:** Update `.env` with your `DATABASE_URL`, `STRIPE_SECRET_KEY`, and `BETTER_AUTH_SECRET`.

### **3. Database & Development**
1.  **Initialize Database:**
    ```bash
    npx prisma generate
    npm run seed
    ```
2.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    *The API will be available at `http://localhost:5000`.*

---

## 🛠️ Key Build & Operations

| Command | Action |
| :--- | :--- |
| `npm run build` | Generates Prisma client, seeds data, and bundles for production. |
| `npm run quick-build` | Compiles source code without re-seeding (ideal for quick updates). |
| `npm run deploy` | Triggers a production deployment to **Vercel**. |
| `npm run stripe:webhook` | Forwards Stripe events to your local server for payment testing. |

---

## 🔐 Security & Validation
* **Validation:** All data is sanitized and validated via **Zod** before hitting the database.
* **Auth:** Secure session management via **Better Auth**, including protection against CSRF and unauthorized access.
* **RBAC:** Built-in roles (User/Admin) to protect sensitive moderation endpoints.