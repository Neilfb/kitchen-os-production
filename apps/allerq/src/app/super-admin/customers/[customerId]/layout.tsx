// Layout for super-admin customer detail
import React from "react";

export default function CustomerDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-8">{children}</div>
    </div>
  );
}
