// Root layout - should not be reached due to middleware redirect
// If it is reached, it means there's a configuration issue

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Return a simple HTML structure without redirects
  return (
    <html lang="en">
      <body>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Configuration Error</h1>
          <p>This page should not be reached. Please check your routing configuration.</p>
          <p><a href="/en">Go to Home Page</a></p>
        </div>
        {children}
      </body>
    </html>
  );
}
