/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import AppProviders from "@/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Console",
  description: "Strix Engineering Studio Console",
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
