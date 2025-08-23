import { notFound } from 'next/navigation';

// This layout only handles the root redirect
// The actual layout is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This should not be reached due to middleware redirect
  // But if it is, we'll show a not found page
  notFound();
}
