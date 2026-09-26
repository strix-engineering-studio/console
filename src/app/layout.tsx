import type { Metadata } from "next";
import AppProviders from "@/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strix Lead | Strix Engineering Studio",
  description: "Lead intelligence console for Strix Engineering Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
