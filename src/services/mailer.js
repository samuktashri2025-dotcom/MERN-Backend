import nodemailer from 'nodemailer';

function createTransport() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
}

export async function sendPasswordResetEmail(email, resetUrl) {
  const transport = createTransport();
  if (!transport) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Password reset email is not configured.');
    }
    console.info(`Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your Samchu Dance Studio password',
    text: `Use this link to reset your password. It expires in one hour: ${resetUrl}`,
  });
}
