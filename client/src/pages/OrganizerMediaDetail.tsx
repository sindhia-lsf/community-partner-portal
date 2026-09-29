import OrganizerShell from "@/components/OrganizerShell";
import { mediaSubmissions, organizerEvents, type ReviewStatus, type ThreadComment } from "@/data/organizerMockData";
import { ArrowLeft, CalendarDays, Check, CircleX, Image, MessageSquareText, Send, Sparkles, Undo2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s/g, "-");
}

export default function OrganizerMediaDetail() {
  const [, params] = useRoute("/organizer/media/:id");
  const [, navigate] = useLocation();
  const submission = mediaSubmissions.find((item) => item.id === params?.id) ?? mediaSubmissions[0];
  const event = organizerEvents.find((item) => item.id === submission.eventId);
  const [status, setStatus] = useState<ReviewStatus>(submission.status);
  const [comments, setComments] = useState<ThreadComment[]>(submission.comments);
  const [draft, setDraft] = useState("");

  const setDecision = (nextStatus: ReviewStatus) => {
    setStatus(nextStatus);
    const labels: Record<ReviewStatus, string> = { Pending: "Media is back in review", Approved: "Media approved", "Changes needed": "Change request sent", Rejected: "Media request rejected" };
    toast(labels[nextStatus]);
  };

  const sendComment = () => {
    const message = draft.trim();
    if (!message) return;
    setComments((current) => [...current, { author: "Lena Brooks", role: "Organizer", initials: "LB", message, time: "Just now" }]);
    setDraft("");
    toast("Comment sent to the event partner");
  };

  return (
    <OrganizerShell>
      <main className="organizer-canvas organizer-detail-canvas">
        <button className="organizer-back-link" type="button" onClick={() => navigate("/organizer/media")}><ArrowLeft size={16} />Media review</button>
        <section className="organizer-review-detail-head">
          <div><p className="eyebrow"><span className="eyebrow-dot" /> Media submission</p><h1>{submission.name}</h1><p>{submission.eventName} <i>·</i> {submission.organization}</p></div>
          <span className={`organizer-status-chip organizer-status-chip--${statusClass(status)}`}>{status}</span>
        </section>

        <section className="organizer-review-detail-grid">
          <article className="organizer-media-preview-panel">
            <div className={`organizer-media-full-preview organizer-media-full-preview--${submission.color}`}><span>BLACK<br />TECH WEEK</span><b>{submission.eventName}</b><i /><em>Community event<br />2026</em></div>
            <div className="organizer-media-file-meta"><span><Image size={16} />{submission.format}</span><span>{submission.size}</span><span>Submitted {submission.submitted}</span></div>
            <div className="organizer-media-event-link"><div><span className="organizer-mini-visual organizer-mini-visual--cyan"><CalendarDays size={16} /></span><span><small>Related event</small><strong>{event?.name}</strong></span></div><button type="button" onClick={() => navigate(`/organizer/events/${submission.eventId}`)}>Open event</button></div>
          </article>

          <aside className="organizer-decision-panel">
            <div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Your decision</p><h2>Give the partner a clear next step.</h2><p>Selections update the request status and notify the partner. Add feedback below when context will help.</p></div>
            <div className="organizer-decision-actions">
              <button type="button" className="organizer-decision organizer-decision--approve" onClick={() => setDecision("Approved")}><Check size={16} />Approve</button>
              <button type="button" className="organizer-decision organizer-decision--changes" onClick={() => setDecision("Changes needed")}><Undo2 size={16} />Ask for changes</button>
              <button type="button" className="organizer-decision organizer-decision--reject" onClick={() => setDecision("Rejected")}><CircleX size={16} />Reject</button>
            </div>
            <div className="organizer-decision-tip"><Sparkles size={15} /><span><strong>Review cue</strong> Reference a specific element—such as a date, logo, crop, or treatment—when requesting an update.</span></div>
          </aside>
        </section>

        <section className="organizer-comment-workspace">
          <div className="organizer-comment-workspace-head"><div><p className="eyebrow"><span className="eyebrow-dot" /> Conversation</p><h2>Feedback & comments</h2></div><span><MessageSquareText size={16} />{comments.length} messages</span></div>
          <div className="organizer-comment-thread">
            {comments.map((comment, index) => <article className="organizer-thread-comment" key={`${comment.author}-${index}`}><span className={`organizer-thread-avatar organizer-thread-avatar--${comment.role.toLowerCase()}`}>{comment.initials}</span><div><span><strong>{comment.author}</strong><small>{comment.role} · {comment.time}</small></span><p>{comment.message}</p></div></article>)}
          </div>
          <div className="organizer-comment-compose"><label htmlFor="media-comment">Reply to {submission.organization}</label><textarea id="media-comment" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Leave concise, actionable feedback…" /><button type="button" onClick={sendComment}><Send size={15} />Send comment</button></div>
        </section>
      </main>
    </OrganizerShell>
  );
}
