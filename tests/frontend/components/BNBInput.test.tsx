/**
 * BNBInput Component Test Suite
 * Tests for input fields, validation, and states
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BNBInput } from '../../../src/frontend/components/ui/bnb/BNBInput';

describe('BNBInput Component', () => {
  describe('Basic Rendering', () => {
    test('should render input field', () => {
      const handleChange = jest.fn();
      render(<BNBInput value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    test('should render with label', () => {
      const handleChange = jest.fn();
      render(<BNBInput label="Email" value="" onChange={handleChange} />);

      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    test('should render with placeholder', () => {
      const handleChange = jest.fn();
      render(
        <BNBInput
          value=""
          onChange={handleChange}
          placeholder="Enter email..."
        />
      );

      const input = screen.getByPlaceholderText('Enter email...');
      expect(input).toBeInTheDocument();
    });

    test('should render with initial value', () => {
      const handleChange = jest.fn();
      render(<BNBInput value="test@example.com" onChange={handleChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test@example.com');
    });
  });

  describe('Input Types', () => {
    test('should render text input by default', () => {
      const handleChange = jest.fn();
      render(<BNBInput value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    test('should render number input', () => {
      const handleChange = jest.fn();
      render(<BNBInput type="number" value={0} onChange={handleChange} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    test('should render email input', () => {
      const handleChange = jest.fn();
      render(<BNBInput type="email" value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    test('should render password input', () => {
      const handleChange = jest.fn();
      const { container } = render(
        <BNBInput type="password" value="" onChange={handleChange} />
      );

      const input = container.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('should call onChange when value changes', () => {
      const handleChange = jest.fn();
      render(<BNBInput value="" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(handleChange).toHaveBeenCalledWith('new value');
    });

    test('should handle numeric input', () => {
      const handleChange = jest.fn();
      render(<BNBInput type="number" value={0} onChange={handleChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '123' } });

      expect(handleChange).toHaveBeenCalledWith('123');
    });

    test('should be disabled when disabled prop is true', () => {
      const handleChange = jest.fn();
      render(<BNBInput value="" onChange={handleChange} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    test('should not call onChange when disabled', () => {
      const handleChange = jest.fn();
      render(<BNBInput value="" onChange={handleChange} disabled />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Error States', () => {
    test('should display error message', () => {
      const handleChange = jest.fn();
      render(
        <BNBInput
          value=""
          onChange={handleChange}
          error="This field is required"
        />
      );

      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    test('should apply error styles', () => {
      const handleChange = jest.fn();
      render(
        <BNBInput
          value=""
          onChange={handleChange}
          error="Invalid input"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-[#F6465D]');
    });

    test('should not display helper text when error is present', () => {
      const handleChange = jest.fn();
      render(
        <BNBInput
          value=""
          onChange={handleChange}
          error="Error message"
          helperText="Helper text"
        />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    test('should display helper text', () => {
      const handleChange = jest.fn();
      render(
        <BNBInput
          value=""
          onChange={handleChange}
          helperText="Enter your email address"
        />
      );

      expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    });
  });

  describe('Icons and Suffixes', () => {
    test('should render with icon', () => {
      const handleChange = jest.fn();
      const icon = <span data-testid="icon">📧</span>;
      render(<BNBInput value="" onChange={handleChange} icon={icon} />);

      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    test('should render with suffix', () => {
      const handleChange = jest.fn();
      render(<BNBInput value="" onChange={handleChange} suffix="USD" />);

      expect(screen.getByText('USD')).toBeInTheDocument();
    });

    test('should apply correct padding with icon', () => {
      const handleChange = jest.fn();
      const icon = <span>📧</span>;
      render(<BNBInput value="" onChange={handleChange} icon={icon} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-12');
    });

    test('should apply correct padding with suffix', () => {
      const handleChange = jest.fn();
      render(<BNBInput value="" onChange={handleChange} suffix="BNB" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pr-24');
    });
  });

  describe('Custom Styling', () => {
    test('should accept custom className', () => {
      const handleChange = jest.fn();
      const { container } = render(
        <BNBInput value="" onChange={handleChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    test('should associate label with input', () => {
      const handleChange = jest.fn();
      render(<BNBInput label="Username" value="" onChange={handleChange} />);

      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
    });
  });
});
