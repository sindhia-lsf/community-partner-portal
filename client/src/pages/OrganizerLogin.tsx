import { ArrowRight, Check, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type SignInRole = "partner" | "organizer";

const roles = {
  partner: {
    eyebrow: "Community partner access",
    title: <>Move your <em>event</em> forward.</>,
    description: "Manage your community event, share media, request social collaboration, and stay connected with the Black Tech Week team.",
    label: "Community partner",
    helper: "For partner organizations managing an event",
    icon: UsersRound,
    destination: "/",
    button: "Sign in to partner portal",
  },
  organizer: {
    eyebrow: "Organizer access",
    title: <>Keep the <em>program</em> moving.</>,
    description: "Review community events, guide partner submissions, and coordinate the stories that bring Black Tech Week to life.",
    label: "Black Tech Week organizer",
    helper: "For the team managing community events",
    icon: ShieldCheck,
    destination: "/organizer",
    button: "Sign in to organizer portal",
  },
} satisfies Record<SignInRole, {
  eyebrow: string;
  title: ReactNode;
  description: string;
  label: string;
  helper: string;
  icon: typeof UsersRound;
  destination: string;
  button: string;
}>;

export default function OrganizerLogin() {
  const [, navigate] = useLocation();
  const [role, setRole] = useState<SignInRole>("partner");
  const activeRole = roles[role];

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

      <section className="organizer-login-panel">
        <button type="button" className="login-brand" onClick={() => setRole("partner")} aria-label="Black Tech Week sign in">
          <img src="/assets/btw-signal-mark.webp" alt="" className="brand-mark" />
          <span className="brand-type">BLACK<br />TECH WEEK</span>
        </button>

        <div className="organizer-login-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Sign in</p>
          <h1>{activeRole.title}</h1>
          <p>{activeRole.description}</p>
        </div>

        <fieldset className="login-role-toggle">
          <legend>Choose your workspace</legend>
          {(Object.keys(roles) as SignInRole[]).map((roleOption) => {
            const option = roles[roleOption];
            const Icon = option.icon;
            const selected = role === roleOption;
            return (
              <button
                type="button"
                className={`login-role-option ${selected ? "login-role-option--selected" : ""}`}
                key={roleOption}
                onClick={() => setRole(roleOption)}
                aria-pressed={selected}
              >
                <span className="login-role-option-icon"><Icon size={18} /></span>
                <span><strong>{option.label}</strong><small>{option.helper}</small></span>
                <span className="login-role-check">{selected && <Check size={14} strokeWidth={3} />}</span>
              </button>
            );
          })}
        </fieldset>

        <button className="organizer-signin-button" type="button" onClick={() => navigate(activeRole.destination)}>
          <LockKeyhole size={17} /> {activeRole.button} <ArrowRight size={17} />
        </button>
        <button className="organizer-login-secondary" type="button" onClick={() => toast("Access requests will be routed to program operations.")}>Need help accessing a workspace?</button>
        <p className="organizer-login-note">Prototype mode — sign-in and role selection are shown as frontend interactions only.</p>
      </section>
    </main>
  );
}
