import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "De Realty 360 - Hệ thống quản lý 360° cho môi giới bất động sản",
  description:
    "Hệ thống quản lý toàn diện 360° cho môi giới bất động sản. Quản lý khách hàng, chủ nhà, kho hàng, giao dịch và báo cáo.",
  keywords: [
    "De Realty 360",
    "bất động sản",
    "môi giới",
    "CRM",
    "quản lý",
    "BĐS",
  ],
  authors: [{ name: "De Realty 360" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "De Realty 360 - Hệ thống quản lý 360° cho môi giới bất động sản",
    description:
      "Hệ thống quản lý toàn diện 360° cho môi giới bất động sản",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
