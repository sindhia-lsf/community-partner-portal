import OrganizerShell from "@/components/OrganizerShell";
import { mediaSubmissions, organizerEvents, socialSubmissions, type EventStatus } from "@/data/organizerMockData";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Clock3, ExternalLink, FileText, Image, Mail, MapPin, MessageSquareText, Share2, Users } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s/g, "-");
}

export default function OrganizerEventDetail() {
  const [, params] = useRoute("/organizer/events/:id");
  const [, navigate] = useLocation();
  const event = organizerEvents.find((item) => item.id === params?.id) ?? organizerEvents[0];
  const [status, setStatus] = useState<EventStatus>(event.status);
  const [note, setNote] = useState(event.adminNote ?? "");
  const relatedMedia = mediaSubmissions.filter((item) => item.eventId === event.id);
  const relatedSocial = socialSubmissions.filter((item) => item.eventId === event.id);

  const updateStatus = (nextStatus: EventStatus) => {
    setStatus(nextStatus);
    toast(nextStatus === "Approved" ? "Event approved and moved to the next stage" : "Change request sent to the event partner");
  };

  return (
    <OrganizerShell>
      <main className="organizer-canvas organizer-detail-canvas">
        <button className="organizer-back-link" type="button" onClick={() => navigate("/organizer/events")}><ArrowLeft size={16} />All events</button>

        <section className="organizer-event-hero">
          <div className="organizer-event-hero-main">
            <div className="organizer-event-hero-kicker"><span className={`organizer-event-number organizer-event-number--${event.color}`}>01</span><span>{event.code}</span><i /> Community event</div>
            <h1>{event.name}</h1>
            <p>{event.description}</p>
            <div className="organizer-event-hero-meta"><span><CalendarDays size={16} />{event.date} · {event.time}</span><span><MapPin size={16} />{event.venue}</span><span><Users size={16} />{event.capacity} guests</span></div>
          </div>
          <aside className="organizer-event-hero-side">
            <span>Event status</span>
            <strong className={`organizer-status-chip organizer-status-chip--${statusClass(status)}`}>{status}</strong>
            <p>{status === "Approved" ? "Approved events can move into their launch sequence." : "Use your review to tell the partner what will unlock the next stage."}</p>
            <div className="organizer-event-actions">
              <button type="button" className="organizer-action-button organizer-action-button--approve" onClick={() => updateStatus("Approved")}><Check size={16} />Approve event</button>
              <button type="button" className="organizer-action-button organizer-action-button--changes" onClick={() => updateStatus("Needs edits")}>Request edits</button>
            </div>
          </aside>
        </section>

        <section className="organizer-event-detail-grid">
          <article className="organizer-event-record">
            <div className="organizer-section-heading"><div><p className="eyebrow"><span className="eyebrow-dot" /> Partner submission</p><h2>Event details</h2></div><span className="organizer-record-format">{event.format}</span></div>
            <div className="organizer-event-detail-list">
              <div><CalendarDays size={17} /><span><small>Date & time</small><strong>{event.date} · {event.time}</strong></span></div>
              <div><MapPin size={17} /><span><small>Location</small><strong>{event.venue}, {event.city}</strong></span></div>
              <div><Users size={17} /><span><small>Capacity</small><strong>{event.capacity} guests · {event.format}</strong></span></div>
              <div><ExternalLink size={17} /><span><small>RSVP destination</small><strong>{event.rsvp}</strong></span></div>
              <div><Mail size={17} /><span><small>Partner contact</small><strong>{event.contact} · {event.email}</strong></span></div>
              <div><FileText size={17} /><span><small>Program category</small><strong>{event.category}</strong></span></div>
            </div>
          </article>

          <article className="organizer-note-panel">
            <div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Internal note to partner</p><h2>Move the event forward.</h2></div>
            <textarea value={note} onChange={(item) => setNote(item.target.value)} aria-label="Event review note" placeholder="Add a concise note for the event partner…" />
            <div><span><Clock3 size={14} />Partner receives a notification</span><button type="button" onClick={() => toast("Review note sent to the event partner")}>Send note <ArrowUpRight size={15} /></button></div>
          </article>
        </section>

        <section className="organizer-related-grid">
          <article className="organizer-related-panel">
            <div className="organizer-section-heading"><div><p className="eyebrow"><span className="eyebrow-dot" /> Submitted files</p><h2>Media submissions</h2></div><button className="organizer-text-link" type="button" onClick={() => navigate("/organizer/media")}>All media <ArrowUpRight size={15} /></button></div>
            <div className="organizer-related-list">
              {relatedMedia.length ? relatedMedia.map((submission) => <button key={submission.id} type="button" onClick={() => navigate(`/organizer/media/${submission.id}`)}><span className={`organizer-mini-visual organizer-mini-visual--${submission.color}`}><Image size={17} /></span><span><strong>{submission.name}</strong><small>{submission.format} · {submission.submitted}</small></span><em className={`organizer-status-chip organizer-status-chip--${statusClass(submission.status)}`}>{submission.status}</em><ArrowUpRight size={16} /></button>) : <div className="organizer-related-empty">No media has been submitted for this event yet.</div>}
            </div>
          </article>

          <article className="organizer-related-panel">
            <div className="organizer-section-heading"><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Collaboration</p><h2>Social requests</h2></div><button className="organizer-text-link" type="button" onClick={() => navigate("/organizer/social")}>All social <ArrowUpRight size={15} /></button></div>
            <div className="organizer-related-list">
              {relatedSocial.length ? relatedSocial.map((submission) => <button key={submission.id} type="button" onClick={() => navigate(`/organizer/social/${submission.id}`)}><span className={`organizer-mini-visual organizer-mini-visual--${submission.color}`}><Share2 size={17} /></span><span><strong>{submission.title}</strong><small>{submission.platform} · {submission.requestType}</small></span><em className={`organizer-status-chip organizer-status-chip--${statusClass(submission.status)}`}>{submission.status}</em><ArrowUpRight size={16} /></button>) : <div className="organizer-related-empty">No social requests have been submitted for this event yet.</div>}
            </div>
          </article>
        </section>

        <section className="organizer-event-history">
          <MessageSquareText size={17} /><span><strong>Latest activity</strong> {event.contact} submitted their event record on {event.submitted}. <button type="button" onClick={() => toast("Full event activity history coming soon")}>View full history</button></span>
        </section>
      </main>
    </OrganizerShell>
  );
}
