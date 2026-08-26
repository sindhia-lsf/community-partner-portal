/**
 * Gallery Operations design reminder:
 * Social requests are a shared publishing route. Make the post, the request type,
 * the Black Tech Week decision, and the next useful response immediately legible.
 */
import { useMemo, useState } from "react";
import { CalendarDays, Check, ChevronRight, CircleAlert, ExternalLink, Instagram, MessageCircle, Plus, Send, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PartnerShell from "@/components/PartnerShell";

type RequestStatus = "Approved" | "Changes needed" | "In review" | "Not moving forward";
type RequestType = "Collab post" | "Reshare" | "Story mention" | "Newsletter inclusion";
type SocialRequest = { id: number; platform: "Instagram" | "LinkedIn" | "TikTok"; type: RequestType; status: RequestStatus; title: string; url: string; date: string; comment: string; accent: "pink" | "cyan" | "yellow" | "lime"; };

const initialRequests: SocialRequest[] = [
  { id: 1, platform: "Instagram", type: "Collab post", status: "Changes needed", title: "Build With Us: AI × Community — speaker callout", url: "instagram.com/p/build-with-us", date: "Sep 01, 2026", comment: "This is close. Please move the Black Tech Week lockup to the final frame and share a 4:5 export for the feed. Once updated, send the revision here and we can approve a collaboration post.", accent: "pink" },
  { id: 2, platform: "Instagram", type: "Reshare", status: "Approved", title: "Save the date — September 18", url: "instagram.com/p/save-the-date", date: "Aug 24, 2026", comment: "Approved for a Black Tech Week reshare. Tag @blacktechweek in the caption and publish between September 3–5 for the best fit with the program calendar.", accent: "cyan" },
  { id: 3, platform: "LinkedIn", type: "Newsletter inclusion", status: "In review", title: "Community program announcement", url: "linkedin.com/posts/kindred-futures", date: "Sep 02, 2026", comment: "Your request is with our community editorial team. We’ll follow up after the Thursday newsletter planning session.", accent: "lime" },
  { id: 4, platform: "TikTok", type: "Story mention", status: "Not moving forward", title: "Behind the scenes: Build With Us prep", url: "tiktok.com/@kindredfutures", date: "Aug 20, 2026", comment: "We’re unable to support this request in the current programming window, but we encourage you to share it independently and tag @blacktechweek.", accent: "yellow" },
];

const statusClass: Record<RequestStatus, string> = { "Approved": "social-status--approved", "Changes needed": "social-status--changes", "In review": "social-status--review", "Not moving forward": "social-status--declined" };
const platformClass: Record<SocialRequest["platform"], string> = { Instagram: "social-platform--instagram", LinkedIn: "social-platform--linkedin", TikTok: "social-platform--tiktok" };

function PostPreview({ request, compact = false }: { request: SocialRequest; compact?: boolean }) {
  return <span className={`post-preview post-preview--${request.accent} ${compact ? "post-preview--compact" : ""}`} aria-hidden="true"><i /><b>BUILD<br />WITH US</b><em>BTW<br />26</em></span>;
}

export default function SocialRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedId, setSelectedId] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [reply, setReply] = useState("");
  const [draft, setDraft] = useState({ platform: "Instagram" as SocialRequest["platform"], type: "Collab post" as RequestType, title: "", url: "", date: "", caption: "" });
  const selected = useMemo(() => requests.find((request) => request.id === selectedId) ?? requests[0], [requests, selectedId]);
  const submitRequest = () => {
    if (!draft.title.trim() || !draft.url.trim()) { toast.error("Add a post title and URL to send your request"); return; }
    const newRequest: SocialRequest = { id: Date.now(), platform: draft.platform, type: draft.type, status: "In review", title: draft.title.trim(), url: draft.url.trim().replace(/^https?:\/\//, ""), date: draft.date || "Date to be scheduled", comment: "Your social request is now with the Black Tech Week team. We’ll review the format, timing, and collaboration fit before responding.", accent: "cyan" };
    setRequests((current) => [newRequest, ...current]); setSelectedId(newRequest.id); setShowForm(false); setDraft({ platform: "Instagram", type: "Collab post", title: "", url: "", date: "", caption: "" }); toast.success("Social request sent for review");
  };
  const sendReply = () => { if (!reply.trim()) return; setRequests((current) => current.map((request) => request.id === selected.id ? { ...request, comment: `${request.comment}\n\nPartner reply: ${reply.trim()}` } : request)); setReply(""); toast.success("Reply sent to the Black Tech Week team"); };

  return <PartnerShell>
    <main className="portal-canvas" id="social-requests">
      <section className="page-masthead page-masthead--social"><div><p className="eyebrow"><span className="eyebrow-dot" /> Shared publishing</p><h1>Social media requests</h1><p>Ask Black Tech Week to collaborate, reshare, or partner on a post — and keep every decision and feedback note attached to the request.</p></div><Button className="portal-primary" onClick={() => setShowForm(true)}><Plus size={17} /> New request</Button></section>
      <div className="page-route" aria-label="Social collaboration route: submit post, Black Tech Week review, publish together"><span className="page-route__node page-route__node--program" /><strong>Submit post</strong><i /><span className="page-route__node page-route__node--review" /><strong>Team review</strong><i /><span className="page-route__node page-route__node--approved" /><strong>Publish together</strong></div>

      {showForm && <section className="social-form" aria-labelledby="new-request-title"><div className="social-form-head"><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> New publishing request</p><h2 id="new-request-title">Give us the post, context, and desired partnership.</h2></div><button className="modal-close" type="button" onClick={() => setShowForm(false)} aria-label="Close new request form"><X size={19} /></button></div><div className="social-form-grid"><label className="form-field"><span>Platform</span><select value={draft.platform} onChange={(e) => setDraft((current) => ({ ...current, platform: e.target.value as SocialRequest["platform"] }))}><option>Instagram</option><option>LinkedIn</option><option>TikTok</option></select></label><label className="form-field"><span>Request type</span><select value={draft.type} onChange={(e) => setDraft((current) => ({ ...current, type: e.target.value as RequestType }))}><option>Collab post</option><option>Reshare</option><option>Story mention</option><option>Newsletter inclusion</option></select></label><label className="form-field"><span>Post title</span><input value={draft.title} onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))} placeholder="e.g. Speaker callout carousel" /></label><label className="form-field"><span>Post or article URL</span><input value={draft.url} onChange={(e) => setDraft((current) => ({ ...current, url: e.target.value }))} placeholder="instagram.com/p/…" /></label><label className="form-field"><span>Preferred publish date</span><input value={draft.date} onChange={(e) => setDraft((current) => ({ ...current, date: e.target.value }))} placeholder="Sep 8, 2026" /></label><label className="form-field form-field--wide"><span>Caption or request context</span><textarea value={draft.caption} onChange={(e) => setDraft((current) => ({ ...current, caption: e.target.value }))} placeholder="Tell us the audience, planned copy, and why a collaboration or reshare would help…" rows={4} /></label></div><div className="social-form-actions"><p><CircleAlert size={14} /> We’ll review timing, format, and audience fit — then attach feedback to this request.</p><Button className="portal-primary" onClick={submitRequest}><Send size={16} /> Send request</Button></div></section>}

      <section className="social-workspace">
        <div className="social-collection"><div className="social-summary"><span><strong>{requests.length}</strong> requests</span><span><strong>{requests.filter((request) => request.status === "Changes needed").length}</strong> need a revision</span><span><strong>{requests.filter((request) => request.status === "Approved").length}</strong> approved</span></div><div className="social-list">{requests.map((request) => <button className={`social-card ${selected.id === request.id ? "social-card--selected" : ""}`} key={request.id} type="button" onClick={() => setSelectedId(request.id)}><PostPreview request={request} compact /><span className="social-card-content"><span className="social-card-top"><span className={`social-platform ${platformClass[request.platform]}`}>{request.platform === "Instagram" ? <Instagram size={13} /> : <Share2 size={13} />}{request.platform}</span><span className={`social-status ${statusClass[request.status]}`}>{request.status}</span></span><strong>{request.title}</strong><span className="social-card-meta"><span>{request.type}</span><span>{request.date}</span></span></span><ChevronRight size={17} /></button>)}</div></div>
        <aside className="social-review-panel"><div className="social-review-hero"><PostPreview request={selected} /><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Selected request</p><h2>{selected.title}</h2><span className={`social-platform ${platformClass[selected.platform]}`}>{selected.platform === "Instagram" ? <Instagram size={13} /> : <Share2 size={13} />}{selected.platform}</span></div></div><div className="social-request-detail"><span className={`social-status ${statusClass[selected.status]}`}>{selected.status}</span><span className="request-kind"><Share2 size={14} /> {selected.type}</span><span className="request-date"><CalendarDays size={14} /> {selected.date}</span></div><a className="social-url" href={`https://${selected.url}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /> {selected.url}</a><div className="review-comment social-comment"><span className="comment-mark"><MessageCircle size={16} /></span><div><span>Black Tech Week feedback</span>{selected.comment.split("\n").map((part, index) => <p key={index}>{part}</p>)}</div></div><div className="reply-box"><label htmlFor="social-reply">Reply to this request</label><textarea id="social-reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Share a revision, ask a question, or confirm a new publishing date…" rows={3} /><Button className="reply-button" onClick={sendReply}><Send size={15} /> Send reply</Button></div></aside>
      </section>
    </main>
  </PartnerShell>;
}
