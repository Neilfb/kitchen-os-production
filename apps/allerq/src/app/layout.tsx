import { redirect } from 'next/navigation';

// This layout only handles the root redirect
// The actual layout is in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If we reach this point, redirect to the default locale
  // instead of calling notFound()
  redirect('/en');
}
