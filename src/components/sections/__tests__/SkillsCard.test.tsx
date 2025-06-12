import { render, screen, act, waitFor } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { SkillsCard } from '../SkillsCard';
import { getIconData } from '@/lib/icons';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

// Mock getIconData
jest.mock('@/lib/icons', () => ({
  getIconData: jest.fn(),
  DynamicIcon: () => <span data-testid="mock-icon">🔧</span>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, transition, ...validProps } = props;
      return <div {...validProps}>{children}</div>;
    },
    span: ({ children, ...props }: any) => {
      const { initial, animate, transition, ...validProps } = props;
      return <span {...validProps}>{children}</span>;
    },
  },
}));

describe('SkillsCard', () => {
  const mockSkills = ['React', 'TypeScript', 'Node.js'];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock useTheme hook
    (useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
    });

    // Mock getIconData
    (getIconData as jest.Mock).mockImplementation((skill) => ({
      label: skill,
      url: `https://example.com/${skill.toLowerCase()}`,
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the title and initial empty state', async () => {
    await act(async () => {
      render(<SkillsCard title="Frontend" skills={mockSkills} />);
    });
    
    // Check title
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('types out skills one by one', async () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);

    // Initially mounted
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    // Check first skill typing
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    // Wait for first skill to start typing
    await waitFor(() => {
      const spans = screen.getAllByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && content.length > 0;
      });
      expect(spans.length).toBeGreaterThan(0);
    });

    // Verify typing cursor is present
    const cursor = screen.getByText('|');
    expect(cursor).toHaveClass('animate-pulse');

    // Complete typing first skill
    await act(async () => {
      for (let i = 0; i < mockSkills[0].length - 1; i++) {
        jest.advanceTimersByTime(50);
      }
    });

    // Wait for first skill to be complete
    await waitFor(() => {
      const spans = screen.getAllByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && content === mockSkills[0];
      });
      expect(spans.length).toBeGreaterThan(0);
    });

    // Wait for delay between skills
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for second skill to start typing
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    // Complete typing second skill
    await act(async () => {
      for (let i = 0; i < mockSkills[1].length; i++) {
        jest.advanceTimersByTime(50);
      }
    });

    // Wait for final state
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for both skills to be present
    await waitFor(() => {
      const spans = screen.getAllByText((content, element) => {
        return element.tagName.toLowerCase() === 'span' && content.trim() !== '' && content !== '|';
      });
      const skillTexts = spans.map(span => span.textContent);
      expect(skillTexts).toContain(mockSkills[0]);
      expect(skillTexts).toContain(mockSkills[1]);
    });
  });

  it('shows typing cursor for current skill', async () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);

    // Initially mounted
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    // Check for cursor while typing first skill
    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.getByText('|')).toHaveClass('animate-pulse');
  });

  it('applies correct styling to active and completed skills', async () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);

    // Initially mounted
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    // Type out first skill
    for (let i = 1; i <= mockSkills[0].length; i++) {
      await act(async () => {
        jest.advanceTimersByTime(50);
      });
    }

    // Wait for delay between skills
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    // Find the span element containing the completed skill
    await waitFor(() => {
      const spans = screen.getAllByText(/.+/);
      const skillElement = spans.find(span => span.textContent === mockSkills[0]);
      expect(skillElement?.closest('.bg-muted')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('handles custom delay prop', () => {
    const delay = 1000;
    render(<SkillsCard title="Frontend" skills={mockSkills} delay={delay} />);
    
    const container = screen.getByRole('heading', { name: 'Frontend' }).parentElement;
    expect(container).toBeInTheDocument();
  });

  it('renders skill icons with correct links', async () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);

    // Initially mounted
    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    // Type out first skill
    for (let i = 1; i <= mockSkills[0].length; i++) {
      await act(async () => {
        jest.advanceTimersByTime(50);
      });
    }

    // Check icon link
    const iconLink = screen.getByRole('link', { name: mockSkills[0] });
    expect(iconLink).toHaveAttribute('href', `https://example.com/${mockSkills[0].toLowerCase()}`);
    expect(iconLink).toHaveAttribute('target', '_blank');
    expect(iconLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles empty skills array', () => {
    render(<SkillsCard title="Frontend" skills={[]} />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('handles unmounting during typing animation', async () => {
    const { unmount } = render(<SkillsCard title="Frontend" skills={mockSkills} />);

    // Start typing
    await act(async () => {
      jest.advanceTimersByTime(50);
    });

    // Unmount during typing
    unmount();

    // Should not throw any errors
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
  });
}); 