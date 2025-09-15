"use client"
import Header from '@/app/components/Header'
import Chatbot from '@/app/components/Chatbot/Chatbot'
import { AuthProvider } from './context/AuthContext'
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}