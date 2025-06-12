import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { useTheme } from 'next-themes';
import NavBar from '../NavBar';
import { useSound } from '@/components/providers/SoundProvider';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock sound provider
jest.mock('@/components/providers/SoundProvider', () => ({
  useSound: jest.fn(),
}));

describe('NavBar', () => {
  const mockSetTheme = jest.fn();
  const mockToggleSound = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock useTheme hook
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    // Mock useSound hook
    (useSound as jest.Mock).mockReturnValue({
      soundEnabled: true,
      toggleSound: mockToggleSound,
    });

    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();

    // Mock getElementById
    document.getElementById = jest.fn((id) => ({
      offsetTop: 100,
      offsetHeight: 100,
      scrollIntoView: jest.fn(),
    }));
  });

  it('renders navigation links', async () => {
    await act(async () => {
      render(<NavBar />);
    });
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Jayakrishna Konda')).toBeInTheDocument();
    
    // Check for menu items in desktop menu
    const desktopMenu = screen.getByRole('menubar');
    const desktopMenuItems = within(desktopMenu).getAllByRole('menuitem');
    expect(desktopMenuItems).toHaveLength(9); // 9 items in desktop menu
    
    // Check specific menu items in desktop menu
    const desktopWelcomeItem = within(desktopMenu).getByRole('menuitem', { name: 'Welcome' });
    expect(desktopWelcomeItem).toBeInTheDocument();
    
    const desktopContactItem = within(desktopMenu).getByRole('menuitem', { name: 'Contact' });
    expect(desktopContactItem).toBeInTheDocument();
  });

  it('handles theme toggle in light mode', async () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });

    await act(async () => {
      render(<NavBar />);
    });

    const themeButton = screen.getByRole('button', { name: /toggle theme to dark mode/i });
    await act(async () => {
      fireEvent.click(themeButton);
    });
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('handles theme toggle in dark mode', async () => {
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });

    await act(async () => {
      render(<NavBar />);
    });

    const themeButton = screen.getByRole('button', { name: /toggle theme to light mode/i });
    await act(async () => {
      fireEvent.click(themeButton);
    });
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('handles sound toggle when sound is on', async () => {
    (useSound as jest.Mock).mockReturnValue({
      soundEnabled: true,
      toggleSound: mockToggleSound,
    });

    await act(async () => {
      render(<NavBar />);
    });

    const soundButton = screen.getByRole('button', { name: /mute sound/i });
    await act(async () => {
      fireEvent.click(soundButton);
    });
    expect(mockToggleSound).toHaveBeenCalled();
  });

  it('handles sound toggle when sound is off', async () => {
    (useSound as jest.Mock).mockReturnValue({
      soundEnabled: false,
      toggleSound: mockToggleSound,
    });

    await act(async () => {
      render(<NavBar />);
    });

    const soundButton = screen.getByRole('button', { name: /unmute sound/i });
    await act(async () => {
      fireEvent.click(soundButton);
    });
    expect(mockToggleSound).toHaveBeenCalled();
  });

  it('toggles mobile menu when menu button is clicked', async () => {
    await act(async () => {
      render(<NavBar />);
    });

    const mobileMenu = screen.getByRole('menu', { name: /mobile navigation/i });
    expect(mobileMenu).toHaveClass('hidden');

    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await act(async () => {
      fireEvent.click(menuButton);
    });

    expect(mobileMenu).not.toHaveClass('hidden');

    await act(async () => {
      fireEvent.click(menuButton);
    });

    expect(mobileMenu).toHaveClass('hidden');
  });

  it('updates active section on scroll', () => {
    render(<NavBar />);

    // Simulate scroll
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    // Check if the first section is active in desktop menu
    const desktopMenu = screen.getByRole('menubar');
    const desktopWelcomeItem = within(desktopMenu).getByRole('menuitem', { name: 'Welcome' });
    expect(desktopWelcomeItem).toHaveClass('text-accent-foreground');
  });

  it('closes mobile menu when a menu item is clicked', async () => {
    await act(async () => {
      render(<NavBar />);
    });

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    await act(async () => {
      fireEvent.click(menuButton);
    });

    // Click a menu item
    const mobileMenu = screen.getByRole('menu');
    const menuItem = within(mobileMenu).getByRole('menuitem', { name: 'Welcome' });
    await act(async () => {
      fireEvent.click(menuItem);
    });

    // Menu should be closed
    expect(mobileMenu).toHaveClass('hidden');
  });
}); 