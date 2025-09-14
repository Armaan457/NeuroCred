import type { Metadata } from "next";
import Header from '@/app/components/Header'
import Chatbot from '@/app/components/Chatbot/Chatbot'
import "./globals.css";

export const metadata: Metadata = {
  title: "NeuroCred - AI Powered Financial Assistant",
  description: "Get loan predictions, CIBIL score calculations, and financial advice powered by AI",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/image/favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/image/favicon.png',
  },
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
