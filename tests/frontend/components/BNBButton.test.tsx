/**
 * BNBButton Component Test Suite
 * Tests for button variants, states, and interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BNBButton } from '../../../src/frontend/components/ui/bnb/BNBButton';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
}));

describe('BNBButton Component', () => {
  describe('Rendering', () => {
    test('should render children correctly', () => {
      render(<BNBButton>Click Me</BNBButton>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    test('should render with primary variant by default', () => {
      render(<BNBButton>Primary</BNBButton>);
      const button = screen.getByText('Primary');
      expect(button).toHaveClass('from-[#F3BA2F]');
    });

    test('should render with secondary variant', () => {
      render(<BNBButton variant="secondary">Secondary</BNBButton>);
      const button = screen.getByText('Secondary');
      expect(button).toHaveClass('bg-[#1E2026]');
    });

    test('should render with outline variant', () => {
      render(<BNBButton variant="outline">Outline</BNBButton>);
      const button = screen.getByText('Outline');
      expect(button).toHaveClass('border-2');
      expect(button).toHaveClass('border-[#F3BA2F]');
    });

    test('should render with danger variant', () => {
      render(<BNBButton variant="danger">Danger</BNBButton>);
      const button = screen.getByText('Danger');
      expect(button).toHaveClass('bg-[#F6465D]');
    });
  });

  describe('Sizes', () => {
    test('should render small size', () => {
      render(<BNBButton size="sm">Small</BNBButton>);
      const button = screen.getByText('Small');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    test('should render medium size by default', () => {
      render(<BNBButton>Medium</BNBButton>);
      const button = screen.getByText('Medium');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
    });

    test('should render large size', () => {
      render(<BNBButton size="lg">Large</BNBButton>);
      const button = screen.getByText('Large');
      expect(button).toHaveClass('px-8');
      expect(button).toHaveClass('py-4');
    });
  });

  describe('States', () => {
    test('should handle click events', () => {
      const handleClick = jest.fn();
      render(<BNBButton onClick={handleClick}>Click</BNBButton>);

      const button = screen.getByText('Click');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('should be disabled when disabled prop is true', () => {
      const handleClick = jest.fn();
      render(
        <BNBButton disabled onClick={handleClick}>
          Disabled
        </BNBButton>
      );

      const button = screen.getByText('Disabled');
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('should show loading state', () => {
      render(<BNBButton loading>Loading</BNBButton>);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    test('should be disabled when loading', () => {
      const handleClick = jest.fn();
      render(
        <BNBButton loading onClick={handleClick}>
          Loading
        </BNBButton>
      );

      const button = screen.getByText('Processing...');
      expect(button.closest('button')).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    test('should render with full width', () => {
      render(<BNBButton fullWidth>Full Width</BNBButton>);
      const button = screen.getByText('Full Width');
      expect(button).toHaveClass('w-full');
    });
  });

  describe('Custom Styling', () => {
    test('should accept custom className', () => {
      render(<BNBButton className="custom-class">Custom</BNBButton>);
      const button = screen.getByText('Custom');
      expect(button).toHaveClass('custom-class');
    });

    test('should merge custom className with existing classes', () => {
      render(
        <BNBButton variant="primary" className="custom-class">
          Merged
        </BNBButton>
      );
      const button = screen.getByText('Merged');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('from-[#F3BA2F]');
    });
  });

  describe('Accessibility', () => {
    test('should have button role', () => {
      render(<BNBButton>Accessible</BNBButton>);
      const button = screen.getByRole('button', { name: 'Accessible' });
      expect(button).toBeInTheDocument();
    });

    test('should have proper disabled attribute', () => {
      render(<BNBButton disabled>Disabled</BNBButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });
  });
});
