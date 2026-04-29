'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCsrf } from '@/hooks/useCsrf';
import { motion } from 'framer-motion';
import FilterChip from '@/components/ui/FilterChip';

interface ValidationError {
  field: string;
  message: string;
}

const CONTACT_DRAFT_KEY = 'portfolio_contact_draft_v1';
const CONTACT_SUCCESS_KEY = 'portfolio_contact_success_v1';

function validateContactForm(data: { name: string; email: string; subject: string; message: string }) {
  const errors: Record<string, string> = {};

  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }

  if (!data.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.subject.trim() || data.subject.trim().length < 3) {
    errors.subject = 'Please add a short subject so I know what this is about.';
  }

  if (!data.message.trim() || data.message.trim().length < 20) {
    errors.message = 'Please share a little more context so I can respond helpfully.';
  }

  return errors;
}

export default function ContactSection() {
  const searchParams = useSearchParams();
  const getQueryParam = (key: string) => searchParams?.get(key) ?? null;
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [subjectDraft, setSubjectDraft] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [intentDraft, setIntentDraft] = useState(getQueryParam('intent') ?? '');
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const { csrfToken, fetchWithCsrf } = useCsrf();

  useEffect(() => {
    const subjectParam = getQueryParam('subject');
    const messageParam = getQueryParam('message');
    const intentParam = getQueryParam('intent');
    if (subjectParam) setSubjectDraft(subjectParam);
    if (messageParam) setMessageDraft(messageParam);
    if (intentParam) setIntentDraft(intentParam);
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(CONTACT_DRAFT_KEY);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw) as {
        name?: string;
        email?: string;
        subject?: string;
        message?: string;
        savedAt?: number;
      };
      setNameDraft(draft.name ?? '');
      setEmailDraft(draft.email ?? '');
      setSubjectDraft(getQueryParam('subject') ?? draft.subject ?? '');
      setMessageDraft(getQueryParam('message') ?? draft.message ?? '');
      setLastSavedAt(draft.savedAt ?? null);
      if (draft.name || draft.email || draft.subject || draft.message) {
        setDraftRestored(true);
      }
    } catch {
      window.localStorage.removeItem(CONTACT_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(CONTACT_SUCCESS_KEY);
    if (!raw) return;
    try {
      const success = JSON.parse(raw) as { sentAt?: number; message?: string };
      if (success.sentAt && Date.now() - success.sentAt < 24 * 60 * 60 * 1000) {
        setStatus('success');
        setLastSentAt(success.sentAt);
        setMessage(success.message || 'Message sent! I will get back to you soon.');
      } else {
        window.localStorage.removeItem(CONTACT_SUCCESS_KEY);
      }
    } catch {
      window.localStorage.removeItem(CONTACT_SUCCESS_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasDraft = nameDraft || emailDraft || subjectDraft || messageDraft;
    if (!hasDraft) {
      window.localStorage.removeItem(CONTACT_DRAFT_KEY);
      return;
    }

    const savedAt = Date.now();
    window.localStorage.setItem(
      CONTACT_DRAFT_KEY,
      JSON.stringify({
        name: nameDraft,
        email: emailDraft,
        subject: subjectDraft,
        message: messageDraft,
        savedAt,
      })
    );
    setLastSavedAt(savedAt);
  }, [emailDraft, messageDraft, nameDraft, subjectDraft]);

  const clearDraft = () => {
    setNameDraft('');
    setEmailDraft('');
    setSubjectDraft('');
    setMessageDraft('');
    setFieldErrors({});
    setDraftRestored(false);
    setLastSavedAt(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CONTACT_DRAFT_KEY);
    }
  };

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setFieldErrors({});
    
    const form = formRef.current;
    if (!form) {
      setStatus('error');
      setMessage('Form is not available. Please refresh and try again.');
      return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const clientErrors = validateContactForm({
      name: String(data.name ?? ''),
      email: String(data.email ?? ''),
      subject: String(data.subject ?? ''),
      message: String(data.message ?? ''),
    });

    if (Object.keys(clientErrors).length > 0) {
      setStatus('error');
      setMessage('Please correct the highlighted fields before sending.');
      setFieldErrors(clientErrors);
      return;
    }

    setStatus('loading');
    
    try {
      const res = await fetchWithCsrf('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      let responseData: any = {};
      try {
        responseData = await res.json();
      } catch {
        responseData = {};
      }
      
      if (res.ok && responseData.success) {
        setStatus('success');
        const successMessage = responseData.message || 'Message sent! I will get back to you soon.';
        setMessage(successMessage);
        form.reset();
        clearDraft();
        const sentAt = Date.now();
        setLastSentAt(sentAt);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            CONTACT_SUCCESS_KEY,
            JSON.stringify({ sentAt, message: successMessage })
          );
        }
      } else if (res.status === 400 && responseData.errors) {
        // Handle validation errors
        setStatus('error');
        setMessage('Please correct the errors below.');
        
        const errors: Record<string, string> = {};
        responseData.errors.forEach((error: ValidationError) => {
          errors[error.field] = error.message;
        });
        setFieldErrors(errors);
      } else {
        setStatus('error');
        setMessage(responseData.message || 'Failed to send message. Please try again later.');
      }
    } catch (error) {
      setStatus('error');
      const errMessage = error instanceof Error ? error.message : '';
      if (errMessage.includes('CSRF token')) {
        setMessage('Security token expired. Please refresh the page and try again.');
      } else {
        setMessage('Network error. Please check your connection and try again.');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const intentOptions = ['hiring', 'collab', 'consulting', 'technical-question'];
  const quickSubjects = ['Project Collaboration', 'AI/ML Consulting', 'Home Server Setup', 'General Inquiry'];
  const resumeHighlights = [
    { label: 'Private AI cloud + homelab platform', href: '/projects?project=ai-platform-infrastructure-batcave-personal-ml-cloud' },
    { label: 'Production ML and GenAI delivery outcomes', href: '/impact' },
    { label: 'Technical writing and architecture notes', href: '/blog' },
  ];
  const draftValidation = useMemo(
    () =>
      validateContactForm({
        name: nameDraft,
        email: emailDraft,
        subject: subjectDraft,
        message: messageDraft,
      }),
    [emailDraft, messageDraft, nameDraft, subjectDraft]
  );
  const isReadyToSend =
    nameDraft.trim().length > 0 &&
    emailDraft.trim().length > 0 &&
    subjectDraft.trim().length > 0 &&
    messageDraft.trim().length > 0 &&
    Object.keys(draftValidation).length === 0;

  return (
    <section className="relative pt-0 pb-16 px-2 sm:px-6 w-full overflow-hidden" id="contact">
      <div className="w-full relative">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-background" />
        </div>
        <motion.div 
          className="relative w-full neural-card neural-glow-border p-4 sm:p-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h2 
            className="neural-section-title text-center mb-3"
            variants={itemVariants}
          >
            Start a Conversation
          </motion.h2>
          <motion.p className="neural-section-copy text-center mb-8" variants={itemVariants}>
            Secure form flow with clear feedback and quick response handling.
          </motion.p>

          <motion.div
            className="mx-auto mb-8 grid max-w-4xl gap-3 rounded-2xl border border-slate-700/55 bg-slate-950/35 p-4 sm:grid-cols-3"
            variants={itemVariants}
          >
            <div className="rounded-xl border border-slate-700/55 bg-slate-900/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Response window</p>
              <p className="mt-1 text-sm font-medium text-slate-100">Usually within 24-48 hours</p>
            </div>
            <div className="rounded-xl border border-slate-700/55 bg-slate-900/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Best messages include</p>
              <p className="mt-1 text-sm font-medium text-slate-100">Goal, scope, timeline, and links</p>
            </div>
            <div className="rounded-xl border border-slate-700/55 bg-slate-900/50 p-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Status</p>
              <p className={`mt-1 text-sm font-medium ${isReadyToSend ? 'text-emerald-300' : 'text-amber-200'}`}>
                {isReadyToSend ? 'Ready to send' : 'Add a bit more detail'}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mx-auto mb-8 grid max-w-4xl gap-4 rounded-2xl border border-slate-700/55 bg-slate-950/35 p-4 lg:grid-cols-[1.3fr,0.7fr]"
            variants={itemVariants}
          >
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Intent routing</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {intentOptions.map((intent) => (
                  <FilterChip
                    key={intent}
                    active={intentDraft === intent}
                    onClick={() => {
                      setIntentDraft(intent);
                      if (!subjectDraft.trim()) {
                        setSubjectDraft(
                          intent === 'technical-question'
                            ? 'Technical Question'
                            : intent.charAt(0).toUpperCase() + intent.slice(1)
                        );
                      }
                    }}
                    className="text-xs sm:text-sm"
                  >
                    {intent === 'technical-question' ? 'Technical Question' : intent.charAt(0).toUpperCase() + intent.slice(1)}
                  </FilterChip>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-700/55 bg-slate-900/50 p-4">
              <p className="text-[11px] uppercase tracking-wider text-slate-500">Resume highlights</p>
              <div className="mt-3 space-y-2">
                {resumeHighlights.map((item) => (
                  <a key={item.href} href={item.href} className="block text-sm text-amber-200 transition hover:text-amber-100">
                    {item.label} →
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {(draftRestored || lastSavedAt) && status !== 'success' && (
            <motion.div
              className="mx-auto mb-6 flex max-w-4xl flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              variants={itemVariants}
            >
              <div>
                <p className="text-sm font-medium text-amber-200">
                  {draftRestored ? 'Restored your saved draft.' : 'Draft auto-save is on.'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {lastSavedAt ? `Last saved at ${new Date(lastSavedAt).toLocaleTimeString()}.` : 'We keep your in-progress message locally on this device.'}
                </p>
              </div>
              <button
                type="button"
                onClick={clearDraft}
                className="neural-control-btn-ghost text-xs self-start sm:self-auto"
              >
                Clear draft
              </button>
            </motion.div>
          )}
          
          <motion.form 
            ref={formRef} 
            onSubmit={handleSubmit} 
            className="space-y-5 sm:space-y-6 max-w-4xl mx-auto" 
            role="form" 
            aria-label="Contact form"
            variants={itemVariants}
            noValidate // Disable browser validation to use server-side only
          >
            <input type="hidden" name="intent" value={intentDraft} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-base sm:text-lg font-medium text-slate-100 mb-2">
                  Name *
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={nameDraft}
                  className={`neural-input p-3 text-base ${
                    fieldErrors.name 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'focus:ring-blue-500'
                  }`}
                  onChange={(e) => {
                    setNameDraft(e.target.value);
                    clearFieldError('name');
                  }}
                  placeholder="Full name"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                {fieldErrors.name && (
                  <motion.p 
                    id="name-error"
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                  >
                    {fieldErrors.name}
                  </motion.p>
                )}
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-base sm:text-lg font-medium text-slate-100 mb-2">
                  Email *
                </label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={emailDraft}
                  className={`neural-input p-3 text-base ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'focus:ring-blue-500'
                  }`}
                  onChange={(e) => {
                    setEmailDraft(e.target.value);
                    clearFieldError('email');
                  }}
                  placeholder="name@company.com"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && (
                  <motion.p 
                    id="email-error"
                    className="mt-2 text-sm text-red-600 dark:text-red-400"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                  >
                    {fieldErrors.email}
                  </motion.p>
                )}
              </motion.div>
            </div>
            
            <motion.div variants={itemVariants}>
              <label htmlFor="subject" className="block text-base sm:text-lg font-medium text-slate-100 mb-2">
                Subject *
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {quickSubjects.map((quickSubject) => (
                  <FilterChip
                    key={quickSubject}
                    active={subjectDraft === quickSubject}
                    onClick={() => {
                      setSubjectDraft(quickSubject);
                      clearFieldError('subject');
                    }}
                    className="text-xs sm:text-sm"
                  >
                    {quickSubject}
                  </FilterChip>
                ))}
              </div>
              <p className="mb-2 text-xs text-slate-400">
                Current intent: <span className="text-amber-300">{intentDraft || 'general'}</span>
              </p>
              <input 
                type="text" 
                id="subject" 
                name="subject"
                value={subjectDraft}
                className={`neural-input p-3 text-base ${
                  fieldErrors.subject 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'focus:ring-blue-500'
                }`}
                onChange={(e) => {
                  setSubjectDraft(e.target.value);
                  clearFieldError('subject');
                }}
                placeholder="What can I help you with?"
                aria-invalid={!!fieldErrors.subject}
                aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
              />
              {fieldErrors.subject && (
                <motion.p 
                  id="subject-error"
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                >
                  {fieldErrors.subject}
                </motion.p>
              )}
              {!fieldErrors.subject && subjectDraft.trim().length > 0 && subjectDraft.trim().length < 3 && (
                <p className="mt-2 text-xs text-amber-300">A slightly more specific subject helps route your message faster.</p>
              )}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label htmlFor="message" className="block text-base sm:text-lg font-medium text-slate-100 mb-2">
                Message *
              </label>
              <textarea 
                id="message" 
                name="message" 
                rows={5}
                value={messageDraft}
                className={`neural-input p-3 text-base resize-y ${
                  fieldErrors.message 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'focus:ring-blue-500'
                }`}
                onChange={(e) => {
                  setMessageDraft(e.target.value);
                  clearFieldError('message');
                }}
                placeholder="Share your context, goals, and timeline."
                aria-invalid={!!fieldErrors.message}
                aria-describedby={fieldErrors.message ? 'message-error' : undefined}
              />
              <div className="mt-1 text-right text-[11px] sm:text-xs text-slate-400">
                {messageDraft.length} characters
              </div>
              {!fieldErrors.message && messageDraft.trim().length > 0 && messageDraft.trim().length < 20 && (
                <p className="mt-2 text-xs text-amber-300">A few more details will make the reply much more useful.</p>
              )}
              {fieldErrors.message && (
                <motion.p 
                  id="message-error"
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                >
                  {fieldErrors.message}
                </motion.p>
              )}
            </motion.div>
            
            <motion.button 
              type="submit" 
              disabled={status === 'loading' || !csrfToken}
              className="w-full py-4 px-6 rounded-lg neural-control-btn-primary text-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              variants={itemVariants}
              whileHover={{ scale: status === 'loading' ? 1 : 1.02 }}
              whileTap={{ scale: status === 'loading' ? 1 : 0.98 }}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    className="w-5 h-5 border-2 border-amber-900/60 border-t-amber-900 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Sending message...
                </span>
              ) : (
                'Send'
              )}
            </motion.button>
            
            {message && (
              <motion.div 
                role="alert" 
                aria-live="polite"
                className={`mt-6 p-4 rounded-lg text-center text-lg font-medium ${
                  status === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                    : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {message}
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">Conversation queued successfully</p>
                    <p className="mt-1 text-xs text-slate-300">
                      {lastSentAt ? `Sent at ${new Date(lastSentAt).toLocaleTimeString()}.` : 'Your message is on the way.'} Typical follow-up is within 24-48 hours.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus('idle');
                      setMessage('');
                      setLastSentAt(null);
                      if (typeof window !== 'undefined') {
                        window.localStorage.removeItem(CONTACT_SUCCESS_KEY);
                      }
                    }}
                    className="neural-control-btn text-xs self-start sm:self-auto"
                  >
                    Start another message
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="neural-pill-intro">Next step: watch your inbox</span>
                  <span className="neural-pill-intro">Include links or docs in your reply if needed</span>
                </div>
              </motion.div>
            )}
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
} 
