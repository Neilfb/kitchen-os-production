export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debug Tools</h1>
        <p className="text-gray-500">
          These tools are for development and debugging purposes only.
        </p>
      </div>
      {children}
    </div>
  );
}
