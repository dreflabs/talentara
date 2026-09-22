import { z } from "zod";
import { COMMON_PASSWORDS } from "@/lib/constants";

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(128, "Password maksimal 128 karakter")
    .regex(/[a-z]/, "Password harus mengandung huruf kecil")
    .regex(/[A-Z]/, "Password harus mengandung huruf besar")
    .regex(/[0-9]/, "Password harus mengandung angka")
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password harus mengandung karakter khusus")
    .refine(
      (password) => !(COMMON_PASSWORDS as readonly string[]).includes(password.toLowerCase()),
      "Password terlalu umum. Gunakan kombinasi yang lebih unik"
    )
    .refine(
      (password) => !/(.)\1{2,}/.test(password),
      "Password tidak boleh mengandung 3 karakter berulang berturut-turut"
    ),
  confirmPassword: z
    .string()
    .min(1, "Konfirmasi password wajib diisi"),
  full_name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  phone: z
    .string()
    .regex(
      /^(\+62|62|0)8[1-9][0-9]{6,11}$/,
      "Format nomor HP tidak valid (contoh: 081234567890)"
    ),
  role: z.enum(["talent", "client"], {
    message: "Pilih tipe akun",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;
