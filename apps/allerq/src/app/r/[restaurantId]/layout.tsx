// Layout for public menu with branding and language switcher
import React from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Image from "next/image";

const BASE_URL = process.env.NOCODEBACKEND_BASE_URL || 'https://api.nocodebackend.com/api';
const API_KEY = process.env.NOCODEBACKEND_SECRET_KEY || 'demo-mode-key-for-vercel-deployment';

type Params = Promise<{ restaurantId: string }>;

export default async function PublicMenuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { restaurantId } = await params;
  
  // Fetch branding info (logo, colors, etc.)
  let branding = null;
  try {
    const response = await fetch(`${BASE_URL}/restaurants/${restaurantId}/branding`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY || "",
      },
    });
    if (response.ok) {
      branding = await response.json();
    }
  } catch {}
  return (
    <div className="min-h-screen bg-white">
      <header className="flex flex-col items-center py-6 border-b mb-8">
        {branding?.logoUrl && (
          <Image src={branding.logoUrl} alt="Logo" className="h-16 mb-2" width={64} height={64} />
        )}
        <h1 className="text-2xl font-bold mb-1">{branding?.name || "Menu"}</h1>
        <LanguageSwitcher />
      </header>
      <main>{children}</main>
    </div>
  );
}
