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
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2">
          <GraduationCap className="size-6" />
        </div>
        <CardTitle>O&apos;qituvchi paneli</CardTitle>
        <CardDescription>Davom etish uchun Google hisobingiz bilan kiring</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-destructive text-sm text-center">{error}</p>}
        <Button onClick={handleGoogleSignIn} disabled={submitting} className="w-full">
          {submitting ? "Kirilmoqda..." : "Google bilan kirish"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-muted/30">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
