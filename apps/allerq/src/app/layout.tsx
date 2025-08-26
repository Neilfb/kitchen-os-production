export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Kitchen OS - AllerQ</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
