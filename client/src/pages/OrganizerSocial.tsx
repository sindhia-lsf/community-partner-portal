import OrganizerShell from "@/components/OrganizerShell";
import { socialSubmissions } from "@/data/organizerMockData";
import { ArrowUpRight, CheckCircle2, MessageSquareText, Search, Share2, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s/g, "-");
}

export default function OrganizerSocial() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All decisions");
  const pending = socialSubmissions.filter((item) => item.status === "Pending");
  const resolved = useMemo(() => socialSubmissions.filter((item) => item.status !== "Pending" && `${item.title} ${item.eventName} ${item.organization} ${item.platform}`.toLowerCase().includes(query.toLowerCase()) && (filter === "All decisions" || item.status === filter)), [filter, query]);

  return (
    <OrganizerShell>
      <main className="organizer-canvas">
        <section className="organizer-page-head organizer-page-head--review">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Social review</p>
            <h1>Shape the story with partners.</h1>
            <p>Review collaboration and reshare requests, set a clear social direction, and keep post feedback attached to the original request.</p>
          </div>
          <div className="organizer-head-stat organizer-head-stat--cyan"><strong>{pending.length}</strong><span>social requests<br />need a decision</span></div>
        </section>

        <section className="organizer-review-section organizer-review-section--social">
          <div className="organizer-review-section-head"><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> First up</p><h2>Pending approval</h2></div><span>{pending.length} requests waiting for your review</span></div>
          <div className="organizer-social-cards">
            {pending.map((submission) => <button type="button" className="organizer-social-card" key={submission.id} onClick={() => navigate(`/organizer/social/${submission.id}`)}>
              <span className={`organizer-social-thumb organizer-social-thumb--${submission.color}`}><i /><b>{submission.eventName}</b><em>{submission.platform}</em></span>
              <span className="organizer-social-card-copy"><em>{submission.requestType}</em><strong>{submission.title}</strong><small>{submission.organization} · Planned for {submission.proposedDate}</small><span>{submission.platform} request</span></span>
              <span className="organizer-review-card-foot"><span>Review needed</span><b>Open <ArrowUpRight size={16} /></b></span>
            </button>)}
          </div>
        </section>

        <section className="organizer-review-history">
          <div className="organizer-review-history-head"><div><p className="eyebrow"><span className="eyebrow-dot" /> Request history</p><h2>Approved, returned & rejected</h2></div><div className="organizer-review-filters"><label className="organizer-search organizer-search--compact"><Search size={16} /><span className="sr-only">Search social requests</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search requests" /></label><label className="organizer-filter organizer-filter--compact"><SlidersHorizontal size={15} /><span className="sr-only">Filter social decisions</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="All decisions">All decisions</option><option value="Approved">Approved</option><option value="Changes needed">Changes needed</option><option value="Rejected">Rejected</option></select></label></div></div>
          <div className="organizer-review-history-list">
            {resolved.map((submission) => <button type="button" key={submission.id} className="organizer-history-row" onClick={() => navigate(`/organizer/social/${submission.id}`)}>
              <span className={`organizer-history-visual organizer-history-visual--${submission.color}`}><Share2 size={16} /></span>
              <span className="organizer-history-main"><strong>{submission.title}</strong><small>{submission.eventName} · {submission.platform}</small></span>
              <span className={`organizer-status-chip organizer-status-chip--${statusClass(submission.status)}`}>{submission.status}</span>
              <span className="organizer-history-comment"><MessageSquareText size={15} />{submission.comments.length}</span>
              <span>{submission.proposedDate}</span><ArrowUpRight size={16} />
            </button>)}
            {resolved.length === 0 && <div className="organizer-empty-state"><CheckCircle2 size={20} /><strong>No requests match those filters.</strong></div>}
          </div>
        </section>
      </main>
    </OrganizerShell>
  );
}
