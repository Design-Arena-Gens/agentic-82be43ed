import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Call Agent',
  description: 'An AI agent that answers and talks on incoming calls',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial', background: '#0b1021', color: '#f4f6fb', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
