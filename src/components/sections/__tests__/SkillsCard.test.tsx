import { render, screen } from '@testing-library/react';
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
    div: (allProps: { children?: React.ReactNode } & Record<string, unknown>) => {
      const { children, ...validProps } = allProps;
      delete validProps.initial;
      delete validProps.animate;
      delete validProps.transition;
      return <div {...validProps as React.HTMLAttributes<HTMLDivElement>}>{children}</div>;
    },
    span: (allProps: { children?: React.ReactNode } & Record<string, unknown>) => {
      const { children, ...validProps } = allProps;
      delete validProps.initial;
      delete validProps.animate;
      delete validProps.transition;
      return <span {...validProps as React.HTMLAttributes<HTMLSpanElement>}>{children}</span>;
    },
  },
}));

describe('SkillsCard', () => {
  const mockSkills = [
    { name: 'React', url: 'https://reactjs.org' },
    { name: 'TypeScript', url: 'https://typescriptlang.org' },
    { name: 'Node.js', url: 'https://nodejs.org' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });

    (getIconData as jest.Mock).mockImplementation((skillName) => ({
      label: skillName,
      url: `https://example.com/${skillName.toLowerCase()}`,
    }));
  });

  it('renders the title and initial empty state', () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('renders all skills as links after mount', () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);

    for (const skill of mockSkills) {
      const link = screen.getByRole('link', { name: skill.name });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', skill.url);
    }
  });

  it('renders skill names in spans', () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);

    for (const skill of mockSkills) {
      expect(screen.getByText(skill.name)).toBeInTheDocument();
    }
  });

  it('renders skills with external link attributes', () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);

    const firstLink = screen.getByRole('link', { name: mockSkills[0].name });
    expect(firstLink).toHaveAttribute('target', '_blank');
    expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles custom delay prop', () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} delay={1000} />);
    expect(screen.getByRole('heading', { name: 'Frontend' })).toBeInTheDocument();
  });

  it('renders skill icons with correct links', () => {
    render(<SkillsCard title="Frontend" skills={mockSkills} />);

    const iconLink = screen.getByRole('link', { name: mockSkills[0].name });
    expect(iconLink).toHaveAttribute('href', mockSkills[0].url);
    expect(iconLink).toHaveAttribute('target', '_blank');
    expect(iconLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('handles empty skills array', () => {
    render(<SkillsCard title="Frontend" skills={[]} />);
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('unmounts cleanly without errors', () => {
    const { unmount } = render(<SkillsCard title="Frontend" skills={mockSkills} />);
    unmount();
  });
}); 