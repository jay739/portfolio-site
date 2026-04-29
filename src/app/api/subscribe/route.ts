import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getClientIpFromHeaders, rateLimit } from '@/lib/rate-limit';
import { validateCsrfToken } from '@/lib/csrf';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

function isValidEmail(email: string) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email) && email.length <= 254;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCsrfToken(csrfToken)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing CSRF token.' },
        { status: 403 }
      );
    }

    try {
      await limiter.check(5, `BLOG_SUBSCRIBE:${ip}`);
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
      html: `<p><strong>New subscriber email:</strong> ${email.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
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
