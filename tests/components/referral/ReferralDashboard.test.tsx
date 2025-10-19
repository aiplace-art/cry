/**
 * ReferralDashboard Component Tests
 * Unit and integration tests for the referral dashboard
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ReferralDashboard } from '../../../src/frontend/components/referral/ReferralDashboard';
import * as useReferralAPI from '../../../src/frontend/hooks/useReferralAPI';

// Mock the custom hooks
jest.mock('../../../src/frontend/hooks/useReferralAPI');

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock QR code generation
jest.mock('../../../src/frontend/utils/helpers', () => ({
  formatCurrency: (value: number) => `$${value.toLocaleString()}`,
  formatNumber: (value: number) => value.toLocaleString(),
  copyToClipboard: jest.fn((text: string) => Promise.resolve(true)),
  generateQRCode: jest.fn((url: string) => Promise.resolve('data:image/png;base64,mockQRCode')),
  downloadQRCode: jest.fn(),
  shortenAddress: (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`,
}));

describe('ReferralDashboard Component', () => {
  const mockStats = {
    totalReferrals: 15,
    totalEarnedUSDT: 750,
    totalEarnedHYPE: 9375000,
    pendingRewards: 150,
    totalVolume: 15000,
    activeReferrals: 12,
  };

  const mockLink = {
    code: 'HYPE123ABC',
    url: 'https://hypeai.io/join?ref=HYPE123ABC',
    clicks: 234,
    conversions: 15,
  };

  const mockUserId = 'user-123';
  const mockWallet = '0x1234567890abcdef1234567890abcdef12345678';

  beforeEach(() => {
    jest.clearAllMocks();

    (useReferralAPI.useReferralStats as jest.Mock).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    (useReferralAPI.useReferralLink as jest.Mock).mockReturnValue({
      link: mockLink,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  describe('Rendering', () => {
    it('should render dashboard with all stats', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText('Referral Dashboard')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument(); // Total Referrals
      expect(screen.getByText('$750')).toBeInTheDocument(); // Total Earned USDT
      expect(screen.getByText('9,375,000')).toBeInTheDocument(); // Total Earned HYPE
      expect(screen.getByText('$150')).toBeInTheDocument(); // Pending Rewards
    });

    it('should display shortened wallet address', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText(/Wallet:/)).toBeInTheDocument();
      expect(screen.getByText(/0x1234...5678/)).toBeInTheDocument();
    });

    it('should display email instead of wallet if provided', () => {
      const mockEmail = 'test@example.com';
      render(
        <ReferralDashboard
          userId={mockUserId}
          userEmail={mockEmail}
        />
      );

      expect(screen.getByText(/Email:/)).toBeInTheDocument();
      expect(screen.getByText(mockEmail)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      (useReferralAPI.useReferralStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
    });
  });

  describe('Referral Link Section', () => {
    it('should display referral code', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const codeInput = screen.getByDisplayValue('HYPE123ABC');
      expect(codeInput).toBeInTheDocument();
      expect(codeInput).toHaveAttribute('readonly');
    });

    it('should display full referral link', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const linkInput = screen.getByDisplayValue('https://hypeai.io/join?ref=HYPE123ABC');
      expect(linkInput).toBeInTheDocument();
    });

    it('should display link statistics', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText('234')).toBeInTheDocument(); // Clicks
      expect(screen.getByText('15')).toBeInTheDocument(); // Conversions (same as referrals)
    });

    it('should calculate and display conversion rate', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const conversionRate = ((15 / 234) * 100).toFixed(1);
      expect(screen.getByText(`${conversionRate}%`)).toBeInTheDocument();
    });

    it('should not display conversion rate if no conversions', () => {
      (useReferralAPI.useReferralLink as jest.Mock).mockReturnValue({
        link: { ...mockLink, conversions: 0 },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.queryByText(/Conversion Rate/)).not.toBeInTheDocument();
    });
  });

  describe('Copy Functionality', () => {
    it('should copy referral link to clipboard', async () => {
      const { copyToClipboard } = require('../../../src/frontend/utils/helpers');

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const copyButtons = screen.getAllByText('Copy');
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(copyToClipboard).toHaveBeenCalledWith('https://hypeai.io/join?ref=HYPE123ABC');
      });
    });

    it('should show "Copied!" feedback after copying', async () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const copyButtons = screen.getAllByText('Copy');
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('should reset copy feedback after 2 seconds', async () => {
      jest.useFakeTimers();

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const copyButtons = screen.getAllByText('Copy');
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('QR Code Functionality', () => {
    it('should show "Generate QR Code" button initially', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText('Generate QR Code')).toBeInTheDocument();
    });

    it('should generate and display QR code when clicked', async () => {
      const { generateQRCode } = require('../../../src/frontend/utils/helpers');

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const generateButton = screen.getByText('Generate QR Code');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(generateQRCode).toHaveBeenCalledWith('https://hypeai.io/join?ref=HYPE123ABC');
        expect(screen.getByAltText('QR Code')).toBeInTheDocument();
      });
    });

    it('should show Download QR button after generation', async () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const generateButton = screen.getByText('Generate QR Code');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Download QR')).toBeInTheDocument();
      });
    });

    it('should download QR code when Download button clicked', async () => {
      const { downloadQRCode } = require('../../../src/frontend/utils/helpers');

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const generateButton = screen.getByText('Generate QR Code');
      fireEvent.click(generateButton);

      await waitFor(() => {
        const downloadButton = screen.getByText('Download QR');
        fireEvent.click(downloadButton);
      });

      expect(downloadQRCode).toHaveBeenCalledWith(
        'data:image/png;base64,mockQRCode',
        'hypeai-referral-HYPE123ABC.png'
      );
    });

    it('should hide QR code when Hide button clicked', async () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      // Generate QR
      const generateButton = screen.getByText('Generate QR Code');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(screen.getByAltText('QR Code')).toBeInTheDocument();
      });

      // Hide QR
      const hideButton = screen.getByText('Hide');
      fireEvent.click(hideButton);

      await waitFor(() => {
        expect(screen.queryByAltText('QR Code')).not.toBeInTheDocument();
        expect(screen.getByText('Generate QR Code')).toBeInTheDocument();
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when Refresh button clicked', () => {
      const mockRefetchStats = jest.fn();
      const mockRefetchLink = jest.fn();

      (useReferralAPI.useReferralStats as jest.Mock).mockReturnValue({
        stats: mockStats,
        loading: false,
        error: null,
        refetch: mockRefetchStats,
      });

      (useReferralAPI.useReferralLink as jest.Mock).mockReturnValue({
        link: mockLink,
        loading: false,
        error: null,
        refetch: mockRefetchLink,
      });

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);

      expect(mockRefetchStats).toHaveBeenCalled();
      expect(mockRefetchLink).toHaveBeenCalled();
    });
  });

  describe('Stats Cards', () => {
    it('should render all 4 stats cards', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText('Total Referrals')).toBeInTheDocument();
      expect(screen.getByText('Total Earned (USDT)')).toBeInTheDocument();
      expect(screen.getByText('Total Earned (HYPE)')).toBeInTheDocument();
      expect(screen.getByText('Pending Rewards')).toBeInTheDocument();
    });

    it('should handle zero values gracefully', () => {
      (useReferralAPI.useReferralStats as jest.Mock).mockReturnValue({
        stats: {
          totalReferrals: 0,
          totalEarnedUSDT: 0,
          totalEarnedHYPE: 0,
          pendingRewards: 0,
        },
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getByText('$0')).toBeInTheDocument();
    });

    it('should handle undefined stats gracefully', () => {
      (useReferralAPI.useReferralStats as jest.Mock).mockReturnValue({
        stats: undefined,
        loading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      // Should show 0 for all stats
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });
  });

  describe('Tips Section', () => {
    it('should display all 3 tips', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText('Target Your Audience')).toBeInTheDocument();
      expect(screen.getByText('Use Social Media')).toBeInTheDocument();
      expect(screen.getByText('Create Content')).toBeInTheDocument();
    });

    it('should display "Maximize Your Earnings" header', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText('Maximize Your Earnings')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for inputs', () => {
      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByLabelText('Referral Code')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Link')).toBeInTheDocument();
    });

    it('should have alt text for loading spinner', () => {
      (useReferralAPI.useReferralStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(screen.getByText('Loading your dashboard...')).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with data loaded', () => {
      const { container } = render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(container).toMatchSnapshot();
    });

    it('should match snapshot in loading state', () => {
      (useReferralAPI.useReferralStats as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
      });

      const { container } = render(
        <ReferralDashboard
          userId={mockUserId}
          userWallet={mockWallet}
        />
      );

      expect(container).toMatchSnapshot();
    });
  });
});
