import { ArrowRight, Check, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import { FormEvent, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { firebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

type Workspace = "partner" | "organizer";

const workspaces = {
  partner: {
    eyebrow: "Community partner access",
    title: <>Move your <em>event</em> forward.</>,
    description: "Manage your community event, share media, request social collaboration, and stay connected with the Black Tech Week team.",
    label: "Community partner",
    helper: "For partner organizations managing an event",
    icon: UsersRound,
  },
  organizer: {
    eyebrow: "Lightship team access",
    title: <>Keep the <em>program</em> moving.</>,
    description: "Review community events, guide partner submissions, and coordinate the stories that bring Black Tech Week to life.",
    label: "Black Tech Week / Lightship team",
    helper: "For the team managing community events",
    icon: ShieldCheck,
  },
} satisfies Record<Workspace, {
  eyebrow: string;
  title: ReactNode;
  description: string;
  label: string;
  helper: string;
  icon: typeof UsersRound;
}>;

export default function Login() {
  const [, navigate] = useLocation();
  const { signInEmail, signInGoogle, setUpPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [workspace, setWorkspace] = useState<Workspace>("partner");
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  const requestedPath = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : null;
  const activeWorkspace = workspaces[workspace];

  function destinationFor(user: { roles: string[] }) {
    const organizer = user.roles.some((role) => role === "admin" || role === "lightship_reviewer");
    const partner = user.roles.includes("partner");
    if (workspace === "organizer") {
      if (!organizer) throw new Error("This account does not have Black Tech Week / Lightship team access.");
      return requestedPath?.startsWith("/organizer") ? requestedPath : "/organizer";
    }
    if (!partner) throw new Error("This account does not have Community Partner access.");
    return requestedPath && !requestedPath.startsWith("/organizer") ? requestedPath : "/";
  }

  async function run(action: () => Promise<{ roles: string[] }>) {
    setError("");
    setNotice("");
    setWorking(true);
    try {
      const user = await action();
      navigate(destinationFor(user));
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
    <main className="organizer-login">
      <section className="organizer-login-art" aria-hidden="true">
        <div className="login-grid-lines" />
        <div className="login-orbit login-orbit--cyan" />
        <div className="login-orbit login-orbit--pink" />
        <div className="login-sun" />
        <div className="login-route" />
        <div className="login-dot-field" />
        <div className="login-art-copy"><span>BTW 2026</span><strong>Community events,<br />in motion.</strong></div>
      </section>

      <section className="organizer-login-panel" aria-labelledby="portal-login-heading">
        <div className="login-brand">
          <img src="/assets/btw-signal-mark.webp" alt="" className="brand-mark" />
          <span className="brand-type">BLACK<br />TECH WEEK</span>
        </div>

        <div className="organizer-login-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> {activeWorkspace.eyebrow}</p>
          <h1 id="portal-login-heading">{activeWorkspace.title}</h1>
          <p>{activeWorkspace.description}</p>
        </div>

        <fieldset className="login-role-toggle" disabled={working}>
          <legend>Choose your workspace</legend>
          {(Object.keys(workspaces) as Workspace[]).map((option) => {
            const details = workspaces[option];
            const Icon = details.icon;
            const selected = workspace === option;
            return <button type="button" className={`login-role-option ${selected ? "login-role-option--selected" : ""}`} key={option} onClick={() => setWorkspace(option)} aria-pressed={selected}>
              <span className="login-role-option-icon"><Icon size={18} /></span>
              <span><strong>{details.label}</strong><small>{details.helper}</small></span>
              <span className="login-role-check">{selected && <Check size={14} strokeWidth={3} />}</span>
            </button>;
          })}
        </fieldset>

        {!firebaseConfigured && (
          <p className="organizer-auth-message organizer-auth-message--notice">Sign-in is being configured for this portal. Please check back shortly.</p>
        )}

        <form className="organizer-auth-form" onSubmit={submit}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={working || !firebaseConfigured} />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={working || !firebaseConfigured} />
          <button className="organizer-signin-button" type="submit" disabled={working || !firebaseConfigured}><LockKeyhole size={17} /> {working ? "Signing in..." : `Sign in to ${activeWorkspace.label}`} <ArrowRight size={17} /></button>
        </form>

        <button className="organizer-auth-link" type="button" onClick={() => void setUp()} disabled={working || !firebaseConfigured || !email.trim()}>
          Set or reset password
        </button>
        <div className="organizer-auth-divider"><span>or</span></div>
        <button className="organizer-google" type="button" onClick={() => void run(signInGoogle)} disabled={working || !firebaseConfigured}>
          Continue with Google
        </button>
        {notice && <p className="organizer-auth-message organizer-auth-message--notice">{notice}</p>}
        {error && <p className="organizer-auth-message organizer-auth-message--error">{error}</p>}
      </section>
    </main>
  );
}
