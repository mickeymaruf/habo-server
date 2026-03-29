import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "../config/env";
import { UserRole, UserStatus } from "../../generated/prisma/enums";

const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: async (request) => {
    const origin = request?.headers.get("origin");

    const allowedOrigins = [env.BETTER_AUTH_URL, env.FRONTEND_URL].filter(
      Boolean,
    );

    // Check if origin matches allowed origins or Vercel pattern
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin)
    ) {
      return [origin];
    }

    return [];
  },
  basePath: "/api/auth",
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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
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
    useSecureCookies: isProd,
    crossSubDomainCookies: {
      enabled: false,
    },
    disableCSRFCheck: true, // Allow requests without Origin header (Postman, mobile apps, etc.)
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",

      // sameSite: isProd ? "none" : "lax",
      // secure: isProd,
      // httpOnly: true,
    },
  },
});
