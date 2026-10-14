import OrganizerShell from "@/components/OrganizerShell";
import { CalendarDays, ClipboardCheck, MessageSquareText, Share2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizerOverview } from "@/lib/organizer";

export default function OrganizerDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { data, loading, error } = useOrganizerOverview();
  const name = user?.displayName?.split(" ")[0] || "there";
  return <OrganizerShell><main className="organizer-canvas">
    <section className="organizer-page-head"><div><p className="eyebrow"><span className="eyebrow-dot" /> Program operations</p><h1>Welcome, {name}.</h1><p>Live community-event data and review queues for the Black Tech Week team.</p></div></section>
    {error && <div className="organizer-empty-state"><strong>{error}</strong></div>}
    <section className="organizer-kpis" aria-label="Community event KPIs">
      <article className="organizer-kpi organizer-kpi--cyan"><span className="organizer-kpi-icon"><CalendarDays size={20} /></span><div><strong>{loading ? "—" : data?.eventCount || 0}</strong><span>Events registered</span></div></article>
      <article className="organizer-kpi organizer-kpi--yellow"><span className="organizer-kpi-icon"><MessageSquareText size={20} /></span><div><strong>{loading ? "—" : data?.pendingPartnerCount || 0}</strong><span>Pending partner action</span></div></article>
      <article className="organizer-kpi organizer-kpi--pink"><span className="organizer-kpi-icon"><ClipboardCheck size={20} /></span><div><strong>{loading ? "—" : data?.pendingMediaCount || 0}</strong><span>Media awaiting review</span></div></article>
      <article className="organizer-kpi organizer-kpi--lime"><span className="organizer-kpi-icon"><Share2 size={20} /></span><div><strong>{loading ? "—" : data?.pendingSocialCount || 0}</strong><span>Social requests awaiting review</span></div></article>
    </section>
    <section className="organizer-command-card"><div className="organizer-command-copy"><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Live queues</p><h2>Review the work that is <em>ready now.</em></h2><p>All counts reflect the portal database in real time.</p><button className="organizer-command-link" type="button" onClick={() => navigate("/organizer/media")}>Review media queue</button></div></section>
  </main></OrganizerShell>;
}
