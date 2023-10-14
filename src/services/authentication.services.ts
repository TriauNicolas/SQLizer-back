import prisma from "../core/prisma";
import PasswordException from "../exceptions/password.exceptions";
import { Users } from "../models/models";

export const registerService = async (user: Users) => {
  try {
    const prismaUser = await prisma.users.create({
      data: {
        first_name: user?.first_name,
        last_name: user?.first_name,
        email: user?.email,
        password: await PasswordException.hashPassword(user.password),
      },
    });

    const prismaWorkgroup = await prisma.workgroups.create({
      data: {
        group_name: "Mes Projets",
        creator_id: prismaUser.id,
        private: true,
      },
    });

    await prisma.users_workgroups.create({
      data: {
        user_id: prismaUser.id,
        group_id: prismaWorkgroup.id,
        create_right: true,
        update_right: true,
        delete_right: false,
      },
    });

    return;
  } catch (error) {
    throw new Error(error.message);
  }
};
