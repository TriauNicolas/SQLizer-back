import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      type: 'LOGIN',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    requireTLS: true,
});

export async function sendResetPasswordEmail(email: string, token: string): Promise<{success: boolean}> {
    try {
        await transporter.sendMail({
            from: 'SQLizer',
            to: email,
            subject: 'Reset your password',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <title>Password Reset</title>
            </head>
            <body>
              <div style="max-width: 600px; margin: 0 auto;">
                <h2>Password Reset</h2>
                <p>Hello,</p>
                <p>You have requested to reset your password. Please click the link below to reset it:</p>
                <p><a href="${process.env.FRONT_URL}?token=${token}">Reset Password</a></p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <p>Thank you,</p>
                <p>The SQLizer Team</p>
              </div>
            </body>
            </html>
            `
        });
        return {success: true};
    } catch (error) {
      return {success: false};
    }
}