import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/shared/Toast';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MediScribe - Clinical Documentation Assistant',
  description: 'AI-powered clinical documentation and letter generation for healthcare professionals',
  keywords: ['medical', 'documentation', 'AI', 'clinical letters', 'healthcare'],
  authors: [{ name: 'MediScribe Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
