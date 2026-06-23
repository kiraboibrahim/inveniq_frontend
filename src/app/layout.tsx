import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "AIMS - AI Inventory Management System",
  description: "Every item. Every insight. In one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-body bg-bg-base text-text-primary">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
