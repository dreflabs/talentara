"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Ruler,
  Weight,
  Calendar,
  Briefcase,
  Star,
  Wallet,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils/format";
import { TALENT_CATEGORIES } from "@/lib/utils/constants";
import { AvatarUpload } from "@/components/ui/avatar-upload";

// Form validation schema
const profileFormSchema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  phone: z.string().min(1, "Nomor HP wajib diisi"),
  category: z.enum(["spg", "usher", "both"]),
  gender: z.enum(["male", "female"]).nullable().optional(),
  date_of_birth: z.string().nullable().optional(),
  height_cm: z.number().min(100).max(250).nullable().optional(),
  weight_kg: z.number().min(30).max(200).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  province: z.string().max(100).nullable().optional(),
  address: z.string().nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  daily_rate: z.number().min(0).nullable().optional(),
  is_available: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

interface TalentProfile {
  profile: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    is_verified: boolean;
    is_active: boolean;
    created_at: string;
  };
  talent: {
    id: string;
    category: string;
    gender: string | null;
    date_of_birth: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    city: string | null;
    province: string | null;
    address: string | null;
    bio: string | null;
    daily_rate: number | null;
    is_available: boolean;
    verification_status: string;
    rating_avg: number;
    rating_count: number;
    total_jobs_completed: number;
    wallet_balance: number;
  } | null;
  portfolios: unknown[];
  experiences: unknown[];
}

export default function TalentProfilePage() {
  const [profileData, setProfileData] = useState<TalentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  const isAvailable = watch("is_available");

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/talents/profile");
        if (response.ok) {
          const result = await response.json();
          setProfileData(result.data);
          setAvatarUrl(result.data.profile.avatar_url);

          // Populate form
          const { profile, talent } = result.data;
          reset({
            full_name: profile.full_name || "",
            phone: profile.phone || "",
            category: (talent?.category as "spg" | "usher" | "both") || "spg",
            gender: talent?.gender as "male" | "female" | null || null,
            date_of_birth: talent?.date_of_birth || null,
            height_cm: talent?.height_cm || null,
            weight_kg: talent?.weight_kg || null,
            city: talent?.city || null,
            province: talent?.province || null,
            address: talent?.address || null,
            bio: talent?.bio || null,
            daily_rate: talent?.daily_rate || null,
            is_available: talent?.is_available ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      const response = await fetch("/api/talents/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSaveMessage({ type: "success", text: "Profil berhasil disimpan!" });
        // Re-fetch to get updated data
        const refreshResponse = await fetch("/api/talents/profile");
        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          setProfileData(refreshResult.data);
        }
      } else {
        setSaveMessage({ type: "error", text: result.message || "Gagal menyimpan profil" });
      }
    } catch {
      setSaveMessage({ type: "error", text: "Terjadi kesalahan. Silakan coba lagi." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const talent = profileData?.talent;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Talent</h1>
          <p className="text-muted-foreground">Kelola informasi profil dan data diri Anda</p>
        </div>
        <div className="flex items-center gap-2">
          {talent?.verification_status === "verified" ? (
            <Badge className="bg-green-100 text-green-700">
              <CheckCircle className="mr-1 h-3 w-3" /> Terverifikasi
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="mr-1 h-3 w-3" /> Belum Verifikasi
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Briefcase className="h-8 w-8 text-brand-500" />
            <div>
              <p className="text-2xl font-bold">{talent?.total_jobs_completed || 0}</p>
              <p className="text-xs text-muted-foreground">Job Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Star className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{talent?.rating_avg?.toFixed(1) || "0.0"}</p>
              <p className="text-xs text-muted-foreground">{talent?.rating_count || 0} review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Wallet className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{formatCurrency(talent?.wallet_balance || 0)}</p>
              <p className="text-xs text-muted-foreground">Saldo Wallet</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`h-4 w-4 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-300"}`} />
            <div>
              <p className="text-lg font-bold">{isAvailable ? "Tersedia" : "Tidak Tersedia"}</p>
              <p className="text-xs text-muted-foreground">Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`rounded-md p-3 text-sm ${
          saveMessage.type === "success"
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
        }`}>
          {saveMessage.text}
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Foto Profil</CardTitle>
            <CardDescription>Upload foto profil Anda untuk meningkatkan kredibilitas</CardDescription>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              onUploadComplete={(url) => {
                setAvatarUrl(url);
                setSaveMessage({ type: "success", text: "Foto profil berhasil diupload!" });
                setTimeout(() => setSaveMessage(null), 5000);
              }}
              onUploadError={(error) => {
                setSaveMessage({ type: "error", text: error });
                setTimeout(() => setSaveMessage(null), 5000);
              }}
            />
          </CardContent>
        </Card>

        {/* Informasi Dasar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Informasi Dasar
            </CardTitle>
            <CardDescription>Nama, email, dan kontak Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nama Lengkap *</Label>
                <Input id="full_name" {...register("full_name")} />
                {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {profileData?.profile.email}
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="mr-1 inline h-4 w-4" /> Nomor HP *
                </Label>
                <Input id="phone" {...register("phone")} placeholder="081234567890" />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori *</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {TALENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Fisik */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" /> Data Fisik
            </CardTitle>
            <CardDescription>Informasi fisik untuk kebutuhan event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="gender">Jenis Kelamin</Label>
                <select
                  id="gender"
                  {...register("gender")}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">Pilih</option>
                  <option value="female">Perempuan</option>
                  <option value="male">Laki-laki</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="height_cm">
                  <Ruler className="mr-1 inline h-4 w-4" /> Tinggi Badan (cm)
                </Label>
                <Input id="height_cm" type="number" {...register("height_cm")} placeholder="165" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight_kg">
                  <Weight className="mr-1 inline h-4 w-4" /> Berat Badan (kg)
                </Label>
                <Input id="weight_kg" type="number" {...register("weight_kg")} placeholder="55" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">
                <Calendar className="mr-1 inline h-4 w-4" /> Tanggal Lahir
              </Label>
              <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
            </div>
          </CardContent>
        </Card>

        {/* Lokasi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Input id="city" {...register("city")} placeholder="Semarang" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="province">Provinsi</Label>
                <Input id="province" {...register("province")} placeholder="Jawa Tengah" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea id="address" {...register("address")} placeholder="Jl. Pandanaran No. 1..." rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Bio & Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" /> Profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / Tentang Saya</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Ceritakan pengalaman dan keahlian Anda..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">Maks. 1000 karakter</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daily_rate">Tarif Harian (Rp)</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  {...register("daily_rate")}
                  placeholder="400000"
                />
                <p className="text-xs text-muted-foreground">Tarif per hari kerja</p>
              </div>
              <div className="space-y-2">
                <Label>Ketersediaan</Label>
                <label className="flex items-center gap-3 rounded-md border p-3 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    {...register("is_available")}
                    className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm">Saya tersedia untuk pekerjaan</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button type="submit" className="bg-brand-500 hover:bg-brand-600" disabled={isSaving || !isDirty}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Simpan Profil
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
