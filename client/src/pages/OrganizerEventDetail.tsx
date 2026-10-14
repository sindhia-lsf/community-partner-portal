import OrganizerShell from "@/components/OrganizerShell";
import { ArrowLeft, CalendarDays, Image, MapPin, Share2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { eventDate, eventTime, titleCase } from "@/lib/portal";
import { reviewEvent, useOrganizerEvent } from "@/lib/organizer";
import { toast } from "sonner";

export default function OrganizerEventDetail() {
  const [, params] = useRoute("/organizer/events/:id"); const [, navigate] = useLocation();
  const { data: event, loading, error, refresh } = useOrganizerEvent(params?.id);
  const setState = async (state: string) => { if (!event) return; try { await reviewEvent(event.id, state); await refresh(); toast(`Event marked ${titleCase(state)}.`); } catch (caught) { toast.error(caught instanceof Error ? caught.message : "Unable to update event."); } };
  if (loading) return <OrganizerShell><main className="organizer-canvas">Loading event…</main></OrganizerShell>;
  if (!event) return <OrganizerShell><main className="organizer-canvas"><div className="organizer-empty-state"><strong>{error || "Event not found."}</strong></div></main></OrganizerShell>;
  return <OrganizerShell><main className="organizer-canvas organizer-detail-canvas"><button className="organizer-back-link" type="button" onClick={() => navigate("/organizer/events")}><ArrowLeft size={16} />All events</button><section className="organizer-review-detail-head"><div><p className="eyebrow"><span className="eyebrow-dot" /> {event.organizer.companyName}</p><h1>{event.title}</h1><p>{event.description || "No description provided."}</p></div><span className={`organizer-status-chip organizer-status-chip--${event.eventStatus.replace(/_/g, "-")}`}>{titleCase(event.eventStatus)}</span></section>
    <section className="organizer-review-detail-grid"><article className="organizer-media-preview-panel"><div className="organizer-caption-block"><div><span><CalendarDays size={15} /> Schedule</span><p>{eventDate(event.startsAt)} · {eventTime(event.startsAt)} to {eventTime(event.endsAt)}</p></div></div><div className="organizer-caption-block"><div><span><MapPin size={15} /> Venue</span><p>{event.venueName || "Location pending"}{event.city ? ` · ${event.city}` : ""}</p></div></div><div className="organizer-caption-block"><div><span><Image size={15} /> Media</span><p>{event.mediaCount} submissions; {event.pendingMediaCount} pending review.</p></div></div><div className="organizer-caption-block"><div><span><Share2 size={15} /> Social</span><p>{event.socialCount} requests; {event.pendingSocialCount} pending review.</p></div></div></article><aside className="organizer-decision-panel"><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Event review</p><h2>Set the next owner.</h2><p>Every change is recorded in the portal audit trail.</p></div><div className="organizer-decision-actions"><button className="organizer-decision organizer-decision--approve" onClick={() => void setState("approved")}>Approve</button><button className="organizer-decision organizer-decision--changes" onClick={() => void setState("changes_needed")}>Request changes</button><button className="organizer-decision organizer-decision--reject" onClick={() => void setState("not_moving_forward")}>Do not move forward</button></div></aside></section>
  </main></OrganizerShell>;
}
