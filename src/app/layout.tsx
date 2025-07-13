import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Global scrollbar styles
const scrollbarStyles = `
  body::-webkit-scrollbar {
    width: 8px;
  }
  
  body::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  
  body::-webkit-scrollbar-thumb {
    background-color: #2563eb;
    border-radius: 10px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
  
  body::-webkit-scrollbar-thumb:hover {
    background-color: #1d4ed8;
  }
  
  html {
    scrollbar-width: thin;
    scrollbar-color: #2563eb rgba(255, 255, 255, 0.1);
  }
`;

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Micro Projects Management System",
  description: "A comprehensive system for managing micro projects, mentors, and student sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
