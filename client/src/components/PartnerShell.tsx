/**
 * Gallery Operations design reminder:
 * Keep the persistent near-black Black Tech Week rail as a branded wayfinding system.
 * Cyan denotes program context, yellow moves a partner forward, and pink/lime remain secondary signals.
 */
import { useState, type ReactNode } from "react";
import { Bell, CalendarDays, CircleHelp, Home, ImagePlus, Menu, MoreHorizontal, Share2, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const navItems = [
  { label: "Overview", href: "/", icon: Home },
  { label: "My event", href: "/my-event", icon: CalendarDays },
  { label: "Media library", href: "/media-library", icon: ImagePlus },
  { label: "Social requests", href: "/social-requests", icon: Share2 },
  { label: "Updates", href: "/updates", icon: Bell, badge: "2" },
];

export default function PartnerShell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const activePath = location === "/" ? "/" : location.replace(/\/$/, "");

  const navigateTo = (href: string) => {
    navigate(href);
    setMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`side-rail ${menuOpen ? "side-rail--open" : ""}`} aria-label="Partner portal navigation">
        <div className="rail-top">
          <button className="brand brand-button" onClick={() => navigateTo("/")} type="button" aria-label="Black Tech Week Partner Portal home">
            <img src="/manus-storage/btw-signal-mark_21d97402.png" alt="" className="brand-mark" />
            <span className="brand-type">BLACK<br />TECH WEEK</span>
          </button>
          <p className="rail-edition">BTW 2026<br /><span>CINCINNATI, OH</span></p>

          <div className="program-switcher">
            <span className="switcher-kicker">Partner portal</span>
            <button className="switcher-button" type="button" onClick={() => toast("Organization switcher coming soon")}><span>Kindred Futures</span><span aria-hidden>⌄</span></button>
          </div>

          <nav className="rail-nav">
            {navItems.map(({ label, href, icon: Icon, badge }) => {
              const active = activePath === href;
              return <button className={`rail-link ${active ? "rail-link--active" : ""}`} key={href} type="button" onClick={() => navigateTo(href)}>
                <Icon size={18} strokeWidth={active ? 2.2 : 1.85} /><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}
              </button>;
            })}
          </nav>
        </div>

        <div className="rail-bottom">
          <button className="help-link" type="button" onClick={() => toast("Support center coming soon")}><CircleHelp size={18} />Help center</button>
          <button className="partner-card" type="button" onClick={() => toast("Partner profile settings coming soon")}>
            <span className="avatar avatar--partner">KF</span><span className="partner-name">Camille Jones<small>Event partner</small></span><MoreHorizontal size={18} />
          </button>
        </div>
      </aside>

      <div className="content-shell">
        <header className="mobile-bar">
          <button className="brand brand--mobile brand-button" type="button" onClick={() => navigateTo("/")} aria-label="Black Tech Week Partner Portal home">
            <img src="/manus-storage/btw-signal-mark_21d97402.png" alt="" className="brand-mark" /><span className="brand-type">BLACK<br />TECH WEEK</span>
          </button>
          <button className="menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </header>
        {children}
        <footer className="page-footer"><span>Black Tech Week Community Events</span><span>Need a hand? <button type="button" onClick={() => toast("Support contact coming soon")}>Contact the team</button></span></footer>
      </div>
    </div>
  );
}
