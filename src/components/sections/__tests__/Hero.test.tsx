import { render, screen, fireEvent, act } from '@testing-library/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import Hero from '../Hero';

// Mock useReducedMotion hook
jest.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn(),
}));


describe('Hero', () => {
  const mockDate = new Date('2024-01-01T12:00:00');
  const mockDateString = mockDate.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const mockScrollIntoView = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Clear sessionStorage so visitor cache from previous tests doesn't bleed through
    sessionStorage.clear();
    
    // Mock window.fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ 
          totalVisitors: 10,
          ordinalText: "10th",
          message: "You're the 10th visitor!",
          lastUpdated: mockDate.toISOString()
        }),
      })
    ) as jest.Mock;

    // Mock useReducedMotion hook
    (useReducedMotion as jest.Mock).mockReturnValue(false);

    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;

    // Mock Date
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor() {
        super();
        return mockDate;
      }
      static now() {
        return mockDate.getTime();
      }
    } as DateConstructor;

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = mockScrollIntoView;

    // Mock getElementById
    document.getElementById = jest.fn(() => null) as typeof document.getElementById;
  });

  afterEach(() => {
    // Restore Date
    global.Date = Date;
  });

  it('renders hero section with main content', async () => {
    await act(async () => {
      render(<Hero />);
    });
    
    // Check for main content
    expect(screen.getByRole('heading', { name: /jayakrishna konda/i })).toBeInTheDocument();
    expect(
      screen.getByText(/ML\/AI Engineer building production RAG pipelines, LLM systems/i)
    ).toBeInTheDocument();
  });

  it('renders social links', async () => {
    await act(async () => {
      render(<Hero />);
    });
    
    // Check for social links
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /email/i })).toBeInTheDocument();
  });

  it('renders main action buttons', async () => {
    await act(async () => {
      render(<Hero />);
    });

    expect(screen.getByRole('link', { name: /view resume/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to contact page/i })).toBeInTheDocument();
  });

  it('fetches and displays visitor count', async () => {
    await act(async () => {
      render(<Hero />);
    });
    
    // Wait for the visitor count message to be fetched and displayed above the name
    expect(await screen.findByText(/You're the 10th visitor!/)).toBeInTheDocument();
  });

  it('renders typewriter role display', async () => {
    await act(async () => {
      render(<Hero />);
    });

    // The typewriter role area has role="status" and aria-label="Current role"
    expect(screen.getByRole('status', { name: /current role/i })).toBeInTheDocument();
  });

  it('contact link points to /contact page', async () => {
    await act(async () => {
      render(<Hero />);
    });

    const contactLink = screen.getByRole('link', { name: /go to contact page/i });
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch to throw error
    global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;

    await act(async () => {
      render(<Hero />);
    });

    // On error the component sets 'Welcome visitor!' as the fallback message
    expect(await screen.findByText(/Welcome visitor!/)).toBeInTheDocument();
  });

  it('handles reduced motion preference', async () => {
    // Mock reduced motion preference
    (useReducedMotion as jest.Mock).mockReturnValue(true);

    await act(async () => {
      render(<Hero />);
    });
    
    // The component should render without motion animations
    const heroSection = screen.getByRole('banner');
    expect(heroSection).toBeInTheDocument();
  });
}); 
