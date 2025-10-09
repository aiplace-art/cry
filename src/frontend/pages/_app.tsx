import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Web3Provider } from '@/contexts/Web3Context';
import { NotificationProvider } from '@/lib/notifications';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import '@/styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Web3Provider>
          <NotificationProvider>
            <Component {...pageProps} />
          </NotificationProvider>
        </Web3Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
