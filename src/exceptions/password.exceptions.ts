import { hash, compare } from 'bcrypt';

export default class PasswordException extends Error
{
    private static SALT_ROUNDS = 10;
    private static MIN_PASS_SIZE = 5;

    constructor() {
        super('Invalid Password');
    }

    public static isValidPassword(password: string): boolean {
        return password.length >= this.MIN_PASS_SIZE;
    }

    public static async hashPassword(password: string): Promise < string > {
        return await hash(password, this.SALT_ROUNDS);
    }

    public static async comparePassword(password: string, hash: string): Promise < boolean > {
        return await compare(password, hash);
    }
}