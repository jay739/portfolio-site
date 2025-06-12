import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { validateCsrfToken } from '@/lib/csrf';
import { rateLimit } from '@/lib/rate-limit';
import { handleAPIError, Errors } from '@/lib/error-handling';

// Server-side validation schemas
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Enhanced validation functions
function validateName(name: string): ValidationError | null {
  if (!name || typeof name !== 'string') {
    return { field: 'name', message: 'Name is required' };
  }
  
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters long' };
  }
  
  if (trimmedName.length > 100) {
    return { field: 'name', message: 'Name must be less than 100 characters' };
  }
  
  // Check for suspicious patterns (only numbers, special characters, etc.)
  if (!/^[a-zA-Z\s\u00C0-\u017F\u0400-\u04FF\u4e00-\u9fff]+$/.test(trimmedName)) {
    return { field: 'name', message: 'Name can only contain letters and spaces' };
  }
  
  return null;
}

function validateEmail(email: string): ValidationError | null {
  if (!email || typeof email !== 'string') {
    return { field: 'email', message: 'Email is required' };
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }
  
  if (trimmedEmail.length > 254) {
    return { field: 'email', message: 'Email address is too long' };
  }
  
  // Check for suspicious domains or patterns
  const suspiciousDomains = ['tempmail', 'throwaway', '10minutemail', 'mailinator'];
  if (suspiciousDomains.some(domain => trimmedEmail.includes(domain))) {
    return { field: 'email', message: 'Please use a permanent email address' };
  }
  
  return null;
}

function validateSubject(subject: string): ValidationError | null {
  if (!subject || typeof subject !== 'string') {
    return { field: 'subject', message: 'Subject is required' };
  }
  
  const trimmedSubject = subject.trim();
  if (trimmedSubject.length < 3) {
    return { field: 'subject', message: 'Subject must be at least 3 characters long' };
  }
  
  if (trimmedSubject.length > 200) {
    return { field: 'subject', message: 'Subject must be less than 200 characters' };
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /\b(free|money|cash|prize|winner|urgent|click here|act now)\b/i,
    /\$\d+/,
    /\b(viagra|cialis|pharmacy)\b/i,
    /[A-Z]{10,}/, // Too many caps
  ];
  
  if (spamPatterns.some(pattern => pattern.test(trimmedSubject))) {
    return { field: 'subject', message: 'Subject contains prohibited content' };
  }
  
  return null;
}

function validateMessage(message: string): ValidationError | null {
  if (!message || typeof message !== 'string') {
    return { field: 'message', message: 'Message is required' };
  }
  
  const trimmedMessage = message.trim();
  if (trimmedMessage.length < 10) {
    return { field: 'message', message: 'Message must be at least 10 characters long' };
  }
  
  if (trimmedMessage.length > 5000) {
    return { field: 'message', message: 'Message must be less than 5000 characters' };
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /https?:\/\/[^\s]+/gi, // Multiple URLs
    /\b(free|money|cash|prize|winner|urgent|click here|act now)\b/gi,
    /[A-Z]{20,}/, // Too many caps
    /(viagra|cialis|pharmacy|casino|lottery)/gi,
  ];
  
  let spamScore = 0;
  spamPatterns.forEach(pattern => {
    const matches = trimmedMessage.match(pattern);
    if (matches) {
      spamScore += matches.length;
    }
  });
  
  if (spamScore > 3) {
    return { field: 'message', message: 'Message contains prohibited content' };
  }
  
  // Check for repeated characters/words (spam indicator)
  const repeatedChar = /(.)\1{10,}/.test(trimmedMessage);
  const repeatedWord = /(\b\w+\b)(\s+\1){5,}/i.test(trimmedMessage);
  
  if (repeatedChar || repeatedWord) {
    return { field: 'message', message: 'Message contains excessive repetition' };
  }
  
  return null;
}

function validateFormData(data: any): { isValid: boolean; errors: ValidationError[]; sanitizedData?: ContactFormData } {
  const errors: ValidationError[] = [];
  
  // Validate each field
  const nameError = validateName(data.name);
  if (nameError) errors.push(nameError);
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.push(emailError);
  
  const subjectError = validateSubject(data.subject);
  if (subjectError) errors.push(subjectError);
  
  const messageError = validateMessage(data.message);
  if (messageError) errors.push(messageError);
  
  if (errors.length > 0) {
    return { isValid: false, errors };
  }
  
  // Return sanitized data
  const sanitizedData: ContactFormData = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    subject: data.subject.trim(),
    message: data.message.trim()
  };
  
  return { isValid: true, errors: [], sanitizedData };
}

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for contact forms
    try {
      await limiter.check(3, 'CONTACT_FORM'); // Only 3 requests per minute
    } catch {
      throw Errors.TooManyRequests('Too many contact form submissions. Please wait before trying again.');
    }

    // CSRF validation
    const token = request.headers.get('x-csrf-token');
    if (!token) {
      throw Errors.Forbidden('CSRF token missing');
    }
    if (!validateCsrfToken(token)) {
      throw Errors.Forbidden('Invalid CSRF token');
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      throw Errors.BadRequest('Invalid request body. Please ensure all fields are properly filled.');
    }

    // Server-side validation
    const validation = validateFormData(body);
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      }, { status: 400 });
    }

    const { name, email, subject, message } = validation.sanitizedData!;

    // Check SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.error('SMTP configuration missing');
      throw Errors.Internal('Email service temporarily unavailable. Please try again later.');
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (error) {
      console.error('SMTP connection failed:', error);
      throw Errors.Internal('Email service temporarily unavailable. Please try again later.');
    }

    // Compose email
    const mailOptions = {
      from: `"Portfolio Contact" <${smtpUser}>`,
      to: 'contact@jay739.dev',
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from: ${request.headers.get('user-agent') || 'Unknown'}
IP: ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'}
Time: ${new Date().toISOString()}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Portfolio Contact</h2>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #374151;">Name:</strong>
              <span style="margin-left: 10px; color: #6b7280;">${name}</span>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #374151;">Email:</strong>
              <a href="mailto:${email}" style="margin-left: 10px; color: #2563eb; text-decoration: none;">${email}</a>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #374151;">Subject:</strong>
              <span style="margin-left: 10px; color: #6b7280;">${subject}</span>
            </div>
            
            <div style="margin-bottom: 30px;">
              <strong style="color: #374151;">Message:</strong>
              <div style="margin-top: 10px; padding: 15px; background-color: #f3f4f6; border-radius: 5px; border-left: 4px solid #2563eb;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <div style="font-size: 12px; color: #9ca3af;">
              <p><strong>Metadata:</strong></p>
              <p>User Agent: ${request.headers.get('user-agent') || 'Unknown'}</p>
              <p>IP Address: ${request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown'}</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          </div>
        </div>
      `
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw Errors.Internal('Failed to send message. Please try again later.');
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! I will get back to you soon.'
    });

  } catch (error) {
    return handleAPIError(error);
  }
} 