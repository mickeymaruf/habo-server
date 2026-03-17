import express from "express";

const app = express();

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: `App is running.`,
  });
});

export default app;
