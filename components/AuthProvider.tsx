"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { fetchUserProfile } from "@/lib/firestore";

interface AuthState {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({ user: null, loading: true, signOut: async () => {} });

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // signOut() below triggers another onAuthStateChanged(null) call; this ref
  // stops that follow-up call from stomping the redirect we just issued.
  const suppressNextNullRedirect = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        if (suppressNextNullRedirect.current) {
          suppressNextNullRedirect.current = false;
        } else {
          router.replace("/login");
        }
        return;
      }
      const profile = await fetchUserProfile(firebaseUser.uid);
      if (profile?.role !== "teacher") {
        suppressNextNullRedirect.current = true;
        await firebaseSignOut(auth);
        setUser(null);
        setLoading(false);
        router.replace("/login?error=not-teacher");
        return;
      }
      setUser(firebaseUser);
      setLoading(false);
    });
  }, [router]);

  async function signOut() {
    await firebaseSignOut(auth);
    router.replace("/login");
  }

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}
