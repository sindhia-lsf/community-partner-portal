import OrganizerShell from "@/components/OrganizerShell";
import { ArrowUpRight, CalendarDays, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { eventDate, eventTime, titleCase } from "@/lib/portal";
import { useOrganizerEvents } from "@/lib/organizer";

export default function OrganizerEvents() {
  const [query, setQuery] = useState(""); const [, navigate] = useLocation();
  const { data, loading, error } = useOrganizerEvents();
  const events = useMemo(() => (data || []).filter((event) => `${event.title} ${event.organizer.companyName} ${event.city || ""}`.toLowerCase().includes(query.toLowerCase())), [data, query]);
  return <OrganizerShell><main className="organizer-canvas"><section className="organizer-page-head organizer-page-head--events"><div><p className="eyebrow"><span className="eyebrow-dot" /> Community events</p><h1>Every event, in one view.</h1><p>Live registrations, workflow states, submitted media, and social requests.</p></div><div className="organizer-head-stat"><strong>{loading ? "—" : data?.length || 0}</strong><span>registered events</span></div></section>
    <section className="organizer-events-toolbar"><label className="organizer-search"><Search size={18} /><span className="sr-only">Search events</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search event or organization" /></label><span className="organizer-results-count">Showing <strong>{events.length}</strong> events</span></section>
    {error && <div className="organizer-empty-state"><strong>{error}</strong></div>}
    <section className="organizer-events-table"><div className="organizer-events-table-head"><span>Event</span><span>Status</span><span>When & where</span><span>Activity</span><span /></div><div className="organizer-events-table-body">{events.map((event, index) => <article className="organizer-event-row" key={event.id}><div className="organizer-event-identity"><span className="organizer-event-number organizer-event-number--cyan">{String(index + 1).padStart(2, "0")}</span><span><strong>{event.title}</strong><small>{event.organizer.companyName}</small></span></div><div><span className={`organizer-status-chip organizer-status-chip--${event.eventStatus.replace(/_/g, "-")}`}>{titleCase(event.eventStatus)}</span><small className="organizer-submitted">Pending on {event.pipeline.pendingOn}</small></div><div className="organizer-event-location"><span><CalendarDays size={14} />{eventDate(event.startsAt)} · {eventTime(event.startsAt)}</span><small><MapPin size={14} />{event.venueName || event.city || "Location pending"}</small></div><div className="organizer-event-activity"><span>{event.mediaCount} media · {event.socialCount} social</span><small>{event.pendingMediaCount + event.pendingSocialCount} reviews pending</small></div><button className="organizer-view-button" type="button" onClick={() => navigate(`/organizer/events/${event.id}`)}>View event <ArrowUpRight size={16} /></button></article>)}</div>{!loading && !events.length && <div className="organizer-empty-state"><strong>No live events match this view.</strong></div>}</section>
  </main></OrganizerShell>;
}
