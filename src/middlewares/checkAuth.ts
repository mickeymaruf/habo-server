import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/prisma/enums";
import status from "http-status";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export const checkAuth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        return res.status(status.UNAUTHORIZED).json({
          success: false,
          message: "You are not authorized!",
        });
      }

      // if (!session.user.emailVerified) {
      //   return res.status(status.FORBIDDEN).json({
      //     success: false,
      //     message:
      //       "Email verification required! Please verify your email first.",
      //   });
      // }

      if (roles.length && !roles.includes(session.user.role as UserRole)) {
        return res.status(status.FORBIDDEN).json({
          success: false,
          message:
            "Forbidden! You don't have permission to access this resources.",
        });
      }

      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role as UserRole,
        emailVerified: session.user.emailVerified,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkAuth;
