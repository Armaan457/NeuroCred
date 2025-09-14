import type { Metadata } from "next";
import Header from '@/app/components/Header'
import Chatbot from '@/app/components/Chatbot/Chatbot'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroCred - AI-Powered Financial Assistant",
  description: "Get loan predictions, CIBIL score calculations, and financial advice powered by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        <Header />
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
