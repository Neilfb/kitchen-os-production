import { redirect } from 'next/navigation';

// This layout only handles the root redirect
// The actual layout is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This should only be reached for the root path '/'
  // Redirect to default locale
  redirect('/en');
}
