import React from "react";
import BookTable from "@/components/BookTable";
import { getBooks } from "@/app/actions/books";
import { getCategories } from "@/app/actions/categories";
import { Library, BookOpen, Layers, BookMarked } from "lucide-react";

type PageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  // Await searchParams karena di Next.js 16 ini adalah Promise
  const resolvedSearchParams = await searchParams;
  
  const search = resolvedSearchParams.search || "";
  const categoryId = resolvedSearchParams.category || "all";
  const startDate = resolvedSearchParams.startDate || "";
  const endDate = resolvedSearchParams.endDate || "";
  const page = Number(resolvedSearchParams.page) || 1;

  // Fetch data dari database melalui Server Actions (Limit default: 10)
  const booksRes = await getBooks({
    search,
    categoryId,
    startDate,
    endDate,
    page,
    limit: 10,
  });

  const categoriesRes = await getCategories();

  const booksData = booksRes.success && booksRes.data ? booksRes.data.books : [];
  const totalCount = booksRes.success && booksRes.data ? booksRes.data.totalCount : 0;
  const totalPagesCount = booksRes.success && booksRes.data ? booksRes.data.totalPages : 1;
  const categories = categoriesRes.success && categoriesRes.data ? categoriesRes.data : [];

  // Hitung statistik sederhana untuk mempercantik Dashboard
  const totalBooks = totalCount;
  const totalCategories = categories.length;
  const totalPages = booksData.reduce((sum, book) => sum + (book.numberOfPages || 0), 0);
  const averagePages = booksData.length > 0 ? Math.round(totalPages / booksData.length) : 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Ringkasan Dashboard / Statistik (Hanya tampil di Desktop lg) */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {/* Card 1: Total Buku */}
        <div className="stat bg-base-100 rounded-xl shadow border border-base-200">
          <div className="stat-figure text-primary">
            <Library className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs font-semibold uppercase opacity-60">Total Buku</div>
          <div className="stat-value text-primary text-3xl font-extrabold mt-1">{totalBooks}</div>
          <div className="stat-desc text-xs mt-1">Buku dalam daftar saat ini</div>
        </div>

        {/* Card 2: Total Kategori */}
        <div className="stat bg-base-100 rounded-xl shadow border border-base-200">
          <div className="stat-figure text-secondary">
            <Layers className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs font-semibold uppercase opacity-60">Kategori Terdaftar</div>
          <div className="stat-value text-secondary text-3xl font-extrabold mt-1">{totalCategories}</div>
          <div className="stat-desc text-xs mt-1">Kategori buku aktif</div>
        </div>

        {/* Card 3: Total Halaman */}
        <div className="stat bg-base-100 rounded-xl shadow border border-base-200">
          <div className="stat-figure text-accent">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs font-semibold uppercase opacity-60">Akumulasi Halaman</div>
          <div className="stat-value text-accent text-3xl font-extrabold mt-1">{totalPages.toLocaleString("id-ID")}</div>
          <div className="stat-desc text-xs mt-1">Lembar halaman keseluruhan</div>
        </div>

        {/* Card 4: Rata-rata Halaman */}
        <div className="stat bg-base-100 rounded-xl shadow border border-base-200">
          <div className="stat-figure text-info">
            <BookMarked className="w-8 h-8" />
          </div>
          <div className="stat-title text-xs font-semibold uppercase opacity-60">Rata-rata Tebal Buku</div>
          <div className="stat-value text-info text-3xl font-extrabold mt-1">{averagePages}</div>
          <div className="stat-desc text-xs mt-1">Halaman per buku</div>
        </div>
      </div>

      {/* Tampilan Tabel/Grid Buku Lebar Penuh */}
      <div className="w-full">
        <BookTable 
          books={booksData} 
          categories={categories} 
          currentPage={page} 
          totalPages={totalPagesCount} 
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
