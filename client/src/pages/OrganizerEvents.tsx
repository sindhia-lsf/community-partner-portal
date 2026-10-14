import OrganizerShell from "@/components/OrganizerShell";
import { organizerEvents, type EventStatus } from "@/data/organizerMockData";
import { ArrowUpRight, CalendarDays, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const statuses: Array<EventStatus | "All statuses"> = ["All statuses", "In review", "Needs edits", "Approved", "Live"];

export default function OrganizerEvents() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<EventStatus | "All statuses">("All statuses");
  const [format, setFormat] = useState("All formats");
  const [, navigate] = useLocation();

  const visibleEvents = useMemo(() => organizerEvents.filter((event) => {
    const searchable = `${event.name} ${event.organization} ${event.city} ${event.code}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (status === "All statuses" || event.status === status) && (format === "All formats" || event.format === format);
  }), [format, query, status]);

  return (
    <OrganizerShell>
      <main className="organizer-canvas">
        <section className="organizer-page-head organizer-page-head--events">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Community events</p>
            <h1>Every event, in one view.</h1>
            <p>Filter through registrations, understand where work is waiting, and open any event for its details, media, and social requests.</p>
          </div>
          <div className="organizer-head-stat"><strong>42</strong><span>registered events<br />for BTW 2026</span></div>
        </section>

        <section className="organizer-events-toolbar" aria-label="Event filters">
          <label className="organizer-search"><Search size={18} /><span className="sr-only">Search events</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search event, partner, or code" /></label>
          <label className="organizer-filter"><SlidersHorizontal size={16} /><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value as EventStatus | "All statuses")}>{statuses.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          <label className="organizer-filter"><CalendarDays size={16} /><span className="sr-only">Filter by format</span><select value={format} onChange={(event) => setFormat(event.target.value)}><option value="All formats">All formats</option><option value="In person">In person</option><option value="Hybrid">Hybrid</option><option value="Virtual">Virtual</option></select></label>
          <span className="organizer-results-count">Showing <strong>{visibleEvents.length}</strong> of 42 events</span>
        </section>

        <section className="organizer-events-table" aria-label="Registered community events">
          <div className="organizer-events-table-head"><span>Event</span><span>Status</span><span>When & where</span><span>Program activity</span><span><span className="sr-only">Actions</span></span></div>
          <div className="organizer-events-table-body">
            {visibleEvents.map((event, index) => (
              <article className="organizer-event-row" key={event.id}>
                <div className="organizer-event-identity">
                  <span className={`organizer-event-number organizer-event-number--${event.color}`}>{String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{event.name}</strong><small>{event.organization} <i>·</i> {event.code}</small></span>
                </div>
                <div><span className={`organizer-status-chip organizer-status-chip--${event.status.toLowerCase().replace(/\s/g, "-")}`}>{event.status}</span><small className="organizer-submitted">Submitted {event.submitted}</small></div>
                <div className="organizer-event-location"><span><CalendarDays size={14} />{event.date} · {event.time}</span><small><MapPin size={14} />{event.venue}</small></div>
                <div className="organizer-event-activity"><span><Users size={14} />{event.capacity} cap.</span><small>{event.mediaCount} media · {event.socialCount} social</small></div>
                <button className="organizer-view-button" type="button" onClick={() => navigate(`/organizer/events/${event.id}`)}>View event <ArrowUpRight size={16} /></button>
              </article>
            ))}
          </div>
          {visibleEvents.length === 0 && <div className="organizer-empty-state"><strong>No events match these filters.</strong><span>Try clearing the search or choosing another status.</span></div>}
        </section>
      </main>
    </OrganizerShell>
  );
}
