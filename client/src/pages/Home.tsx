/**
 * Gallery Operations design reminder:
 * Warm ivory program board, deep-forest navigation, editorial serif moments,
 * and Momentum Orange route cues. Every element should make the partner's next step clear.
 */
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Home as HomeIcon,
  ImagePlus,
  LayoutList,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Overview", icon: HomeIcon, active: true },
  { label: "My event", icon: CalendarDays },
  { label: "Media library", icon: ImagePlus },
  { label: "Updates", icon: Bell, badge: "2" },
];

const milestones = [
  { label: "Submitted", note: "Apr 11", state: "done" },
  { label: "In review", note: "Now", state: "active" },
  { label: "Approved", note: "Up next", state: "pending" },
  { label: "Live", note: "Sep 18", state: "pending" },
];

const updates = [
  {
    type: "comment",
    label: "Organizer note",
    time: "Today, 10:24 AM",
    copy: "The event brief is looking strong. Please add the final social graphic so we can complete review.",
  },
  {
    type: "status",
    label: "Status updated",
    time: "Yesterday",
    copy: "Your event moved from Submitted to In review.",
  },
];

function Notice({ children }: { children: React.ReactNode }) {
  return <span className="program-label">{children}</span>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState(false);

  const announce = (message: string) => {
    toast(message, {
      description: "This interaction is included to demonstrate the dashboard mockup.",
    });
  };

  return (
    <div className="app-shell">
      <aside className={`side-rail ${menuOpen ? "side-rail--open" : ""}`} aria-label="Partner portal navigation">
        <div className="rail-top">
          <a className="brand" href="#overview" aria-label="Black Tech Week Partner Portal home">
            <img src="/manus-storage/btw-momentum-mark_99cca286.png" alt="" className="brand-mark" />
            <span className="brand-type">BLACK<br />TECH WEEK</span>
          </a>

          <div className="program-switcher">
            <span className="switcher-kicker">Partner portal</span>
            <button className="switcher-button" type="button" onClick={() => announce("Organization switcher coming soon")}> 
              <span>Kindred Futures</span>
              <ChevronDown size={15} strokeWidth={2.2} />
            </button>
          </div>

          <nav className="rail-nav">
            {navItems.map(({ label, icon: Icon, active, badge }) => (
              <button
                className={`rail-link ${active ? "rail-link--active" : ""}`}
                key={label}
                type="button"
                onClick={() => active ? setMenuOpen(false) : announce(`${label} view coming soon`)}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.85} />
                <span>{label}</span>
                {badge && <span className="nav-badge">{badge}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="rail-bottom">
          <button className="help-link" type="button" onClick={() => announce("Support center coming soon")}>
            <CircleHelp size={18} />
            Help center
          </button>
          <button className="partner-card" type="button" onClick={() => announce("Partner profile settings coming soon")}>
            <span className="avatar avatar--partner">KF</span>
            <span className="partner-name">Camille Jones<small>Event partner</small></span>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>

      <div className="content-shell">
        <header className="mobile-bar">
          <a className="brand brand--mobile" href="#overview" aria-label="Black Tech Week Partner Portal home">
            <img src="/manus-storage/btw-momentum-mark_99cca286.png" alt="" className="brand-mark" />
            <span className="brand-type">BLACK<br />TECH WEEK</span>
          </a>
          <button className="menu-button" type="button" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </header>

        <main id="overview" className="main-canvas">
          <section className="masthead">
            <div>
              <p className="eyebrow"><span className="eyebrow-dot" /> Partner home</p>
              <h1>Good morning, Camille.</h1>
              <p className="masthead-copy">Your event is moving. Here’s what will unlock the next stage.</p>
            </div>
            <div className="masthead-actions">
              <button className="notification-button" type="button" aria-label="View notifications" onClick={() => announce("You have two new organizer updates")}>
                <Bell size={19} />
                <span className="notification-dot" />
              </button>
              <p className="review-window"><Clock3 size={15} /> Reviews typically take <strong>2–3 days</strong></p>
            </div>
          </section>

          <section className="event-hero" aria-labelledby="event-title">
            <div className="event-hero__content">
              <div className="event-hero__meta"><Notice>Community event</Notice><span className="event-code">BTW-CE-048</span></div>
              <h2 id="event-title">Build With Us:<br /><em>AI × Community</em></h2>
              <div className="title-route" aria-label="Event workflow: in review, next action required">
                <span className="title-route__node">01</span><span className="title-route__line" /><span>In review <b>→</b> next action</span>
              </div>
              <p className="event-summary">A hands-on gathering exploring the tools, questions, and communities shaping more equitable technology.</p>
              <div className="event-detail-row">
                <span><CalendarDays size={16} /> Sep 18, 2026</span>
                <span><LayoutList size={16} /> In person</span>
              </div>
            </div>
            <div className="route-art-wrap" aria-hidden="true">
              <img src="/manus-storage/btw-partner-route-art_2c3b517b.png" alt="" className="route-art" />
              <div className="route-art__cap" />
            </div>
            <button className="event-open-button" type="button" onClick={() => announce("Event detail view coming soon")}>
              Open event <ArrowUpRight size={17} />
            </button>
          </section>

          <section className="dashboard-grid" aria-label="Event status and current action">
            <article className="progress-panel">
              <div className="section-topline">
                <div>
                  <p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Current stage</p>
                  <h3>In review</h3>
                </div>
                <span className="status-chip"><span /> Organizer review</span>
              </div>
              <p className="progress-copy">We’re reviewing your event information and will let you know if anything else is needed.</p>
              <ol className="timeline">
                {milestones.map((milestone, index) => (
                  <li className={`timeline-item timeline-item--${milestone.state}`} key={milestone.label}>
                    <span className="timeline-node">{milestone.state === "done" && <Check size={13} strokeWidth={3} />}{milestone.state === "active" && <span />}</span>
                    {index < milestones.length - 1 && <span className="timeline-line" />}
                    <div><strong>{milestone.label}</strong><small>{milestone.note}</small></div>
                  </li>
                ))}
              </ol>
              <button className="text-link" type="button" onClick={() => announce("Full application details coming soon")}>View submitted details <ChevronRight size={16} /></button>
            </article>

            <article className="action-panel">
              <div className="action-panel__shape" aria-hidden="true" />
              <p className="eyebrow"><span className="eyebrow-dot" /> Required now</p>
              <span className="action-count">01</span>
              <h3>Send your final event graphic.</h3>
              <p>Help us finish the review by sharing the event graphic you plan to publish.</p>
              <Button className="action-button" onClick={() => announce("Media upload flow coming soon")}>
                <Upload size={16} /> Upload graphic
              </Button>
              <button className="action-secondary" type="button" onClick={() => announce("Media requirements coming soon")}>See media requirements <ArrowUpRight size={15} /></button>
            </article>
          </section>

          <section className="lower-grid">
            <article className="updates-panel">
              <div className="section-heading">
                <div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> From the team</p><h3>Latest updates</h3></div>
                <button className="text-link" type="button" onClick={() => setShowAllUpdates(!showAllUpdates)}>{showAllUpdates ? "Show less" : "View all"} <ChevronRight size={16} /></button>
              </div>
              <div className="updates-list">
                {(showAllUpdates ? [...updates, { type: "message", label: "Program reminder", time: "Apr 12", copy: "Venue and access details can be refined after your event receives approval." }] : updates).map((update) => (
                  <div className="update-item" key={`${update.label}-${update.time}`}>
                    <span className={`update-icon update-icon--${update.type}`}>{update.type === "comment" ? <MessageCircle size={16} /> : update.type === "status" ? <Sparkles size={16} /> : <FileText size={16} />}</span>
                    <div className="update-copy"><div><strong>{update.label}</strong><time>{update.time}</time></div><p>{update.copy}</p></div>
                  </div>
                ))}
              </div>
            </article>

            <article className="media-panel">
              <img src="/manus-storage/btw-event-mosaic_1812937b.png" alt="Abstract event-program artwork in orange, forest green, yellow and lavender." className="media-art" />
              <div className="media-content">
                <p className="eyebrow"><span className="eyebrow-dot" /> Media library</p>
                <h3>Keep your event materials in one place.</h3>
                <p>Upload final graphics and see approval feedback from our team.</p>
                <button className="text-link" type="button" onClick={() => announce("Media library coming soon")}>Open media library <ChevronRight size={16} /></button>
              </div>
            </article>
          </section>
        </main>
        <footer className="page-footer"><span>Black Tech Week Community Events</span><span>Need a hand? <button type="button" onClick={() => announce("Support contact coming soon")}>Contact the team</button></span></footer>
      </div>
    </div>
  );
}
