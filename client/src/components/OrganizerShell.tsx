import { useState, type ReactNode } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardCheck,
  House,
  LogOut,
  Menu,
  MoreHorizontal,
  ShieldCheck,
  Share2,
  X,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Overview", href: "/organizer", icon: House },
  { label: "Events", href: "/organizer/events", icon: CalendarDays, badge: "17" },
  { label: "Media review", href: "/organizer/media", icon: ClipboardCheck, badge: "2" },
  { label: "Social review", href: "/organizer/social", icon: Share2, badge: "2" },
];

export default function OrganizerShell({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const activePath = location.replace(/\/$/, "") || "/organizer";

  const navigateTo = (href: string) => {
    navigate(href);
    setMenuOpen(false);
  };
  const accountName = user?.displayName || user?.email || "Lightship team";
  const initials = accountName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "LT";

  return (
    <div className="organizer-shell">
      <aside className={`organizer-rail ${menuOpen ? "organizer-rail--open" : ""}`} aria-label="Organizer portal navigation">
        <div className="organizer-rail-top">
          <button className="organizer-brand" onClick={() => navigateTo("/organizer")} type="button" aria-label="Black Tech Week organizer portal home">
            <img src="/assets/btw-signal-mark.webp" alt="" className="brand-mark" />
            <span className="brand-type">BLACK<br />TECH WEEK</span>
          </button>
          <p className="organizer-edition">BTW 2026 <span>• COMMUNITY EVENTS</span></p>

          <div className="organizer-role-card">
            <span className="organizer-role-icon"><ShieldCheck size={16} /></span>
            <span><small>Workspace</small><strong>Organizer control room</strong></span>
          </div>

          <nav className="organizer-nav">
            {navItems.map(({ label, href, icon: Icon, badge }) => {
              const active = activePath === href;
              return (
                <button className={`organizer-nav-link ${active ? "organizer-nav-link--active" : ""}`} key={href} type="button" onClick={() => navigateTo(href)}>
                  <Icon size={18} strokeWidth={active ? 2.4 : 1.9} />
                  <span>{label}</span>
                  {badge && <span className="organizer-nav-badge">{badge}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="organizer-rail-bottom">
          <button className="organizer-helper" type="button" onClick={() => toast("Organizer support routing coming soon")}><CircleHelp size={17} />Review guidelines</button>
          <div className="profile-menu profile-menu--organizer">
            <button className="organizer-person" type="button" onClick={() => setProfileMenuOpen((isOpen) => !isOpen)} aria-expanded={profileMenuOpen} aria-controls="organizer-profile-menu">
              <span className="organizer-avatar">{initials}</span>
              <span><strong>{accountName}</strong><small>Program operations</small></span>
              <MoreHorizontal size={18} />
            </button>
            {profileMenuOpen && <div className="profile-menu-popover profile-menu-popover--organizer" id="organizer-profile-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => { setProfileMenuOpen(false); void signOut(); }}><LogOut size={16} />Sign out</button>
            </div>}
          </div>
        </div>
      </aside>

      <div className="organizer-content">
        <header className="organizer-mobile-bar">
          <button className="organizer-brand" type="button" onClick={() => navigateTo("/organizer")} aria-label="Black Tech Week organizer portal home">
            <img src="/assets/btw-signal-mark.webp" alt="" className="brand-mark" />
            <span className="brand-type">BLACK<br />TECH WEEK</span>
          </button>
          <button className="organizer-menu-button" type="button" aria-label="Toggle organizer navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </header>

        <div className="organizer-topbar">
          <div className="organizer-topbar-route"><span className="organizer-topbar-dot" />Community events <i /> Organizer view</div>
          <div className="organizer-topbar-actions">
            <button type="button" className="organizer-partner-link" onClick={() => navigateTo("/login")}>Switch workspace <ChevronDown size={14} /></button>
            <button type="button" className="organizer-notification" aria-label="View organizer notifications" onClick={() => toast("3 items have moved into your review queue")}><Bell size={18} /><span /></button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
