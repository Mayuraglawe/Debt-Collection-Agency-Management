import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./globals-dynamic.css";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";

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
          <AuthProvider>
            <div className="min-h-screen">
              {children}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
