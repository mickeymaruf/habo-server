import { toNodeHandler } from "better-auth/node";
import express from "express";
import cors from "cors";
import { auth } from "./lib/auth";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { AuthRoutes } from "./modules/auth/auth.route";
import { env } from "./config/env";
import { IndexRoutes } from "./routes";

const app = express();

app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      env.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/auth", AuthRoutes);
app.all("/api/auth/*splat", toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.use("/api/v1", IndexRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `App is running.`,
  });
});

app.use(notFound);
app.use(globalErrorHandler); // error handler LAST

export default app;
