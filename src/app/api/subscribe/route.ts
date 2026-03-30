import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    try {
      await limiter.check(5, 'BLOG_SUBSCRIBE');
    } catch {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again shortly.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { success: false, message: 'Subscription service is not configured yet.' },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.verify();
    await transporter.sendMail({
      from: `"Portfolio Subscriptions" <${smtpUser}>`,
      to: 'contact@jay739.dev',
      subject: 'New Blog Subscription',
      text: `New subscriber email: ${email}`,
      html: `<p><strong>New subscriber email:</strong> ${email}</p>`,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully! You will receive updates.',
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to process subscription right now.' },
      { status: 500 }
    );
  }
}
