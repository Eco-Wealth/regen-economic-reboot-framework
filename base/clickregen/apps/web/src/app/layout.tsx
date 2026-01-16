import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClickRegen',
  description: 'Sponsored micro-actions on Base with Regen upgrade path',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
