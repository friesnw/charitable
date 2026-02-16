import { Resend } from 'resend';
import { env } from '../env.js';

const resend = new Resend(env.RESEND_API_KEY);

// From address — update domain once verified with Resend
const FROM_ADDRESS = 'GoodLocal <onboarding@contact.goodlocal.org>';

export async function sendMagicLink(email: string, token: string): Promise<void> {
  const magicLink = `${env.FRONTEND_URL}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Sign in to GoodLocal',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; color: #333; margin-bottom: 24px;">Sign in to GoodLocal</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
          Click the button below to sign in. This link expires in 15 minutes.
        </p>
        <a href="${magicLink}"
           style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px;
                  text-decoration: none; border-radius: 6px; font-weight: 500;">
          Sign in to GoodLocal
        </a>
        <p style="color: #999; font-size: 14px; margin-top: 32px;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `,
  });
}
