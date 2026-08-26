/**
 * Gallery Operations design reminder:
 * Event fields should read like a confident civic program card: clear, print-led, and action-forward.
 */
import { useState } from "react";
import { CalendarDays, Check, Clock3, Edit3, ExternalLink, MapPin, Save, Ticket, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PartnerShell from "@/components/PartnerShell";

type EventForm = {
  name: string; contact: string; email: string; date: string; start: string; end: string; venue: string; address: string; description: string; access: "Free" | "Ticketed"; capacity: string; rsvp: string; price: string;
};

const initialEvent: EventForm = {
  name: "Build With Us: AI × Community", contact: "Camille Jones", email: "camille@kindredfutures.org", date: "September 18, 2026", start: "6:00 PM", end: "8:30 PM", venue: "The Annex at Findlay Market", address: "1801 Race Street, Cincinnati, OH 45202", description: "A hands-on gathering exploring the tools, questions, and communities shaping more equitable technology.", access: "Free", capacity: "85 guests", rsvp: "kindredfutures.org/build-with-us", price: "",
};

function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="form-field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}

export default function MyEvent() {
  const [event, setEvent] = useState(initialEvent);
  const [editing, setEditing] = useState(false);
  const update = (key: keyof EventForm, value: string) => setEvent((current) => ({ ...current, [key]: value }));
  const save = () => { setEditing(false); toast.success("Event updates saved", { description: "This mockup stores your changes locally until refresh." }); };

  return <PartnerShell>
    <main className="portal-canvas" id="my-event">
      <section className="page-masthead">
        <div><p className="eyebrow"><span className="eyebrow-dot" /> Event record</p><h1>My event</h1><p>Keep your public event information accurate and ready for review.</p></div>
        {!editing ? <Button className="portal-primary" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit event</Button> : <div className="edit-actions"><button className="subtle-button" type="button" onClick={() => { setEvent(initialEvent); setEditing(false); }}>Cancel <X size={15} /></button><Button className="portal-primary" onClick={save}><Save size={16} /> Save changes</Button></div>}
      </section>
      <div className="page-route" aria-label="Event progress: details confirmed, in review, upload final media next"><span className="page-route__node page-route__node--program" /><strong>Event details</strong><i /><span className="page-route__node page-route__node--review" /><strong>In review</strong><i /><span className="page-route__node page-route__node--action" /><strong>Next: final media</strong></div>

      {!editing ? <section className="event-record-grid">
        <article className="event-record-main">
          <div className="record-title"><span className="record-number">01</span><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Community event</p><h2>{event.name}</h2></div></div>
          <p className="record-description">{event.description}</p>
          <div className="detail-grid">
            <div className="detail-item"><CalendarDays size={18} /><div><span>Date</span><strong>{event.date}</strong></div></div>
            <div className="detail-item"><Clock3 size={18} /><div><span>Time</span><strong>{event.start} – {event.end}</strong></div></div>
            <div className="detail-item"><MapPin size={18} /><div><span>Location</span><strong>{event.venue}</strong><small>{event.address}</small></div></div>
            <div className="detail-item"><Users size={18} /><div><span>Capacity</span><strong>{event.capacity}</strong></div></div>
          </div>
        </article>
        <aside className="event-record-side">
          <span className="record-label">Public access</span><h3>{event.access}</h3><p>{event.access === "Ticketed" ? `${event.price || "Price to be added"} per guest` : "No cost to attend"}</p>
          <a href={`https://${event.rsvp}`} target="_blank" rel="noreferrer" className="rsvp-link"><Ticket size={16} /> RSVP link <ExternalLink size={15} /></a>
          <div className="contact-block"><span>Primary contact</span><strong>{event.contact}</strong><a href={`mailto:${event.email}`}>{event.email}</a></div>
          <div className="record-progress"><span className="record-label">Current review path</span><strong><span className="route-live-dot" /> In review</strong><p>Next move: upload the final event graphic so we can complete your approval.</p></div>
          <div className="approval-note"><Check size={16} /> This information is visible to the Black Tech Week review team.</div>
        </aside>
      </section> : <form className="event-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <section className="form-section"><div className="form-section-title"><span>01</span><div><h2>Program details</h2><p>Use the same language you want attendees to see.</p></div></div><div className="form-grid"><Field label="Event name" value={event.name} onChange={(v) => update("name", v)} /><Field label="Event date" value={event.date} onChange={(v) => update("date", v)} /><Field label="Start time" value={event.start} onChange={(v) => update("start", v)} /><Field label="End time" value={event.end} onChange={(v) => update("end", v)} /><Field label="Venue name" value={event.venue} onChange={(v) => update("venue", v)} /><Field label="Venue address" value={event.address} onChange={(v) => update("address", v)} /></div><label className="form-field form-field--wide"><span>Event description</span><textarea value={event.description} onChange={(e) => update("description", e.target.value)} rows={5} /></label></section>
        <section className="form-section"><div className="form-section-title"><span>02</span><div><h2>Attendance & access</h2><p>Help us set clear attendee expectations.</p></div></div><div className="form-grid"><label className="form-field"><span>Admission</span><select value={event.access} onChange={(e) => update("access", e.target.value)}><option>Free</option><option>Ticketed</option></select></label>{event.access === "Ticketed" ? <Field label="Ticket price" value={event.price} onChange={(v) => update("price", v)} placeholder="$25" /> : <Field label="Capacity" value={event.capacity} onChange={(v) => update("capacity", v)} />}{event.access === "Ticketed" && <Field label="Capacity" value={event.capacity} onChange={(v) => update("capacity", v)} />}<Field label="RSVP link" value={event.rsvp} onChange={(v) => update("rsvp", v)} /></div></section>
        <section className="form-section"><div className="form-section-title"><span>03</span><div><h2>Partner contact</h2><p>Our team will use this contact for review updates.</p></div></div><div className="form-grid"><Field label="Contact name" value={event.contact} onChange={(v) => update("contact", v)} /><Field label="Contact email" value={event.email} onChange={(v) => update("email", v)} type="email" /></div></section>
        <div className="form-save-bar"><p>Changes are saved to this prototype only.</p><Button className="portal-primary" type="submit"><Save size={16} /> Save changes</Button></div>
      </form>}
    </main>
  </PartnerShell>;
}
