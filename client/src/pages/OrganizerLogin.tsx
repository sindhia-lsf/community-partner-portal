import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function OrganizerLogin() {
  const [, navigate] = useLocation();

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
        <button type="button" className="login-brand" onClick={() => navigate("/")} aria-label="Return to Black Tech Week partner portal">
          <img src="/assets/btw-signal-mark.webp" alt="" className="brand-mark" />
          <span className="brand-type">BLACK<br />TECH WEEK</span>
        </button>

        <div className="organizer-login-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> Organizer access</p>
          <h1>Keep the<br /><em>program</em> moving.</h1>
          <p>Review community events, guide partner submissions, and coordinate the stories that bring Black Tech Week to life.</p>
        </div>

        <div className="organizer-access-card">
          <span className="organizer-access-icon"><ShieldCheck size={22} /></span>
          <div><strong>Organizer control room</strong><small>Secure access for the Black Tech Week team</small></div>
        </div>

        <button className="organizer-signin-button" type="button" onClick={() => navigate("/organizer")}>
          <LockKeyhole size={17} /> Sign in to organizer portal <ArrowRight size={17} />
        </button>
        <button className="organizer-login-secondary" type="button" onClick={() => toast("Access requests will be routed to program operations.")}>Need organizer access?</button>
        <p className="organizer-login-note">Prototype mode — sign-in is shown as a frontend interaction only.</p>
      </section>
    </main>
  );
}
