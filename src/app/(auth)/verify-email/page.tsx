"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      // If no token, show resend option
      if (!token) {
        setStatus("error");
        setMessage("Link verifikasi tidak valid atau sudah kadaluarsa");
        setCanResend(true);
        return;
      }

      try {
        // Supabase handles email verification automatically via callback
        // This page is shown after callback redirect
        if (type === "email") {
          setStatus("success");
          setMessage("Email Anda berhasil diverifikasi!");

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?verified=true");
          }, 3000);
        }
      } catch (error) {
        setStatus("error");
        setMessage("Terjadi kesalahan saat verifikasi email");
        setCanResend(true);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResendVerification = async () => {
    setResending(true);
    try {
      const email = searchParams.get("email");
      if (!email) {
        alert("Email tidak ditemukan. Silakan login untuk mengirim ulang verifikasi.");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.");
        setCanResend(false);
      } else {
        alert(data.message || "Gagal mengirim ulang email verifikasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-16 w-16 text-brand-500 animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && "Memverifikasi Email..."}
            {status === "success" && "Verifikasi Berhasil!"}
            {status === "error" && "Verifikasi Gagal"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>

          {status === "success" && (
            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Anda akan diarahkan ke halaman login dalam beberapa detik...
              </p>
              <Button onClick={() => router.push("/login")} className="w-full">
                Lanjut ke Login
              </Button>
            </div>
          )}

          {status === "error" && canResend && (
            <div className="pt-4 space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full"
              >
                {resending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Kirim Ulang Email Verifikasi
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Kembali ke Login
              </Button>
            </div>
          )}

          {status === "error" && !canResend && (
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full"
              >
                Kembali ke Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Verifying Email...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
