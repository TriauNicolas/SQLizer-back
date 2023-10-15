import prisma from "../core/prisma";
import PasswordException from "../exceptions/password.exceptions";
import { Users } from "../models/models";
import { createUserWorkgroup } from "./usersWorkgroups.services";
import { createWorkgroup } from "./workgroups.services";

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

    const prismaWorkgroup = await createWorkgroup("Mes Projets", prismaUser.id, true);

    await createUserWorkgroup({
      user_id: prismaUser.id,
      group_id: prismaWorkgroup.id,
      create_right: true,
      update_right: true,
      delete_right: false,
    });

    return;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getUserByEmail = async (email: string):Promise<Users> => {
  return await prisma.users.findUnique({ where: { email } });
};

export const getUserById = async (id: string):Promise<Users> => {
  return await prisma.users.findUnique({ where: { id } });
};
