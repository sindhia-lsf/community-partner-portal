import { FormEvent, useState } from "react";
import { useLocation } from "wouter";
import { firebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [, navigate] = useLocation();
  const { signInEmail, signInGoogle, setUpPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  const destination = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

  async function run(action: () => Promise<void>) {
    setError("");
    setNotice("");
    setWorking(true);
    try {
      await action();
      navigate(destination);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in.");
    } finally {
      setWorking(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void run(() => signInEmail(email.trim(), password));
  }

  async function setUp() {
    setError("");
    setNotice("");
    setWorking(true);
    try {
      await setUpPassword(email.trim());
      setNotice("A password setup link has been sent to your email.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send the password setup link.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="portal-login-heading">
        <div className="auth-brand">BLACK TECH WEEK <span>Community Partner Portal</span></div>
        <p className="eyebrow"><span className="eyebrow-dot" /> Partner access</p>
        <h1 id="portal-login-heading">Your event, all in one place.</h1>
        <p className="auth-copy">Manage event details, media, reviews, and next steps with the Lightship team.</p>

        {!firebaseConfigured && (
          <p className="auth-message auth-message--notice">Sign-in is being configured for this portal. Please check back shortly.</p>
        )}

        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={working || !firebaseConfigured} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={working || !firebaseConfigured} />
          <button className="auth-submit" type="submit" disabled={working || !firebaseConfigured}>{working ? "Signing in..." : "Continue with email"}</button>
        </form>

        <button className="auth-link" type="button" onClick={() => void setUp()} disabled={working || !firebaseConfigured || !email.trim()}>
          Set or reset password
        </button>
        <div className="auth-divider"><span>or</span></div>
        <button className="auth-google" type="button" onClick={() => void run(signInGoogle)} disabled={working || !firebaseConfigured}>
          Continue with Google
        </button>
        {notice && <p className="auth-message auth-message--notice">{notice}</p>}
        {error && <p className="auth-message auth-message--error">{error}</p>}
      </section>
    </main>
  );
}
