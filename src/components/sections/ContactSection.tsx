'use client';

import { useRef, useState } from 'react';
import { useCsrf } from '@/hooks/useCsrf';
import { motion } from 'framer-motion';
import FilterChip from '@/components/ui/FilterChip';

interface ValidationError {
  field: string;
  message: string;
}

export default function ContactSection() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [subjectDraft, setSubjectDraft] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const { csrfToken, fetchWithCsrf } = useCsrf();

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
    setStatus('loading');
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
        setMessage(responseData.message || 'Message sent! I will get back to you soon.');
        form.reset();
        setSubjectDraft('');
        setMessageDraft('');
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

  const quickSubjects = ['Project Collaboration', 'AI/ML Consulting', 'Home Server Setup', 'General Inquiry'];

  return (
    <section className="relative py-16 px-2 sm:px-6 w-full overflow-hidden" id="contact">
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
          
          <motion.form 
            ref={formRef} 
            onSubmit={handleSubmit} 
            className="space-y-5 sm:space-y-6 max-w-4xl mx-auto" 
            role="form" 
            aria-label="Contact form"
            variants={itemVariants}
            noValidate // Disable browser validation to use server-side only
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-base sm:text-lg font-medium text-slate-100 mb-2">
                  Name *
                </label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  className={`neural-input p-3 text-base ${
                    fieldErrors.name 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'focus:ring-blue-500'
                  }`}
                  onChange={() => clearFieldError('name')}
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
                  className={`neural-input p-3 text-base ${
                    fieldErrors.email 
                      ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'focus:ring-blue-500'
                  }`}
                  onChange={() => clearFieldError('email')}
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
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
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
          </motion.form>
        </motion.div>
      </div>
    </section>
  );
} 