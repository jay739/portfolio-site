import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import ContactSection from '../ContactSection';
import * as useCsrfModule from '@/hooks/useCsrf';

// Mock useCsrf hook
jest.mock('@/hooks/useCsrf');

describe('ContactSection', () => {
  const mockFetchWithCsrf = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(useCsrfModule, 'useCsrf').mockReturnValue({ fetchWithCsrf: mockFetchWithCsrf });
  });

  it('renders the contact form', async () => {
    await act(async () => {
      render(<ContactSection />);
    });
    expect(screen.getByRole('form', { name: /contact form/i })).toBeInTheDocument();
  });

  it('handles successful form submission', async () => {
    mockFetchWithCsrf.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Success' }),
    });

    await act(async () => {
      render(<ContactSection />);
    });

    // Fill out the form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /contact form/i }));
    });

    await waitFor(() => {
      expect(mockFetchWithCsrf).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          message: 'Test message',
        }),
      });
    }, { timeout: 10000 });
  }, 15000);

  it('handles form submission error', async () => {
    mockFetchWithCsrf.mockRejectedValueOnce(new Error('Failed to send message'));

    await act(async () => {
      render(<ContactSection />);
    });

    // Fill out the form
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: 'Test User' },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/message/i), {
        target: { value: 'Test message' },
      });
    });

    // Submit the form
    await act(async () => {
      fireEvent.submit(screen.getByRole('form', { name: /contact form/i }));
    });

    await waitFor(() => {
      expect(mockFetchWithCsrf).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          message: 'Test message',
        }),
      });
    }, { timeout: 10000 });
  }, 15000);
}); 