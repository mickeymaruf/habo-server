import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "../config/env";
import { UserRole, UserStatus } from "../../generated/prisma/enums";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.BETTER_AUTH_URL, env.FRONTEND_URL],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.USER,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },
  advanced: {
    /**
     * Forces cookies to be sent only over HTTPS.
     *
     * ✅ Required in production
     * ❌ Will break on localhost (HTTP) if always true
     *
     * Recommended:
     * useSecureCookies: process.env.NODE_ENV === "production"
     *
     * Set to true to use __Secure- prefixed cookies (recommended for better authentication security in production over HTTPS)
     */
    useSecureCookies: false,

    defaultCookieAttributes: {
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
      httpOnly: true,
      path: "/",
    },
  },
});
