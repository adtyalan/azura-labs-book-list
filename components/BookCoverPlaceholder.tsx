"use client";

import React from "react";

type BookCoverPlaceholderProps = {
  title: string;
  author: string;
  size?: "sm" | "md" | "lg";
};

// Skema gradien warna pastel yang indah
const GRADIENTS = [
  "from-pink-300 via-purple-300 to-indigo-400",
  "from-cyan-300 via-blue-300 to-indigo-400",
  "from-yellow-200 via-amber-300 to-orange-400",
  "from-emerald-300 via-teal-300 to-cyan-400",
  "from-rose-300 via-red-300 to-orange-400",
  "from-violet-300 via-fuchsia-300 to-pink-400",
  "from-sky-300 via-indigo-300 to-purple-400",
];

export default function BookCoverPlaceholder({
  title,
  author,
  size = "md",
}: BookCoverPlaceholderProps) {
  // Dapatkan inisial judul buku (maksimal 2 huruf)
  const getInitials = (text: string) => {
    if (!text) return "?";
    const words = text.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + (words[1] ? words[1][0] : "")).toUpperCase();
  };

  // Pilih gradien secara deterministik berdasarkan judul buku
  const getGradientIndex = (text: string) => {
    let sum = 0;
    for (let i = 0; i < text.length; i++) {
      sum += text.charCodeAt(i);
    }
    return sum % GRADIENTS.length;
  };

  const initials = getInitials(title);
  const gradient = GRADIENTS[getGradientIndex(title)];

  // Atur dimensi ukuran cover buku
  const sizeClasses = {
    sm: "w-12 h-16 text-sm",
    md: "w-20 h-28 text-xl",
    lg: "w-32 h-44 text-3xl",
  };

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-md shadow-md overflow-hidden flex flex-col justify-between p-2 bg-gradient-to-br ${gradient} select-none border border-black/5`}
    >
      {/* Tekstur garis halaman buku di sebelah kiri (Book Spine effect) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 blur-[0.5px]"></div>
      <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-black/10"></div>

      {/* Konten Cover */}
      <div className="flex justify-end w-full">
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-60">
          Book
        </span>
      </div>

      <div className="flex items-center justify-center flex-1 my-1">
        <span className="font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] tracking-tight">
          {initials}
        </span>
      </div>

      <div className="w-full text-[8px] truncate text-center font-medium bg-black/10 text-white py-0.5 rounded px-1 max-h-[14px]">
        {author}
      </div>
    </div>
  );
}
