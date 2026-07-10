"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  Plus, Edit2, Trash2, LayoutGrid, Table, Calendar, 
  User, Bookmark, Hash, Layers, FolderCog, AlertTriangle,
  CheckCircle2, XCircle, Info, RefreshCw
} from "lucide-react";
import BookCoverPlaceholder from "./BookCoverPlaceholder";
import SkeletonLoader from "./SkeletonLoader";
import { createBook, updateBook, deleteBook, BookInput } from "@/app/actions/books";
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/categories";

type Category = {
  id: string;
  name: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  publicationDate: Date | string;
  publisher: string;
  numberOfPages: number;
  categoryId: string;
  category: Category;
};

type BookTableProps = {
  books: Book[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
};

export default function BookTable({ books, categories, currentPage, totalPages, totalCount }: BookTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isPending, startTransition] = useTransition();

  // Helper navigasi halaman paginasi
  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNumber));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Membaca query search aktif dari URL untuk highlight
  const currentSearch = searchParams.get("search") || "";

  // Menghitung filter aktif
  const hasActiveFilters = 
    !!searchParams.get("search") || 
    !!searchParams.get("category") || 
    !!searchParams.get("startDate") || 
    !!searchParams.get("endDate");

  // State Notifikasi Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Helper untuk menampilkan toast
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper untuk merender sorotan teks (highlight search query)
  const renderHighlightedText = (text: string, search: string) => {
    if (!search || !search.trim()) return text;
    
    const parts = text.split(new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={index} className="bg-warning text-warning-content px-0.5 rounded font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Fungsi reset filter URL
  const handleResetAllFilters = () => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // --- STATE UNTUK CRUD BUKU ---
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState<BookInput>({
    title: "",
    author: "",
    publicationDate: "",
    publisher: "",
    numberOfPages: 100,
    categoryId: "",
  });

  // --- STATE UNTUK CRUD KATEGORI ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  // --- STATE UNTUK KONFIRMASI HAPUS ---
  const [deleteTarget, setDeleteTarget] = useState<{ type: "book" | "category"; id: string; name: string } | null>(null);

  // Buka modal tambah buku
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookForm({
      title: "",
      author: "",
      publicationDate: "",
      publisher: "",
      numberOfPages: 100,
      categoryId: categories[0]?.id || "",
    });
    setIsBookModalOpen(true);
  };

  // Buka modal edit buku
  const handleOpenEditBook = (book: Book) => {
    setEditingBook(book);
    
    // Format date ke YYYY-MM-DD
    const dateObj = new Date(book.publicationDate);
    const formattedDate = dateObj.toISOString().split("T")[0];

    setBookForm({
      title: book.title,
      author: book.author,
      publicationDate: formattedDate,
      publisher: book.publisher,
      numberOfPages: book.numberOfPages,
      categoryId: book.categoryId,
    });
    setIsBookModalOpen(true);
  };

  // Simpan form Buku (Create / Update)
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookForm.title || !bookForm.author || !bookForm.publicationDate || !bookForm.publisher || !bookForm.categoryId) {
      showToast("Harap isi semua field formulir buku", "error");
      return;
    }

    startTransition(async () => {
      let res;
      if (editingBook) {
        res = await updateBook(editingBook.id, bookForm);
      } else {
        res = await createBook(bookForm);
      }

      if (res.success) {
        showToast(res.message, "success");
        setIsBookModalOpen(false);
      } else {
        showToast(res.message || "Terjadi kesalahan", "error");
      }
    });
  };

  // Eksekusi hapus buku atau kategori
  const handleExecuteDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      let res;
      if (deleteTarget.type === "book") {
        res = await deleteBook(deleteTarget.id);
      } else {
        res = await deleteCategory(deleteTarget.id);
      }

      if (res.success) {
        showToast(res.message, "success");
        setDeleteTarget(null);
      } else {
        showToast(res.message || "Gagal menghapus item", "error");
      }
    });
  };

  // Tambah Kategori Baru
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    startTransition(async () => {
      const res = await createCategory(newCategoryName);
      if (res.success) {
        showToast(res.message, "success");
        setNewCategoryName("");
      } else {
        showToast(res.message, "error");
      }
    });
  };

  // Simpan Edit Kategori
  const handleSaveEditCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;

    startTransition(async () => {
      const res = await updateCategory(editingCategory.id, editCategoryName);
      if (res.success) {
        showToast(res.message, "success");
        setEditingCategory(null);
        setEditCategoryName("");
      } else {
        showToast(res.message, "error");
      }
    });
  };

  // Helper pemformatan tanggal
  const formatDate = (dateString: Date | string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Panel Kontrol */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-4 rounded-xl shadow border border-base-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-ghost btn-active"}`}
            aria-label="Tampilan Tabel"
          >
            <Table className="w-4 h-4" /> Tabel
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`btn btn-sm ${viewMode === "grid" ? "btn-primary" : "btn-ghost btn-active"}`}
            aria-label="Tampilan Grid"
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="btn btn-sm btn-outline btn-secondary flex items-center gap-1.5"
          >
            <FolderCog className="w-4 h-4" /> Kelola Kategori
          </button>
          <button
            onClick={handleOpenAddBook}
            className="btn btn-sm btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Buku
          </button>
        </div>
      </div>

      {/* Konten Utama (Tabel / Grid / Skeleton / Kosong) */}
      {isPending ? (
        <SkeletonLoader viewMode={viewMode} count={books.length > 0 ? books.length : 6} />
      ) : books.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 shadow-xl py-16 px-4 text-center">
          <div className="max-w-md mx-auto flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
               <Bookmark className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold">
              {hasActiveFilters ? "Tidak Ada Buku yang Cocok" : "Daftar Buku Kosong"}
            </h3>
            <p className="text-base-content/60">
              {hasActiveFilters 
                ? "Tidak ada buku yang memenuhi kriteria filter aktif saat ini. Silakan atur ulang penyaringan atau buat buku baru."
                : "Tidak ada buku dalam database saat ini. Silakan buat buku baru."
              }
            </p>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {hasActiveFilters && (
                <button
                  onClick={handleResetAllFilters}
                  className="btn btn-outline btn-secondary flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Atur Ulang Semua Filter
                </button>
              )}
              <button
                onClick={handleOpenAddBook}
                className="btn btn-primary"
              >
                Tambah Buku {books.length === 0 && !hasActiveFilters ? "Pertama" : ""}
              </button>
            </div>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* --- TAMPILAN TABEL --- */
        <div className="overflow-x-auto bg-base-100 border border-base-200 shadow-xl rounded-xl">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200">
                <th className="w-20">Cover</th>
                <th>Detail Buku</th>
                <th className="hidden md:table-cell">Kategori</th>
                <th className="hidden sm:table-cell">Penerbit & Halaman</th>
                <th className="hidden lg:table-cell">Tanggal Rilis</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id} className="hover">
                  <td>
                    <BookCoverPlaceholder title={book.title} author={book.author} size="sm" />
                  </td>
                  <td>
                    <div className="max-w-text-table">
                      <div className="font-bold text-base leading-snug hover-slide-text cursor-default" title={book.title}>
                        {renderHighlightedText(book.title, currentSearch)}
                      </div>
                      <div className="text-sm opacity-60 flex items-center gap-1 mt-0.5 hover-slide-text cursor-default" title={book.author}>
                        <User className="w-3.5 h-3.5 flex-shrink-0" /> {renderHighlightedText(book.author, currentSearch)}
                      </div>
                      {/* Badge Kategori untuk Mobile/Tablet (< md) */}
                      <div className="mt-1 md:hidden">
                        <span className="badge badge-outline badge-sm font-semibold">{book.category?.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell">
                    <div className="max-w-text-table">
                      <span className="badge badge-outline badge-md max-w-full flex items-center justify-start" title={book.category?.name}>
                        <span className="hover-slide-text cursor-default truncate block max-w-full">
                          {book.category?.name}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <div className="max-w-text-table">
                      <div className="text-sm font-medium hover-slide-text cursor-default" title={book.publisher}>
                        {renderHighlightedText(book.publisher, currentSearch)}
                      </div>
                      <div className="text-xs opacity-60 mt-0.5">{book.numberOfPages} halaman</div>
                    </div>
                  </td>
                  <td className="text-sm font-medium hidden lg:table-cell">
                    {formatDate(book.publicationDate)}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => handleOpenEditBook(book)}
                        className="btn btn-ghost btn-xs text-info hover:bg-info/10"
                        title="Edit Buku"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: "book", id: book.id, name: book.title })}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                        title="Hapus Buku"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* --- TAMPILAN GRID --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300">
              <div className="card-body p-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <BookCoverPlaceholder title={book.title} author={book.author} size="md" />
                  </div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <span className="badge badge-secondary badge-xs mb-1.5">{book.category?.name}</span>
                      <h4 className="font-bold text-base leading-snug text-base-content truncate-3-lines" title={book.title}>
                        {renderHighlightedText(book.title, currentSearch)}
                      </h4>
                      <p className="text-xs opacity-75 mt-1 flex items-center gap-1 truncate">
                        <User className="w-3.5 h-3.5 flex-shrink-0" /> {renderHighlightedText(book.author, currentSearch)}
                      </p>
                    </div>
                    <div className="text-[11px] opacity-60 space-y-0.5 mt-2">
                      <div className="truncate">Penerbit: {renderHighlightedText(book.publisher, currentSearch)}</div>
                      <div>Halaman: {book.numberOfPages} lembar</div>
                    </div>
                  </div>
                </div>
                
                <div className="divider my-2.5"></div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-base-content/60 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(book.publicationDate)}
                  </span>
                  
                  <div className="flex gap-0.5">
                    <button
                      onClick={() => handleOpenEditBook(book)}
                      className="btn btn-ghost btn-xs text-info hover:bg-info/10 btn-square"
                      title="Edit Buku"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: "book", id: book.id, name: book.title })}
                      className="btn btn-ghost btn-xs text-error hover:bg-error/10 btn-square"
                      title="Hapus Buku"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PANEL NAVIGASI PAGINASI (Hanya tampil jika data > 1 halaman) --- */}
      {books.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-base-100 p-4 rounded-xl shadow border border-base-200 mt-2">
          <div className="text-xs text-base-content/60 font-medium">
            Menampilkan <span className="font-bold text-base-content">{books.length}</span> dari{" "}
            <span className="font-bold text-base-content">{totalCount}</span> buku terfilter
          </div>
          <div className="join shadow-sm border border-base-200 bg-base-100">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="join-item btn btn-sm btn-ghost hover:bg-base-200"
              disabled={currentPage <= 1 || isPending}
              title="Halaman Sebelumnya"
            >
              «
            </button>
            <button className="join-item btn btn-sm btn-active pointer-events-none cursor-default font-bold min-w-[3rem]">
              {currentPage} / {totalPages}
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="join-item btn btn-sm btn-ghost hover:bg-base-200"
              disabled={currentPage >= totalPages || isPending}
              title="Halaman Selanjutnya"
            >
              »
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL FORM BUKU (TAMBAH / EDIT) */}
      {/* ========================================================================= */}
      {isBookModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg text-primary mb-4 flex items-center gap-2">
              <Bookmark className="w-5 h-5" /> {editingBook ? "Edit Data Buku" : "Tambah Buku Baru"}
            </h3>
            
            <form onSubmit={handleSaveBook} className="space-y-4">
              {/* Input Judul */}
              <div className="form-control">
                <label className="label" htmlFor="book-title">
                  <span className="label-text font-semibold">Judul Buku *</span>
                </label>
                <input
                  id="book-title"
                  type="text"
                  placeholder="Masukkan judul buku"
                  className="input input-bordered w-full"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  required
                />
              </div>

              {/* Grid 2 Kolom untuk Penulis & Penerbit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label" htmlFor="book-author">
                    <span className="label-text font-semibold">Penulis / Author *</span>
                  </label>
                  <input
                    id="book-author"
                    type="text"
                    placeholder="Nama penulis"
                    className="input input-bordered w-full"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-control">
                  <label className="label" htmlFor="book-publisher">
                    <span className="label-text font-semibold">Penerbit *</span>
                  </label>
                  <input
                    id="book-publisher"
                    type="text"
                    placeholder="Nama penerbit"
                    className="input input-bordered w-full"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Grid 3 Kolom untuk Tanggal Publikasi, Halaman & Kategori */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label" htmlFor="book-pubdate">
                    <span className="label-text font-semibold">Tanggal Rilis *</span>
                  </label>
                  <input
                    id="book-pubdate"
                    type="date"
                    className="input input-bordered w-full"
                    value={bookForm.publicationDate}
                    onChange={(e) => setBookForm({ ...bookForm, publicationDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="book-pages">
                    <span className="label-text font-semibold">Halaman *</span>
                  </label>
                  <input
                    id="book-pages"
                    type="number"
                    min="1"
                    placeholder="Jumlah hal."
                    className="input input-bordered w-full"
                    value={bookForm.numberOfPages || ""}
                    onChange={(e) => setBookForm({ ...bookForm, numberOfPages: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label" htmlFor="book-category">
                    <span className="label-text font-semibold">Kategori *</span>
                  </label>
                  <select
                    id="book-category"
                    className="select select-bordered w-full"
                    value={bookForm.categoryId}
                    onChange={(e) => setBookForm({ ...bookForm, categoryId: e.target.value })}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tombol Aksi Form */}
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="btn btn-ghost"
                  disabled={isPending}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isPending}
                >
                  {isPending ? <span className="loading loading-spinner loading-xs"></span> : null}
                  Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL KELOLA KATEGORI */}
      {/* ========================================================================= */}
      {isCategoryModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
              <FolderCog className="w-5 h-5" /> Manajemen Kategori
            </h3>

            {/* Form Tambah Kategori Baru */}
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Nama kategori baru..."
                className="input input-bordered w-full input-sm"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-secondary btn-sm flex items-center gap-1"
                disabled={isPending}
              >
                <Plus className="w-4 h-4" /> Tambah
              </button>
            </form>

            <div className="divider my-0 mb-4">Daftar Kategori Terdaftar</div>

            {/* List Kategori Terdaftar */}
            <div className="max-h-60 overflow-y-auto space-y-2 border border-base-200 rounded-lg p-2 bg-base-50">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2 rounded hover:bg-base-200 transition-colors">
                  {editingCategory?.id === cat.id ? (
                    <form onSubmit={handleSaveEditCategory} className="flex gap-2 w-full">
                      <input
                        type="text"
                        className="input input-bordered input-xs w-full"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        required
                        autoFocus
                      />
                      <button type="submit" className="btn btn-success btn-xs" disabled={isPending}>
                        Simpan
                      </button>
                      <button type="button" onClick={() => setEditingCategory(null)} className="btn btn-ghost btn-xs">
                        Batal
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="font-medium text-sm">{cat.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditCategoryName(cat.name);
                          }}
                          className="btn btn-ghost btn-square btn-xs text-info"
                          title="Ganti Nama"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "category", id: cat.id, name: cat.name })}
                          className="btn btn-ghost btn-square btn-xs text-error"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="btn btn-ghost"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DIALOG KONFIRMASI HAPUS (BUKU / KATEGORI) */}
      {/* ========================================================================= */}
      {deleteTarget && (
        <DeleteConfirmationModal
          target={deleteTarget}
          isPending={isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleExecuteDelete}
        />
      )}

      {/* ========================================================================= */}
      {/* 4. TOAST NOTIFIKASI PREMIUM */}
      {/* ========================================================================= */}
      {toast && (
        <div className="toast toast-end toast-bottom z-50 p-4 max-w-sm sm:max-w-md animate-bounce-in">
          <div 
            className={`alert shadow-2xl text-white font-medium flex items-center justify-between gap-3 border-none py-3.5 px-4 rounded-xl ${
              toast.type === "success" 
                ? "bg-success text-success-content" 
                : toast.type === "error" 
                ? "bg-error text-error-content" 
                : "bg-info text-info-content"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
              {toast.type === "error" && <XCircle className="w-5 h-5 flex-shrink-0" />}
              {toast.type === "info" && <Info className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm leading-snug">{toast.message}</span>
            </div>
            <button 
              onClick={() => setToast(null)} 
              className="btn btn-ghost btn-circle btn-xs hover:bg-white/10 text-white/80 hover:text-white"
              title="Tutup Notifikasi"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// KOMPONEN PEMBANTU: DIALOG KONFIRMASI HAPUS PREMIUM
// =========================================================================
type DeleteConfirmationModalProps = {
  target: { type: "book" | "category"; id: string; name: string };
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteConfirmationModal({ target, isPending, onClose, onConfirm }: DeleteConfirmationModalProps) {
  const [typedConfirm, setTypedConfirm] = useState("");
  
  const isCategory = target.type === "category";
  // Jika kategori, wajib ketikkan namanya dengan persis. Jika buku, tidak wajib.
  const isButtonDisabled = isPending || (isCategory && typedConfirm.trim() !== target.name);

  return (
    <div className="modal modal-open">
      <div className="modal-box border-t-4 border-error rounded-2xl shadow-2xl max-w-md">
        <h3 className="font-bold text-lg text-error flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Konfirmasi Hapus {isCategory ? "Kategori" : "Buku"}
        </h3>
        
        <div className="py-4 space-y-3">
          <p className="text-sm leading-relaxed text-base-content/80">
            Apakah Anda yakin ingin menghapus {isCategory ? "kategori" : "buku"}{" "}
            <strong className="text-error font-extrabold">"{target.name}"</strong> secara permanen?
          </p>
          
          {isCategory ? (
            <div className="bg-warning/10 border border-warning/20 p-3.5 rounded-xl text-xs space-y-2 text-warning-content">
              <p className="font-bold flex items-center gap-1.5">
                ⚠️ Peringatan Konsekuensi Cascade Delete:
              </p>
              <p className="leading-normal opacity-90">
                Menghapus kategori ini juga akan menghapus secara permanen seluruh buku yang terdaftar di bawah kategori ini! Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="form-control mt-2">
                <label className="label py-0.5" htmlFor="delete-confirm-input">
                  <span className="label-text text-[11px] font-bold opacity-85">Ketik nama kategori untuk mengonfirmasi:</span>
                </label>
                <input
                  id="delete-confirm-input"
                  type="text"
                  placeholder={`Ketik "${target.name}"`}
                  className="input input-bordered input-sm w-full bg-base-100 text-base-content mt-1 border-warning/40 focus:border-warning"
                  value={typedConfirm}
                  onChange={(e) => setTypedConfirm(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="modal-action gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            disabled={isPending}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-error btn-sm flex items-center gap-1.5"
            disabled={isButtonDisabled}
          >
            {isPending ? <span className="loading loading-spinner loading-xs"></span> : null}
            Hapus Permanen
          </button>
        </div>
      </div>
    </div>
  );
}
