import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Atlas DCA | AI-Powered Debt Collection Management",
  description: "Revolutionary AI-powered debt collection agency management system with predictive analytics, multi-agent orchestration, and automated follow-ups.",
  keywords: ["debt collection", "AI", "machine learning", "fintech", "automation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <div style={{ minHeight: '100vh' }}>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
