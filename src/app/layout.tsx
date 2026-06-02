import type { Metadata } from 'next';
import './globals.css';
import DashboardLayout from '@/components/DashboardLayout';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'AdminPro - Premium Admin Dashboard',
  description: 'Giao diện quản trị Admin Dashboard cao cấp xây dựng bằng Next.js & CSS Modules',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body suppressHydrationWarning>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
