import app from "./app";
import { env } from "./config/env";

// Only in development
// In production, vercel will refer to index.ts which refers to app.ts
// this is becuase vercel is a serverless platform and does not support listening to a port
if (process.env.NODE_ENV !== "production") {
  app.listen(env.PORT || 5000, () => {
    console.log(
      `Server is running locally at http://localhost:${env.PORT || 5000}`,
    );
  });
}
