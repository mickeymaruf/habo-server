import { UserRole } from "../../generated/prisma/enums";

export type IRequestUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
};
