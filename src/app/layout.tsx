import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import DarkToggle from "@/components/dark-toggle";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B165 Study Tool — Global Financial Strategy",
  description: "Interview prep for B165 with Prof. Folkinshteyn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <DarkToggle />
        </AuthProvider>
      </body>
    </html>
  );
}
