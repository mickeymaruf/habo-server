import { UserRole } from "../../generated/prisma/enums";
import { env } from "../config/env";
import { auth } from "../lib/auth";
import { prisma } from "../lib/prisma";

export const seedSuperAdmin = async () => {
  try {
    const isAdminExist = await prisma.user.findFirst({
      where: {
        role: UserRole.ADMIN,
      },
    });

    if (isAdminExist) {
      console.log("Super admin already exists. Skipping seeding super admin.");
      return;
    }

    const superAdminUser = await auth.api.signUpEmail({
      body: {
        email: env.SUPER_ADMIN_EMAIL,
        password: env.SUPER_ADMIN_PASSWORD,
        name: "Super Admin",
        role: UserRole.ADMIN,
        rememberMe: false,
      },
    });

    const superAdmin = await prisma.user.update({
      where: {
        id: superAdminUser.user.id,
      },
      data: {
        emailVerified: true,
      },
    });

    console.log("Super Admin Created ", superAdmin);
  } catch (error) {
    console.error("Error seeding super admin: ", error);
    await prisma.user.delete({
      where: {
        email: env.SUPER_ADMIN_EMAIL,
      },
    });
  }
};

seedSuperAdmin();
