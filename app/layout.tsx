import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BookOpen } from "lucide-react";
import HeaderFilter from "@/components/HeaderFilter";
import ThemeToggle from "@/components/ThemeToggle";
import { getCategories } from "@/app/actions/categories";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PustakaKita - Sistem Manajemen Daftar Buku Online",
  description: "Kelola daftar buku, kategori, penerbit, dan tanggal publikasi secara real-time dengan sistem pencarian server-side modern.",
  keywords: "booklist, library manager, nextjs, prisma, postgresql, daisyui",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ambil kategori dari database secara server-side
  const categoriesRes = await getCategories();
  const categories = categoriesRes.success && categoriesRes.data ? categoriesRes.data : [];

  return (
    <html
      lang="id"
      data-theme="light"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const theme = savedTheme || systemTheme;
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col bg-base-200 text-base-content">
        {/* Navbar Premium */}
        <header className="navbar bg-base-100 shadow-md px-4 md:px-6 py-3.5 sticky top-0 z-40 border-b border-base-200 gap-4 flex-col sm:flex-row justify-between items-center">
          <div className="flex-1 w-full sm:w-auto justify-between sm:justify-start">
            <a href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity brand-text">
              <div className="bg-primary text-primary-content p-2 rounded-lg shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className=" flex flex-col gap-1">
                <span className="text-xl font-black tracking-tight brand-text">
                  PustakaKita
                </span>
                <span className="text-[10px] block font-semibold text-base-content/60 tracking-wider -mt-1 uppercase">
                  Aplikasi Manajemen Daftar Buku
                </span>
              </div>
            </a>
          </div>
          
          {/* Bagian Filter di Header */}
          <div className="flex-none w-full sm:w-auto flex justify-end gap-3 items-center">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Suspense Wrapper untuk useSearchParams di HeaderFilter */}
            <Suspense fallback={
              <div className="flex items-center gap-2 w-full max-w-lg sm:max-w-md md:max-w-lg">
                <div className="skeleton h-10 w-full rounded-full"></div>
                <div className="skeleton h-10 w-10 rounded-full"></div>
              </div>
            }>
              <HeaderFilter categories={categories} />
            </Suspense>
          </div>
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="footer footer-center p-6 bg-base-100 text-base-content/60 border-t border-base-200">
          <aside className="flex flex-col gap-1">
            <p className="font-bold text-sm">
              PustakaKita - Aplikasi Web Manajemen Daftar Buku
            </p>
            <p className="text-xs">
              © {new Date().getFullYear()} - Dibuat untuk evaluasi Azura Labs Take-Home Test
            </p>
          </aside>
        </footer>
      </body>
    </html>
  );
}
