import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Web3Provider } from '@/contexts/Web3Context';
import { NotificationProvider } from '@/lib/notifications';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { InstallPrompt } from '@/components/InstallPrompt';
import { initPWA } from '@/utils/pwa';
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
  useEffect(() => {
    // Initialize PWA features on mount (only in production)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      initPWA();
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="HYPE" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </Head>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Web3Provider>
            <NotificationProvider>
              <Component {...pageProps} />
            </NotificationProvider>
          </Web3Provider>
        </QueryClientProvider>
      </ErrorBoundary>
      <InstallPrompt />
    </>
  );
}
