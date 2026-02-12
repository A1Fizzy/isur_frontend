import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import SidebarLayout from '@/components/Sidebar';

export const metadata: Metadata = {
  title: "ИСУР сервисного центра АП",
  description: "ИСУР сервисного центра АП",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <SidebarLayout>
          <main className="min-h-screen bg-gray-100 text-gray-800">
            {children}
          </main>
          </SidebarLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
