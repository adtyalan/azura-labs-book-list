"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, RotateCcw, Calendar, Layers, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
};

type HeaderFilterProps = {
  categories: Category[];
};

export default function HeaderFilter({ categories }: HeaderFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [isPending, startTransition] = useTransition();

  // Ambil state awal dari URL
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "all";
  const initialStartDate = searchParams.get("startDate") || "";
  const initialEndDate = searchParams.get("endDate") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  // Menutup dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        detailsRef.current.removeAttribute("open");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sinkronisasi state internal saat parameter URL berubah (misal dari reset filter eksternal)
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setCategoryId(searchParams.get("category") || "all");
    setStartDate(searchParams.get("startDate") || "");
    setEndDate(searchParams.get("endDate") || "");
  }, [searchParams]);

  // Debouncing pencarian teks
  useEffect(() => {
    const handler = setTimeout(() => {
      updateUrlParams({ search: searchTerm });
    }, 450);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Update URL Params untuk opsi filter lainnya saat berubah
  useEffect(() => {
    updateUrlParams({ category: categoryId, startDate, endDate });
  }, [categoryId, startDate, endDate]);

  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryId("all");
    setStartDate("");
    setEndDate("");
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  // Hitung jumlah filter aktif (kecuali search)
  const activeFiltersCount = 
    (categoryId !== "all" ? 1 : 0) + 
    (startDate ? 1 : 0) + 
    (endDate ? 1 : 0);

  return (
    <div className="flex items-center gap-2 w-full max-w-lg sm:max-w-md md:max-w-lg">
      {/* Search Bar Group */}
      <div className="relative flex-1">
        <input
          type="search"
          placeholder="Cari judul, penulis, penerbit..."
          className="input input-bordered w-full pl-10 pr-10 input-md rounded-full shadow-inner bg-base-50 focus:bg-base-100 transition-colors [&::-webkit-search-cancel-button]:hidden"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-base-content/40" />
        {(searchTerm || activeFiltersCount > 0) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="absolute right-3.5 top-3.5 text-base-content/40 hover:text-base-content/70 transition-colors"
            title="Hapus pencarian dan semua filter"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Popover Filter Opsi */}
      <details ref={detailsRef} className="dropdown dropdown-end">
        <summary 
          className={`btn btn-circle btn-md border border-base-300 bg-base-100 shadow-sm relative hover:bg-base-200 list-none [list-style:none] [&::-webkit-details-marker]:hidden ${
            activeFiltersCount > 0 ? "btn-primary text-primary-content" : ""
          }`}
          title="Filter Opsi"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 badge badge-secondary badge-xs px-1.5 py-1 font-extrabold text-[9px] rounded-full shadow">
              {activeFiltersCount}
            </span>
          )}
        </summary>

        {/* Dropdown Card Content */}
        <div 
          className="card dropdown-content z-[100] mt-3 w-80 p-5 shadow-2xl bg-base-100 border border-base-200 rounded-2xl"
        >
          <h3 className="font-bold text-sm text-base-content flex items-center gap-1.5 mb-3">
            <SlidersHorizontal className="w-4 h-4 text-primary" /> Opsi Penyaringan
          </h3>

          <div className="space-y-4">
            {/* Filter Kategori */}
            <div className="form-control w-full">
              <label className="label py-1" htmlFor="dropdown-category">
                <span className="label-text text-xs font-bold flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-base-content/60" /> Kategori
                </span>
              </label>
              <select
                id="dropdown-category"
                className="select select-bordered select-sm w-full"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Rentang Tanggal */}
            <div className="space-y-2">
              <label className="label py-0">
                <span className="label-text text-xs font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-base-content/60" /> Tanggal Publikasi
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <input
                    type="date"
                    className="input input-bordered input-xs w-full py-3"
                    value={startDate}
                    title="Tanggal Mulai"
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <input
                    type="date"
                    className="input input-bordered input-xs w-full py-3"
                    value={endDate}
                    title="Tanggal Selesai"
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="divider my-1"></div>

            {/* Tombol Aksi Filter */}
            <div className="flex gap-2">
              <button
                onClick={handleResetFilters}
                className="btn btn-ghost btn-xs flex-1 flex items-center justify-center gap-1 text-error hover:bg-error/10"
              >
                <RotateCcw className="w-3 h-3" /> Atur Ulang
              </button>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}
