"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Skema Validasi Zod untuk Buku
const bookInputSchema = z.object({
  title: z.string().min(1, "Judul buku wajib diisi").max(100, "Judul buku maksimal 100 karakter"),
  author: z.string().min(1, "Penulis buku wajib diisi").max(80, "Nama penulis maksimal 80 karakter"),
  publicationDate: z.string().refine(val => !isNaN(Date.parse(val)), "Format tanggal tidak valid"),
  publisher: z.string().min(1, "Penerbit wajib diisi").max(100, "Nama penerbit maksimal 100 karakter"),
  numberOfPages: z.number().int("Jumlah halaman harus berupa angka bulat").positive("Jumlah halaman harus lebih besar dari 0"),
  categoryId: z.string().uuid("ID kategori tidak valid"),
});

export type BookResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

export type BookInput = {
  title: string;
  author: string;
  publicationDate: string; // dikirim dari input HTML date format YYYY-MM-DD
  publisher: string;
  numberOfPages: number;
  categoryId: string;
};

export type BookFilterInput = {
  search?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

// Mendapatkan daftar buku dengan filter (lengkap dengan paginasi server-side)
export async function getBooks(filters: BookFilterInput = {}): Promise<BookResponse<{ books: any[]; totalCount: number; page: number; totalPages: number }>> {
  try {
    const { search, categoryId, startDate, endDate, page = 1, limit = 10 } = filters;
    const whereClause: Prisma.BookWhereInput = {};

    // Filter berdasarkan kategori jika ada
    if (categoryId && categoryId !== "all") {
      whereClause.categoryId = categoryId;
    }

    // Filter berdasarkan tanggal publikasi
    if (startDate || endDate) {
      whereClause.publicationDate = {};
      if (startDate) {
        whereClause.publicationDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.publicationDate.lte = new Date(endDate);
      }
    }

    // Filter pencarian global teks (mencakup judul, penulis, DAN penerbit secara bersamaan)
    if (search && search.trim() !== "") {
      const searchTerms = search.trim();
      whereClause.OR = [
        { title: { contains: searchTerms, mode: "insensitive" } },
        { author: { contains: searchTerms, mode: "insensitive" } },
        { publisher: { contains: searchTerms, mode: "insensitive" } },
      ];
    }

    // Dapatkan total item yang cocok untuk informasi paginasi
    const totalCount = await prisma.book.count({
      where: whereClause,
    });

    const skip = (page - 1) * limit;

    const books = await prisma.book.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      message: "Berhasil mengambil data buku",
      data: {
        books,
        totalCount,
        page,
        totalPages: totalPages > 0 ? totalPages : 1,
      },
    };
  } catch (error: any) {
    console.error("Gagal mendapatkan buku:", error);
    return {
      success: false,
      message: "Gagal mengambil data buku",
      error: error.message || String(error),
    };
  }
}

// Membuat buku baru
export async function createBook(input: BookInput): Promise<BookResponse> {
  const result = bookInputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const { title, author, publicationDate, publisher, numberOfPages, categoryId } = result.data;

  try {
    const newBook = await prisma.book.create({
      data: {
        title: title.trim(),
        author: author.trim(),
        publicationDate: new Date(publicationDate),
        publisher: publisher.trim(),
        numberOfPages,
        categoryId,
      },
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Buku "${newBook.title}" berhasil ditambahkan`,
      data: newBook,
    };
  } catch (error: any) {
    console.error("Gagal membuat buku:", error);
    return {
      success: false,
      message: "Gagal menambahkan buku",
      error: error.message || String(error),
    };
  }
}

// Memperbarui data buku
export async function updateBook(id: string, input: BookInput): Promise<BookResponse> {
  if (!id) {
    return { success: false, message: "ID buku diperlukan untuk pembaruan" };
  }

  const result = bookInputSchema.safeParse(input);
  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const { title, author, publicationDate, publisher, numberOfPages, categoryId } = result.data;

  try {
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title: title.trim(),
        author: author.trim(),
        publicationDate: new Date(publicationDate),
        publisher: publisher.trim(),
        numberOfPages,
        categoryId,
      },
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Buku "${updatedBook.title}" berhasil diperbarui`,
      data: updatedBook,
    };
  } catch (error: any) {
    console.error("Gagal memperbarui buku:", error);
    return {
      success: false,
      message: "Gagal memperbarui buku",
      error: error.message || String(error),
    };
  }
}

// Menghapus buku
export async function deleteBook(id: string): Promise<BookResponse> {
  if (!id) {
    return { success: false, message: "ID buku diperlukan untuk menghapus" };
  }

  try {
    const deletedBook = await prisma.book.delete({
      where: { id },
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Buku "${deletedBook.title}" berhasil dihapus`,
    };
  } catch (error: any) {
    console.error("Gagal menghapus buku:", error);
    return {
      success: false,
      message: "Gagal menghapus buku",
      error: error.message || String(error),
    };
  }
}
