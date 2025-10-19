/**
 * BNBCard Component Test Suite
 * Tests for card variants, headers, and styling
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BNBCard } from '../../../src/frontend/components/ui/bnb/BNBCard';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('BNBCard Component', () => {
  describe('Basic Rendering', () => {
    test('should render children correctly', () => {
      render(<BNBCard>Card Content</BNBCard>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    test('should render with default variant', () => {
      const { container } = render(<BNBCard>Default</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[#1E2026]');
    });

    test('should render with gradient variant', () => {
      const { container } = render(<BNBCard variant="gradient">Gradient</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-gradient-to-br');
    });

    test('should render with dark variant', () => {
      const { container } = render(<BNBCard variant="dark">Dark</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[#14151A]');
    });
  });

  describe('Header Content', () => {
    test('should render title', () => {
      render(<BNBCard title="Card Title">Content</BNBCard>);
      expect(screen.getByText('Card Title')).toBeInTheDocument();
    });

    test('should render subtitle', () => {
      render(<BNBCard subtitle="Card Subtitle">Content</BNBCard>);
      expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
    });

    test('should render title and subtitle together', () => {
      render(
        <BNBCard title="Title" subtitle="Subtitle">
          Content
        </BNBCard>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });

    test('should render header action', () => {
      render(
        <BNBCard headerAction={<button>Action</button>}>Content</BNBCard>
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    test('should not render header section when no header props provided', () => {
      const { container } = render(<BNBCard>Content Only</BNBCard>);
      expect(container.querySelectorAll('.mb-6')).toHaveLength(0);
    });
  });

  describe('Padding Variants', () => {
    test('should apply small padding', () => {
      const { container } = render(<BNBCard padding="sm">Content</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    test('should apply medium padding by default', () => {
      const { container } = render(<BNBCard>Content</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });

    test('should apply large padding', () => {
      const { container } = render(<BNBCard padding="lg">Content</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-8');
    });
  });

  describe('Hover Effects', () => {
    test('should not have hover effects by default', () => {
      const { container } = render(<BNBCard>Content</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain('hover:border-[#F3BA2F]/50');
    });

    test('should apply hover effects when hover prop is true', () => {
      const { container } = render(<BNBCard hover>Content</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:border-[#F3BA2F]/50');
      expect(card).toHaveClass('hover:shadow-lg');
    });
  });

  describe('Custom Styling', () => {
    test('should accept custom className', () => {
      const { container } = render(
        <BNBCard className="custom-class">Content</BNBCard>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    test('should always have rounded corners', () => {
      const { container } = render(<BNBCard>Content</BNBCard>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-2xl');
    });
  });

  describe('Complex Content', () => {
    test('should render complex children', () => {
      render(
        <BNBCard title="Complex Card">
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <button>Button</button>
          </div>
        </BNBCard>
      );

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
      expect(screen.getByText('Button')).toBeInTheDocument();
    });
  });
});
