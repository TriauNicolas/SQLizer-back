import { Request, Response } from 'express';
import prisma from '../core/prisma';
import PasswordException from '../exceptions/password.exceptions';
import { Users } from '../models/models';
import { z } from 'zod';
import { sign, verify } from 'jsonwebtoken';
import { sendResetPasswordEmail } from '../core/nodemailer';

// const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function verifyToken(token): Promise<any> {
    return await verify(token, process.env.JWT_KEY);
}

export async function getUserFromToken(token: string): Promise <Users> {
    const id = (await verifyToken(token))?.id;

    if (!id) throw new Error('Invalid Token');

    const user: Users = await prisma.users.findUnique({ where: { id } });

    if (!user) throw new Error('User not valid');

    return user;
}

export const registerController = async (req: Request, res: Response) => {

    const validation = z.object({
        first_name: z.string().nonempty(),
        last_name: z.string().nonempty(),
        email: z.string().email().nonempty(),
        password: z.string()
        //todo: fix regex
        // .regex(regex),
    });
    try {
        const user = validation.parse(req.body);
        const prismaUser = await prisma.users.create({
            data: {
                first_name: user.first_name,
                last_name: user.first_name,
                email: user.email,
                password: await PasswordException.hashPassword(user.password)
            }
        });


        const prismaWorkgroup = await prisma.workgroups.create({
            data: {
                group_name: 'Mes Projets',
                creator_id: prismaUser.id,
                private: true
            }
        });

        await prisma.users_workgroups.create({
            data: {
                user_id: prismaUser.id,
                group_id: prismaWorkgroup.id,
                create_right: true,
                update_right: true,
                delete_right: false
            }
        });

        res.json({success: true});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const loginController = async (req: Request, res: Response) => {
    const validation = z.object({
        email: z.string().email().nonempty(),
        password: z.string()
    });

    try {
        const credentials = validation.parse(req.body);
        const user: Users = await prisma.users.findUnique({ where: { email: credentials.email } });

        if (!user) throw new Error('Invalid Email');

        if (!(await PasswordException.comparePassword(credentials.password, user.password))) throw new PasswordException;

        const token: string = sign({id: user.id}, process.env.JWT_KEY, { expiresIn: '7d' });

        res.json({token});
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
        const user: Users = await prisma.users.findUnique({ where: { email: credentials.email } });

        if (!user) throw new Error('Invalid Email');

        const token = sign({id: user.id, reason: 'forgetPassword'}, process.env.JWT_KEY, { expiresIn: '1h' });

        const response = await sendResetPasswordEmail(user.email, token);
        if (!response.success) throw new Error('An error has occured');

        res.json({success: true, message: 'An email has been sent. It will expire in 1 hour', token});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    const validation = z.object({
        token: z.string().nonempty(),
        newPassword: z.string().nonempty()
        // .regex(regex)
    });

    try {
        const credentials = validation.parse(req.body);
        const id = (await verifyToken(credentials.token)).id;
        if (!id) throw new Error('Invalid Token');

        const password = await PasswordException.hashPassword(credentials.newPassword);

        await prisma.users.update({
            where: { id },
            data: { password }
        });

        res.json({success: true});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};