import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
// import "./globals.css"; // Commenting out default global styles

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Relaxing 3D Circular Image Gallery", // Updated title
  description: "A 3D circular image gallery created with Next.js and GSAP", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* GSAP and ScrollTrigger CDN links */}
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.3/gsap.min.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.3/ScrollTrigger.min.js" strategy="beforeInteractive" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
