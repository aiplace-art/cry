import React from 'react';
import '../styles/globals.css';

export const metadata = {
  title: 'HypeAI Analytics Dashboard',
  description: 'Real-time analytics and tracking for HypeAI token',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
