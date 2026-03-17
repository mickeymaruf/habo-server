import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    prisma.$connect();
    console.log("Connected to the database successfully!");

    app.listen(env.PORT, () => {
      console.log(`Server is listening on port ${env.PORT}`);
    });
  } catch (error) {
    console.log("An error occured:", error);
    prisma.$disconnect();
    process.exit(1);
  }
}

main();
