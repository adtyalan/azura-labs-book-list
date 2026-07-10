"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Skema Validasi Zod untuk Kategori
const categorySchema = z.string()
  .min(1, "Nama kategori tidak boleh kosong")
  .max(50, "Nama kategori maksimal 50 karakter")
  .refine(val => val.trim().length > 0, "Nama kategori tidak boleh hanya berisi spasi");

export type CategoryResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};

// Mendapatkan semua kategori
export async function getCategories(): Promise<CategoryResponse<any[]>> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: { books: true },
        },
      },
    });
    return {
      success: true,
      message: "Berhasil mengambil data kategori",
      data: categories,
    };
  } catch (error: any) {
    console.error("Gagal mendapatkan kategori:", error);
    return {
      success: false,
      message: "Gagal mengambil data kategori",
      error: error.message || String(error),
    };
  }
}

// Membuat kategori baru
export async function createCategory(name: string): Promise<CategoryResponse> {
  const result = categorySchema.safeParse(name);
  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const cleanedName = result.data.trim();

  try {
    // Cek apakah kategori sudah ada
    const existing = await prisma.category.findUnique({
      where: { name: cleanedName },
    });

    if (existing) {
      return { success: false, message: `Kategori dengan nama "${cleanedName}" sudah ada` };
    }

    const newCategory = await prisma.category.create({
      data: { name: cleanedName },
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Kategori "${newCategory.name}" berhasil dibuat`,
      data: newCategory,
    };
  } catch (error: any) {
    console.error("Gagal membuat kategori:", error);
    return {
      success: false,
      message: "Gagal membuat kategori baru",
      error: error.message || String(error),
    };
  }
}

// Memperbarui kategori
export async function updateCategory(id: string, name: string): Promise<CategoryResponse> {
  if (!id) {
    return { success: false, message: "ID kategori diperlukan" };
  }

  const result = categorySchema.safeParse(name);
  if (!result.success) {
    return { success: false, message: result.error.issues[0].message };
  }

  const cleanedName = result.data.trim();

  try {
    // Cek apakah nama kategori baru sudah digunakan oleh kategori lain
    const existing = await prisma.category.findFirst({
      where: {
        name: cleanedName,
        id: { not: id },
      },
    });

    if (existing) {
      return { success: false, message: `Kategori dengan nama "${cleanedName}" sudah digunakan oleh kategori lain` };
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name: cleanedName },
    });

    revalidatePath("/");
    return {
      success: true,
      message: "Kategori berhasil diperbarui",
      data: updatedCategory,
    };
  } catch (error: any) {
    console.error("Gagal memperbarui kategori:", error);
    return {
      success: false,
      message: "Gagal memperbarui kategori",
      error: error.message || String(error),
    };
  }
}

// Menghapus kategori menggunakan Prisma Transaction
export async function deleteCategory(id: string): Promise<CategoryResponse> {
  if (!id) {
    return { success: false, message: "ID kategori diperlukan" };
  }

  try {
    // Jalankan di dalam transaksi untuk memastikan integritas data terjamin sepenuhnya
    const deletedCategory = await prisma.$transaction(async (tx) => {
      // 1. Dapatkan info kategori
      const category = await tx.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new Error("Kategori tidak ditemukan");
      }

      // 2. Hapus kategori (Prisma cascade delete akan menghapus buku di dalamnya secara otomatis)
      await tx.category.delete({
        where: { id },
      });

      return category;
    });

    revalidatePath("/");
    return {
      success: true,
      message: `Kategori "${deletedCategory.name}" beserta semua buku di dalamnya berhasil dihapus`,
    };
  } catch (error: any) {
    console.error("Gagal menghapus kategori:", error);
    return {
      success: false,
      message: error.message || "Gagal menghapus kategori",
      error: error.message || String(error),
    };
  }
}
