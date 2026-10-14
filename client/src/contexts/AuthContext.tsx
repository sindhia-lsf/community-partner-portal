import { UserCredential } from "firebase/auth";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onPortalFirebaseAuthState, sendPasswordSetupEmail, signInWithEmail, signInWithGoogle } from "@/lib/firebase";

export type PortalUser = {
  id: number;
  email: string;
  displayName: string | null;
  roles: Array<"partner" | "lightship_reviewer" | "admin">;
};

type AuthContextValue = {
  user: PortalUser | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  setUpPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function apiJson(path: string, options?: RequestInit) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
  return payload;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const payload = await apiJson("/api/me");
      setUser(payload.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const exchangeFirebaseToken = useCallback(async (idToken: string) => {
    const payload = await apiJson("/api/firebase-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    setUser(payload.user);
  }, []);

  const exchangeFirebaseCredential = useCallback(async (credential: UserCredential) => {
    await exchangeFirebaseToken(await credential.user.getIdToken());
  }, [exchangeFirebaseToken]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function restore() {
      // Prefer a valid portal session. If it is missing, Firebase's persisted
      // browser login can mint a replacement portal session automatically.
      try {
        const payload = await apiJson("/api/me");
        if (active) {
          setUser(payload.user);
          setLoading(false);
        }
        return;
      } catch {
        // Continue through Firebase state restoration below.
      }

      unsubscribe = onPortalFirebaseAuthState(async (firebaseUser) => {
        if (!active) return;
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }
        try {
          await exchangeFirebaseToken(await firebaseUser.getIdToken());
        } catch {
          setUser(null);
        } finally {
          if (active) setLoading(false);
        }
      });
    }

    void restore();
    return () => { active = false; unsubscribe?.(); };
  }, [exchangeFirebaseToken]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signInGoogle: async () => exchangeFirebaseCredential(await signInWithGoogle()),
    signInEmail: async (email, password) => exchangeFirebaseCredential(await signInWithEmail(email, password)),
    setUpPassword: sendPasswordSetupEmail,
    signOut: async () => {
      await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
      setUser(null);
    },
  }), [exchangeFirebaseCredential, loading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
