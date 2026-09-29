import OrganizerShell from "@/components/OrganizerShell";
import { eventStatusCounts, mediaSubmissions, organizerEvents, socialSubmissions } from "@/data/organizerMockData";
import { ArrowUpRight, CalendarDays, CheckCircle2, ClipboardCheck, Clock3, Image, MessageSquareText, Share2, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

const queue = [
  {
    title: mediaSubmissions[0].name,
    meta: `${mediaSubmissions[0].eventName} · ${mediaSubmissions[0].submitted}`,
    type: "Media review",
    tone: "cyan",
    href: `/organizer/media/${mediaSubmissions[0].id}`,
    icon: Image,
  },
  {
    title: socialSubmissions[0].title,
    meta: `${socialSubmissions[0].eventName} · ${socialSubmissions[0].proposedDate}`,
    type: "Social request",
    tone: "pink",
    href: `/organizer/social/${socialSubmissions[0].id}`,
    icon: Share2,
  },
  {
    title: organizerEvents[1].name,
    meta: `${organizerEvents[1].organization} · partner edits returned`,
    type: "Event update",
    tone: "yellow",
    href: `/organizer/events/${organizerEvents[1].id}`,
    icon: CalendarDays,
  },
];

export default function OrganizerDashboard() {
  const [, navigate] = useLocation();
  const pendingMedia = mediaSubmissions.filter((item) => item.status === "Pending").length;
  const pendingSocial = socialSubmissions.filter((item) => item.status === "Pending").length;

  return (
    <OrganizerShell>
      <main className="organizer-canvas">
        <section className="organizer-page-head">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Program operations</p>
            <h1>Good morning, Lena.</h1>
            <p>Here’s the community event program at a glance—and the work that needs a decision today.</p>
          </div>
          <div className="organizer-head-date"><Clock3 size={16} /><span><strong>Monday, Apr 14</strong><small>Program review window</small></span></div>
        </section>

        <section className="organizer-command-card">
          <div className="organizer-command-copy">
            <p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> At a glance</p>
            <h2>Keep every community event <em>on route.</em></h2>
            <p>Forty-two events are now moving through the 2026 program. Four organizer actions can unlock the next partner step.</p>
            <button type="button" className="organizer-command-link" onClick={() => navigate("/organizer/media")}>Open review queue <ArrowUpRight size={17} /></button>
          </div>
          <div className="organizer-command-route" aria-hidden="true">
            <span className="command-route-node command-route-node--cyan">01</span><i /><span className="command-route-node command-route-node--yellow">02</span><i /><span className="command-route-node command-route-node--pink">03</span>
            <small>Submit <b>→</b> Review <b>→</b> Live</small>
          </div>
        </section>

        <section className="organizer-kpis" aria-label="Community event KPIs">
          <article className="organizer-kpi organizer-kpi--cyan">
            <span className="organizer-kpi-icon"><CalendarDays size={20} /></span>
            <div><strong>42</strong><span>Events registered</span></div>
            <small>+6 since last week</small>
          </article>
          <article className="organizer-kpi organizer-kpi--yellow">
            <span className="organizer-kpi-icon"><MessageSquareText size={20} /></span>
            <div><strong>17</strong><span>Pending partner action</span></div>
            <small>Details, media, or social edits</small>
          </article>
          <article className="organizer-kpi organizer-kpi--pink">
            <span className="organizer-kpi-icon"><ClipboardCheck size={20} /></span>
            <div><strong>{pendingMedia + pendingSocial}</strong><span>Pending admin action</span></div>
            <small>{pendingMedia} media · {pendingSocial} social</small>
          </article>
          <article className="organizer-kpi organizer-kpi--lime">
            <span className="organizer-kpi-icon"><CheckCircle2 size={20} /></span>
            <div><strong>25</strong><span>Events approved or live</span></div>
            <small>60% of registered events</small>
          </article>
        </section>

        <section className="organizer-overview-grid">
          <article className="organizer-queue-panel">
            <div className="organizer-section-heading">
              <div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Needs your eye</p><h2>Decision queue</h2></div>
              <button type="button" className="organizer-text-link" onClick={() => navigate("/organizer/media")}>View all <ArrowUpRight size={15} /></button>
            </div>
            <div className="organizer-queue-list">
              {queue.map(({ title, meta, type, tone, href, icon: Icon }) => (
                <button type="button" className="organizer-queue-item" key={title} onClick={() => navigate(href)}>
                  <span className={`organizer-queue-icon organizer-queue-icon--${tone}`}><Icon size={17} /></span>
                  <span className="organizer-queue-copy"><strong>{title}</strong><small>{meta}</small></span>
                  <span className={`organizer-queue-type organizer-queue-type--${tone}`}>{type}</span>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
          </article>

          <article className="organizer-status-panel">
            <div className="organizer-section-heading"><div><p className="eyebrow"><span className="eyebrow-dot" /> Flow of work</p><h2>Event stages</h2></div><Sparkles size={20} /></div>
            <div className="organizer-status-list">
              {Object.entries(eventStatusCounts).map(([status, count]) => {
                const percent = Math.round((count / 42) * 100);
                const tone = status === "In review" ? "cyan" : status === "Needs edits" ? "pink" : status === "Approved" ? "lime" : "yellow";
                return <div className="organizer-status-row" key={status}>
                  <div><span className={`organizer-status-dot organizer-status-dot--${tone}`} /><strong>{status}</strong><b>{count}</b></div>
                  <span className="organizer-status-bar"><i className={`organizer-status-fill organizer-status-fill--${tone}`} style={{ width: `${percent}%` }} /></span>
                </div>;
              })}
            </div>
          </article>
        </section>

        <section className="organizer-activity-strip">
          <p><span className="organizer-activity-live" />Live program pulse</p>
          <span>9 updates since Friday</span><i />
          <span>Next review huddle: 2:30 PM</span><i />
          <span>Community event kick-off: Sep 16</span>
        </section>
      </main>
    </OrganizerShell>
  );
}
