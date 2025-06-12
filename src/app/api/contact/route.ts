import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { validateToken } from '@/lib/csrf';
import { rateLimit } from '@/lib/rate-limit';
import { handleAPIError, Errors } from '@/lib/error-handling';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    try {
      await limiter.check(5, 'CONTACT_FORM'); // 5 requests per minute
    } catch {
      throw Errors.TooManyRequests();
    }

    // CSRF validation
    const token = request.headers.get('x-csrf-token');
    if (!token) {
      throw Errors.Forbidden('CSRF token missing');
    }
    if (!validateToken(token)) {
      throw Errors.Forbidden('Invalid CSRF token');
    }

    const data = await request.json();

    // Validate required fields
    if (!data.email || !data.message) {
      throw Errors.BadRequest('Email and message are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw Errors.BadRequest('Invalid email format');
    }

    // Configure your SMTP transport (use environment variables in production)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `Portfolio Contact <${process.env.SMTP_USER}>`,
      to: 'jayakrishnakonda@jay739.dev',
      subject: `[Portfolio] ${data.subject}`,
      replyTo: data.email,
      text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    return handleAPIError(error);
  }
} 