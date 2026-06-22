"use client";

import { Suspense, useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const searchParams = useSearchParams();
  const [signInError, setSignInError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const error =
    signInError ?? (searchParams.get("error") === "not-teacher" ? "Bu akkaunt o'qituvchi emas" : null);

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setSignInError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.replace("/");
    } catch {
      setSignInError("Kirishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm border-border/60 shadow-xl shadow-black/5 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <CardHeader className="items-center text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-500/25">
          <GraduationCap className="size-7" />
        </div>
        <CardTitle className="text-xl">O&apos;qituvchi paneli</CardTitle>
        <CardDescription>Navoiy universiteti · davom etish uchun kiring</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          onClick={handleGoogleSignIn}
          disabled={submitting}
          variant="outline"
          className="w-full justify-center gap-2"
        >
          {submitting ? (
            "Kirilmoqda..."
          ) : (
            <>
              <GoogleIcon className="size-4" />
              Google bilan kirish
            </>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Faqat ro&apos;yxatdan o&apos;tgan o&apos;qituvchilar uchun
        </p>
      </CardContent>
    </Card>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <main className="relative flex-1 flex items-center justify-center overflow-hidden p-6 bg-gradient-to-br from-indigo-50 via-background to-violet-50">
      <div className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-indigo-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-violet-400/20 blur-3xl" />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
