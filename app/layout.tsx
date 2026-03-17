import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { CartProvider } from "@/components/CartContext";
import Navbar from "@/components/Navbar";
import { BRAND_NAME } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} | Robotic and Electronic Parts`,
  description: `${BRAND_NAME} storefront for robotic parts, electronics, and custom sourcing requests.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} bg-background font-sans antialiased`}>
        <CartProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main>{children}</main>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
