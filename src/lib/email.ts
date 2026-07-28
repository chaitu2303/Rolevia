import { Resend } from 'resend';

// Only instantiate if the key exists to avoid build-time errors when the env var is missing
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';
const APP_NAME = 'Placement2Job';
const PROD_URL = process.env.NEXTAUTH_URL ?? 'https://careeros-iota.vercel.app';

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const resetUrl = `${PROD_URL}/reset-password?token=${resetToken}`;

  if (!resend) {
    // Graceful degradation: log reset URL if Resend is not configured
    console.warn('[email] RESEND_API_KEY not set. Password reset URL (DEV ONLY):');
    console.warn('[email] Reset URL:', resetUrl);
    return;
  }

  const { error } = await resend.emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to,
    subject: 'Reset your CareerOS password',
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #0f172a; border-radius: 12px; margin-bottom: 16px;">
                <span style="color: white; font-size: 24px;">🎓</span>
              </div>
              <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0;">${APP_NAME}</h1>
            </div>
            <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin: 0 0 12px;">Reset your password</h2>
            <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              We received a request to reset the password for your CareerOS account. Click the button below to create a new password.
            </p>
            <a href="${resetUrl}" style="display: block; text-align: center; background: #0f172a; color: white; text-decoration: none; padding: 14px 24px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-bottom: 24px;">
              Reset Password
            </a>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 8px;">
              This link expires in <strong>1 hour</strong> and can only be used once.
            </p>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0 0 24px;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #cbd5e1; font-size: 12px; text-align: center; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:<br />
              <a href="${resetUrl}" style="color: #64748b; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('[email] Failed to send password reset email:', error);
    throw new Error('Failed to send email');
  }
}
