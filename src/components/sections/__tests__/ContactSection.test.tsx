import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ContactSection from '../ContactSection';
import * as useCsrfModule from '@/hooks/useCsrf';

// Mock useCsrf hook
jest.mock('@/hooks/useCsrf');

describe('ContactSection', () => {
  const mockFetchWithCsrf = jest.fn();
  const validMessage = 'Test message with enough context to pass validation.';

  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    jest.spyOn(useCsrfModule, 'useCsrf').mockReturnValue({
      csrfToken: 'mock-csrf-token',
      fetchWithCsrf: mockFetchWithCsrf
    });
  });

  /** Fill the form fields through React-controlled inputs so state and form data stay aligned. */
  async function fillForm(opts: { name: string; email: string; subject: string; message: string }) {
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: opts.name } });
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: opts.email } });
      fireEvent.change(screen.getByLabelText(/subject/i), { target: { value: opts.subject } });
      fireEvent.change(screen.getByLabelText(/message/i), { target: { value: opts.message } });
    });
  }

  it('renders the contact form', async () => {
    await act(async () => {
      render(<ContactSection />);
    });
    expect(screen.getByRole('form', { name: /contact form/i })).toBeInTheDocument();
  });

  it('handles successful form submission', async () => {
    mockFetchWithCsrf.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Message sent!' }),
    });

    await act(async () => {
      render(<ContactSection />);
    });

    await fillForm({ name: 'Test User', email: 'test@example.com', subject: 'Test Subject', message: validMessage });

    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /contact form/i }));
    });

    await waitFor(() => {
      expect(mockFetchWithCsrf).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: '',
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: validMessage,
        }),
      });
    }, { timeout: 10000 });
  }, 15000);

  it('handles form submission error', async () => {
    mockFetchWithCsrf.mockRejectedValueOnce(new Error('Failed to send message'));

    await act(async () => {
      render(<ContactSection />);
    });

    await fillForm({ name: 'Test User', email: 'test@example.com', subject: 'Test Subject', message: validMessage });

    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /contact form/i }));
    });

    await waitFor(() => {
      expect(mockFetchWithCsrf).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: '',
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: validMessage,
        }),
      });
    }, { timeout: 10000 });
  }, 15000);
});
