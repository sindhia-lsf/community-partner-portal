import OrganizerShell from "@/components/OrganizerShell";
import { mediaSubmissions } from "@/data/organizerMockData";
import { ArrowUpRight, CheckCircle2, Image, MessageSquareText, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s/g, "-");
}

export default function OrganizerMedia() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All decisions");
  const pending = mediaSubmissions.filter((item) => item.status === "Pending");
  const resolved = useMemo(() => mediaSubmissions.filter((item) => item.status !== "Pending" && `${item.name} ${item.eventName} ${item.organization}`.toLowerCase().includes(query.toLowerCase()) && (filter === "All decisions" || item.status === filter)), [filter, query]);

  return (
    <OrganizerShell>
      <main className="organizer-canvas">
        <section className="organizer-page-head organizer-page-head--review">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Media review</p>
            <h1>Review what partners will share.</h1>
            <p>Approve event graphics and supporting media, return focused feedback, and keep an auditable conversation with each event partner.</p>
          </div>
          <div className="organizer-head-stat organizer-head-stat--pink"><strong>{pending.length}</strong><span>files need<br />a decision</span></div>
        </section>

        <section className="organizer-review-section">
          <div className="organizer-review-section-head"><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> First up</p><h2>Pending approval</h2></div><span>{pending.length} waiting for your review</span></div>
          <div className="organizer-review-cards">
            {pending.map((submission) => <button type="button" className="organizer-review-card" key={submission.id} onClick={() => navigate(`/organizer/media/${submission.id}`)}>
              <span className={`organizer-review-visual organizer-review-visual--${submission.color}`}><Image size={28} /><i /></span>
              <span className="organizer-review-card-copy"><em>New media submission</em><strong>{submission.name}</strong><small>{submission.eventName}</small><span>{submission.format} · {submission.size}</span></span>
              <span className="organizer-review-card-foot"><span>{submission.submitted}</span><b>Review <ArrowUpRight size={16} /></b></span>
            </button>)}
          </div>
        </section>

        <section className="organizer-review-history">
          <div className="organizer-review-history-head"><div><p className="eyebrow"><span className="eyebrow-dot" /> Request history</p><h2>Approved, returned & rejected</h2></div><div className="organizer-review-filters"><label className="organizer-search organizer-search--compact"><Search size={16} /><span className="sr-only">Search media requests</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media" /></label><label className="organizer-filter organizer-filter--compact"><SlidersHorizontal size={15} /><span className="sr-only">Filter media decisions</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="All decisions">All decisions</option><option value="Approved">Approved</option><option value="Changes needed">Changes needed</option><option value="Rejected">Rejected</option></select></label></div></div>
          <div className="organizer-review-history-list">
            {resolved.map((submission) => <button type="button" key={submission.id} className="organizer-history-row" onClick={() => navigate(`/organizer/media/${submission.id}`)}>
              <span className={`organizer-history-visual organizer-history-visual--${submission.color}`}><Image size={16} /></span>
              <span className="organizer-history-main"><strong>{submission.name}</strong><small>{submission.eventName} · {submission.organization}</small></span>
              <span className={`organizer-status-chip organizer-status-chip--${statusClass(submission.status)}`}>{submission.status}</span>
              <span className="organizer-history-comment"><MessageSquareText size={15} />{submission.comments.length}</span>
              <span>{submission.submitted}</span><ArrowUpRight size={16} />
            </button>)}
            {resolved.length === 0 && <div className="organizer-empty-state"><CheckCircle2 size={20} /><strong>No requests match those filters.</strong></div>}
          </div>
        </section>
      </main>
    </OrganizerShell>
  );
}
