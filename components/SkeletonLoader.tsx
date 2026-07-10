import React from "react";

type SkeletonLoaderProps = {
  viewMode: "table" | "grid";
  count?: number;
};

export default function SkeletonLoader({ viewMode, count = 6 }: SkeletonLoaderProps) {
  if (viewMode === "table") {
    return (
      <div className="overflow-x-auto bg-base-100 border border-base-200 shadow-xl rounded-xl">
        <table className="table w-full">
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
            {Array.from({ length: count }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td>
                  <div className="w-12 h-16 bg-base-300 rounded-lg"></div>
                </td>
                <td>
                  <div className="space-y-2">
                    <div className="h-4 bg-base-300 rounded-md w-3/4"></div>
                    <div className="h-3 bg-base-300 rounded-md w-1/2"></div>
                    {/* Placeholder Kategori untuk Mobile */}
                    <div className="h-5 bg-base-300 rounded-full w-20 md:hidden mt-1"></div>
                  </div>
                </td>
                <td className="hidden md:table-cell">
                  <div className="h-6 bg-base-300 rounded-full w-24"></div>
                </td>
                <td className="hidden sm:table-cell">
                  <div className="space-y-2">
                    <div className="h-4 bg-base-300 rounded-md w-28"></div>
                    <div className="h-3 bg-base-300 rounded-md w-16"></div>
                  </div>
                </td>
                <td className="hidden lg:table-cell">
                  <div className="h-4 bg-base-300 rounded-md w-24"></div>
                </td>
                <td className="text-right">
                  <div className="inline-flex gap-2 justify-end w-full">
                    <div className="w-7 h-7 bg-base-300 rounded-lg"></div>
                    <div className="w-7 h-7 bg-base-300 rounded-lg"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Tampilan Grid Skeleton
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card bg-base-100 shadow-xl border border-base-200 animate-pulse"
        >
          <div className="card-body p-5">
            <div className="flex gap-4">
              <div className="w-16 h-24 bg-base-300 rounded-lg flex-shrink-0"></div>
              <div className="flex flex-col justify-between flex-1 space-y-3">
                <div className="space-y-2">
                  <div className="h-3 bg-base-300 rounded-md w-16"></div>
                  <div className="h-4 bg-base-300 rounded-md w-full"></div>
                  <div className="h-3 bg-base-300 rounded-md w-2/3"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-base-300 rounded-md w-24"></div>
                  <div className="h-3 bg-base-300 rounded-md w-20"></div>
                </div>
              </div>
            </div>
            <div className="h-px bg-base-200 my-2.5"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-base-300 rounded-md w-24"></div>
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-base-300 rounded-md"></div>
                <div className="w-6 h-6 bg-base-300 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
