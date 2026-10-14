/**
 * Gallery Operations design reminder:
 * Keep the persistent near-black Black Tech Week rail as a branded wayfinding system.
 * Cyan denotes program context, yellow moves a partner forward, and pink/lime remain secondary signals.
 */
import { useState, type ReactNode } from "react";
import { Bell, BookOpen, Building2, CalendarDays, CircleHelp, Home, ImagePlus, LogOut, Menu, MoreHorizontal, Share2, X } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePrimaryEvent } from "@/lib/portal";

const navItems = [
  { label: "Overview", href: "/", icon: Home },
  { label: "My event", href: "/my-event", icon: CalendarDays },
  { label: "Organizer details", href: "/partner/organizer", icon: Building2 },
  { label: "Guidelines", href: "/guidelines", icon: BookOpen },
  { label: "Media library", href: "/media-library", icon: ImagePlus },
  { label: "Social requests", href: "/social-requests", icon: Share2 },
  { label: "Updates", href: "/updates", icon: Bell, badge: "2" },
];

export default function PartnerShell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { event } = usePrimaryEvent();
  const activePath = location === "/" ? "/" : location.replace(/\/$/, "");
  const organizationName = event?.organizer.companyName || "Your organization";
  const accountName = user?.displayName || user?.email || "Partner account";
  const initials = accountName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PP";

  const navigateTo = (href: string) => {
    navigate(href);
    setMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className={`side-rail ${menuOpen ? "side-rail--open" : ""}`} aria-label="Partner portal navigation">
        <div className="rail-top">
          <button className="brand brand-button" onClick={() => navigateTo("/")} type="button" aria-label="Black Tech Week Partner Portal home">
            <img src="/assets/btw-yellow-logo.png" alt="Black Tech Week" className="brand-logo" />
          </button>
          <p className="rail-edition">BTW 2026<br /><span>CINCINNATI, OH</span></p>

          <div className="program-switcher">
            <span className="switcher-kicker">Partner portal</span>
            <button className="switcher-button" type="button" onClick={() => toast("Organization switcher coming soon")}><span>{organizationName}</span><span aria-hidden>⌄</span></button>
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
          <div className="profile-menu">
            <button className="partner-card" type="button" onClick={() => setProfileMenuOpen((isOpen) => !isOpen)} aria-expanded={profileMenuOpen} aria-controls="partner-profile-menu">
              <span className="avatar avatar--partner">{initials}</span><span className="partner-name">{accountName}<small>Event partner</small></span><MoreHorizontal size={18} />
            </button>
            {profileMenuOpen && <div className="profile-menu-popover" id="partner-profile-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => void signOut()}><LogOut size={16} />Sign out</button>
            </div>}
          </div>
        </div>
      </aside>

      <div className="content-shell">
        <header className="mobile-bar">
          <button className="brand brand--mobile brand-button" type="button" onClick={() => navigateTo("/")} aria-label="Black Tech Week Partner Portal home">
            <img src="/assets/btw-yellow-logo.png" alt="Black Tech Week" className="brand-logo" />
          </button>
          <button className="menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </header>
        {children}
        <footer className="page-footer"><span>Black Tech Week Community Events</span><span>Need a hand? <button type="button" onClick={() => toast("Support contact coming soon")}>Contact the team</button></span></footer>
      </div>
    </div>
  );
}
