import { render, screen, fireEvent, act } from '@testing-library/react';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import Hero from '../Hero';

// Mock next/dynamic
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => (
    <a href="https://homarr.jay739.dev" aria-label="Access Home Server">
      🏠 Access Home Server
    </a>
  );
  DynamicComponent.displayName = 'ConfettiButton';
  return DynamicComponent;
});

// Mock useReducedMotion hook
jest.mock('@/lib/hooks/useReducedMotion', () => ({
  useReducedMotion: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, ...validProps } = props;
      return <div {...validProps}>{children}</div>;
    },
  },
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
    
    // Mock window.fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ activeUsers: 10 }),
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
    document.getElementById = jest.fn((id) => ({
      offsetTop: 100,
      offsetHeight: 100,
      scrollIntoView: mockScrollIntoView,
    }));
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
    expect(screen.getByText(/full stack developer.*devops engineer/i)).toBeInTheDocument();
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

    // Check for main action buttons
    expect(screen.getByRole('link', { name: /access home server/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download resume/i })).toBeInTheDocument();
  });

  it('fetches and displays visitor count', async () => {
    await act(async () => {
      render(<Hero />);
    });
    
    // Wait for the visitor count to be fetched and displayed
    expect(await screen.findByText(/10 VISITORS/)).toBeInTheDocument();
  });

  it('displays current time', async () => {
    await act(async () => {
      render(<Hero />);
    });
    
    // Check if time is displayed
    expect(screen.getByText(mockDateString)).toBeInTheDocument();
  });

  it('scrolls to contact section when contact button is clicked', async () => {
    await act(async () => {
      render(<Hero />);
    });

    const contactButton = screen.getByRole('button', { name: /scroll to contact section/i });
    expect(contactButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(contactButton);
    });

    expect(mockScrollIntoView).toHaveBeenCalled();
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch to throw error
    global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;

    await act(async () => {
      render(<Hero />);
    });
    
    // Should show 0 visitors when fetch fails
    expect(await screen.findByText(/0 VISITORS/)).toBeInTheDocument();
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