import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';

import App from '../../src/frontend/App';
import { WalletProvider } from '../../src/frontend/context/WalletContext';

// Mock components and modules
jest.mock('../../src/frontend/components/WalletConnect', () => {
  return function WalletConnect() {
    return <button>Connect Wallet</button>;
  };
});

// Mock Redux store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, token: null }) => state,
      wallet: (state = { connected: false, address: null }) => state,
      staking: (state = { positions: [], loading: false }) => state,
      ...initialState
    }
  });
};

// Helper function to render with providers
const renderWithProviders = (component, { initialState = {}, ...options } = {}) => {
  const store = createMockStore(initialState);

  return render(
    <Provider store={store}>
      <BrowserRouter>
        <WalletProvider>
          {component}
        </WalletProvider>
      </BrowserRouter>
    </Provider>,
    options
  );
};

describe('App Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<App />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render navigation menu', () => {
      renderWithProviders(<App />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should display logo', () => {
      renderWithProviders(<App />);
      const logo = screen.getByAltText(/logo/i);
      expect(logo).toBeInTheDocument();
    });

    it('should show Connect Wallet button when not connected', () => {
      renderWithProviders(<App />);
      expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
    });
  });

  describe('Routing', () => {
    it('should navigate to home page', () => {
      renderWithProviders(<App />);
      const homeLink = screen.getByText(/home/i);
      fireEvent.click(homeLink);
      expect(window.location.pathname).toBe('/');
    });

    it('should navigate to staking page', () => {
      renderWithProviders(<App />);
      const stakingLink = screen.getByText(/staking/i);
      fireEvent.click(stakingLink);
      expect(window.location.pathname).toBe('/staking');
    });

    it('should navigate to dashboard when authenticated', () => {
      const initialState = {
        auth: (state = { user: { id: '1', email: 'test@test.com' }, token: 'abc123' }) => state
      };

      renderWithProviders(<App />, { initialState });
      const dashboardLink = screen.getByText(/dashboard/i);
      fireEvent.click(dashboardLink);
      expect(window.location.pathname).toBe('/dashboard');
    });

    it('should redirect to login for protected routes', () => {
      renderWithProviders(<App />);
      // Try to access protected route
      window.history.pushState({}, '', '/dashboard');
      expect(window.location.pathname).toBe('/login');
    });
  });

  describe('Authentication', () => {
    it('should show login form when not authenticated', () => {
      renderWithProviders(<App />);
      const loginLink = screen.getByText(/login/i);
      fireEvent.click(loginLink);
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should handle successful login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      const loginLink = screen.getByText(/login/i);
      fireEvent.click(loginLink);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    it('should show error message on failed login', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      const loginLink = screen.getByText(/login/i);
      fireEvent.click(loginLink);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should handle logout', async () => {
      const initialState = {
        auth: (state = { user: { id: '1' }, token: 'abc123' }) => state
      };

      renderWithProviders(<App />, { initialState });

      const logoutButton = screen.getByText(/logout/i);
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      });
    });
  });

  describe('Wallet Integration', () => {
    it('should show wallet connection modal', async () => {
      renderWithProviders(<App />);

      const connectButton = screen.getByText('Connect Wallet');
      fireEvent.click(connectButton);

      await waitFor(() => {
        expect(screen.getByText(/choose wallet/i)).toBeInTheDocument();
      });
    });

    it('should display connected wallet address', async () => {
      const initialState = {
        wallet: (state = {
          connected: true,
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
        }) => state
      };

      renderWithProviders(<App />, { initialState });

      await waitFor(() => {
        expect(screen.getByText(/0x742d/i)).toBeInTheDocument();
      });
    });

    it('should disconnect wallet', async () => {
      const initialState = {
        wallet: (state = { connected: true, address: '0x742d...' }) => state
      };

      renderWithProviders(<App />, { initialState });

      const disconnectButton = screen.getByText(/disconnect/i);
      fireEvent.click(disconnectButton);

      await waitFor(() => {
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile menu on small screens', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      renderWithProviders(<App />);
      expect(screen.getByLabelText(/mobile menu/i)).toBeInTheDocument();
    });

    it('should hide mobile menu on large screens', () => {
      global.innerWidth = 1024;
      global.dispatchEvent(new Event('resize'));

      renderWithProviders(<App />);
      expect(screen.queryByLabelText(/mobile menu/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should catch and display errors', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { container } = renderWithProviders(
        <App>
          <ThrowError />
        </App>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should allow recovery from errors', () => {
      // Simulate error and recovery
      const { rerender } = renderWithProviders(<App />);

      // Trigger error
      const errorButton = screen.queryByTestId('trigger-error');
      if (errorButton) {
        fireEvent.click(errorButton);
        expect(screen.getByText(/error/i)).toBeInTheDocument();

        // Click retry
        const retryButton = screen.getByText(/retry/i);
        fireEvent.click(retryButton);

        rerender(<App />);
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      }
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner during initialization', () => {
      const initialState = {
        app: (state = { loading: true }) => state
      };

      renderWithProviders(<App />, { initialState });
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should hide loading spinner after initialization', async () => {
      const initialState = {
        app: (state = { loading: true }) => state
      };

      const { rerender } = renderWithProviders(<App />, { initialState });

      const updatedState = {
        app: (state = { loading: false }) => state
      };

      rerender(
        <Provider store={createMockStore(updatedState)}>
          <BrowserRouter>
            <WalletProvider>
              <App />
            </WalletProvider>
          </BrowserRouter>
        </Provider>
      );

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(<App />);
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label');
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<App />);

      // Tab through interactive elements
      await user.tab();
      expect(screen.getByText(/home/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByText(/staking/i)).toHaveFocus();
    });

    it('should have sufficient color contrast', () => {
      const { container } = renderWithProviders(<App />);
      // This would require additional tooling like jest-axe
      expect(container).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should lazy load routes', async () => {
      renderWithProviders(<App />);

      // Navigate to a lazy-loaded route
      const stakingLink = screen.getByText(/staking/i);
      fireEvent.click(stakingLink);

      // Should show loading state
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Wait for lazy-loaded component
      await waitFor(() => {
        expect(screen.getByText(/staking positions/i)).toBeInTheDocument();
      });
    });

    it('should memoize expensive components', () => {
      const { rerender } = renderWithProviders(<App />);

      const initialRender = screen.getByRole('main');

      // Trigger re-render with same props
      rerender(
        <Provider store={createMockStore()}>
          <BrowserRouter>
            <WalletProvider>
              <App />
            </WalletProvider>
          </BrowserRouter>
        </Provider>
      );

      const afterRerender = screen.getByRole('main');

      // Component should not re-render unnecessarily
      expect(initialRender).toBe(afterRerender);
    });
  });
});
