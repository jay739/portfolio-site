import { render, screen, within, act } from '@testing-library/react';
import { useTheme } from 'next-themes';
import NavBar from '../NavBar';

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  usePathname: jest.fn(() => '/'),
}));

describe('NavBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: jest.fn(),
      resolvedTheme: 'dark',
    });

    const mockIntersectionObserver = jest.fn().mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
    Element.prototype.scrollIntoView = jest.fn();
    document.getElementById = jest.fn(() => null) as typeof document.getElementById;
  });

  it('renders navigation with brand name', async () => {
    await act(async () => { render(<NavBar />); });
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Jayakrishna Konda')).toBeInTheDocument();
  });

  it('renders desktop menu with all sections', async () => {
    await act(async () => { render(<NavBar />); });
    const desktopMenu = screen.getByRole('menubar');
    const items = within(desktopMenu).getAllByRole('menuitem');
    expect(items.length).toBeGreaterThan(0);
    expect(within(desktopMenu).getByRole('menuitem', { name: 'Contact' })).toBeInTheDocument();
    expect(within(desktopMenu).getByRole('menuitem', { name: 'Blog' })).toBeInTheDocument();
  });

  it('renders mobile menu toggle button', async () => {
    await act(async () => { render(<NavBar />); });
    expect(screen.getByRole('button', { name: /toggle menu/i })).toBeInTheDocument();
  });
});
