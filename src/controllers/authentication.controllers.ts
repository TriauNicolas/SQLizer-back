import { Request, Response } from "express";
import prisma from "../core/prisma";
import PasswordException from "../exceptions/password.exceptions";
import { Users } from "../models/models";
import { z } from "zod";
import { sign, verify } from "jsonwebtoken";
import { sendResetPasswordEmail } from "../core/nodemailer";
import {
  getUserByEmail,
  getUserById,
  registerService,
} from "../services/authentication.services";
import { getFirstDatabaseByDatabaseId } from "../services/databases.services";
import { getUserWorkgroupByUserIdAndWorkgroupId } from "../services/usersWorkgroups.services";
import { getFirstDatabaseGroupByGroupId } from "../services/databasesGroups.services";
import { getFirstWorkgroupById } from "../services/workgroups.services";

// const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyToken(token): Promise<any> {
  return await verify(token, process.env.JWT_KEY);
}

export const extractBearerToken = (req: Request) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    return bearer[1].toString();
  } else {
    throw new Error("Invalid Token");
  }
};

export async function getUserFromToken(token: string): Promise<Users> {
  try {
    const id = (await verifyToken(token))?.id;

    if (!id) throw new Error("Invalid Token");

    const user = await getUserById(id);

    if (!user) throw new Error("User not valid");

    return user;
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
}

export async function getUserFromRequest(req: Request): Promise<Users> {
  try {
    const token = extractBearerToken(req);
    return getUserFromToken(token.toString());
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
}

export async function canUserUpdateDatabase(
  userId: string,
  databaseId: string
): Promise<boolean> {
  try {
    const database = await getFirstDatabaseByDatabaseId(databaseId);
    const dbGroup = await getFirstDatabaseGroupByGroupId(database.group_id);
    const workgroup = await getFirstWorkgroupById(dbGroup.workgroup_id);
    const userWorkgroup = await getUserWorkgroupByUserIdAndWorkgroupId(userId, workgroup.id, true);
    if (userWorkgroup.update_right) return true;
    return false;
  } catch (error) {
    return false;
  }
}

export const registerController = async (req: Request, res: Response) => {
  const validation = z.object({
    first_name: z.string().nonempty(),
    last_name: z.string().nonempty(),
    email: z.string().email().nonempty(),
    password: z.string(),
    //todo: fix regex
    // .regex(regex),
  });
  try {
    const user = validation.parse(req.body);
    await registerService(user);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  const validation = z.object({
    email: z.string().email().nonempty(),
    password: z.string(),
  });

  try {
    const credentials = validation.parse(req.body);
    const user = await getUserByEmail(credentials.email);

    if (!user) throw new Error("Invalid Email");

    if (
      !(await PasswordException.comparePassword(
        credentials.password,
        user.password
      ))
    )
      throw new PasswordException();

    const token: string = sign({ id: user.id }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    res.json({
      token,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const forgetPassword = async (req: Request, res: Response) => {
  const validation = z.object({
    email: z.string().email().nonempty(),
  });

  try {
    const credentials = validation.parse(req.body);
    const user: Users = await prisma.users.findUnique({
      where: { email: credentials.email },
    });

    if (!user) throw new Error("Invalid Email");

    const token = sign(
      { id: user.id, reason: "forgetPassword" },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    const response = await sendResetPasswordEmail(user.email, token);
    if (!response.success) throw new Error("An error has occured");

    res.json({
      success: true,
      message: "An email has been sent. It will expire in 1 hour",
      token,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const validation = z.object({
    token: z.string().nonempty(),
    newPassword: z.string().nonempty(),
    // .regex(regex)
  });

  try {
    const credentials = validation.parse(req.body);
    const id = (await verifyToken(credentials.token)).id;
    if (!id) throw new Error("Invalid Token");

    const password = await PasswordException.hashPassword(
      credentials.newPassword
    );

    await prisma.users.update({
      where: { id },
      data: { password },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const verifTokenController = async (req: Request, res: Response) => {
  try {
    await verifyToken(extractBearerToken(req));
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const canUserAccessDatabaseController = async (req: Request, res: Response) => {
      try {
        const user = await getUserFromRequest(req);
        const databaseId = req.params.databaseId;
        const response = await canUserUpdateDatabase(user.id, databaseId);
        if (!response) throw new Error("User can't update database");
        res.json({response});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
