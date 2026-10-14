import OrganizerShell from "@/components/OrganizerShell";
import { organizerEvents, socialSubmissions, type ReviewStatus, type ThreadComment } from "@/data/organizerMockData";
import { ArrowLeft, CalendarDays, Check, CircleX, Copy, MessageSquareText, Send, Share2, Sparkles, Undo2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

function statusClass(status: string) {
  return status.toLowerCase().replace(/\s/g, "-");
}

export default function OrganizerSocialDetail() {
  const [, params] = useRoute("/organizer/social/:id");
  const [, navigate] = useLocation();
  const submission = socialSubmissions.find((item) => item.id === params?.id) ?? socialSubmissions[0];
  const event = organizerEvents.find((item) => item.id === submission.eventId);
  const [status, setStatus] = useState<ReviewStatus>(submission.status);
  const [comments, setComments] = useState<ThreadComment[]>(submission.comments);
  const [draft, setDraft] = useState("");

  const setDecision = (nextStatus: ReviewStatus) => {
    setStatus(nextStatus);
    const labels: Record<ReviewStatus, string> = { Pending: "Social request is back in review", Approved: "Social request approved", "Changes needed": "Feedback request sent", Rejected: "Social request rejected" };
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
        <button className="organizer-back-link" type="button" onClick={() => navigate("/organizer/social")}><ArrowLeft size={16} />Social review</button>
        <section className="organizer-review-detail-head">
          <div><p className="eyebrow"><span className="eyebrow-dot" /> Social request</p><h1>{submission.title}</h1><p>{submission.eventName} <i>·</i> {submission.organization}</p></div>
          <span className={`organizer-status-chip organizer-status-chip--${statusClass(status)}`}>{status}</span>
        </section>

        <section className="organizer-review-detail-grid">
          <article className="organizer-social-preview-panel">
            <div className={`organizer-social-full-preview organizer-social-full-preview--${submission.color}`}><span>BLACK<br />TECH WEEK</span><b>{submission.eventName}</b><i /><em>{submission.platform}<br />{submission.requestType}</em></div>
            <div className="organizer-social-request-meta"><span><Share2 size={16} />{submission.platform}</span><span>{submission.requestType}</span><span><CalendarDays size={16} />Target: {submission.proposedDate}</span></div>
            <div className="organizer-caption-block"><div><span><Copy size={15} /> Partner caption</span><p>{submission.caption}</p></div></div>
            <div className="organizer-media-event-link"><div><span className="organizer-mini-visual organizer-mini-visual--cyan"><CalendarDays size={16} /></span><span><small>Related event</small><strong>{event?.name}</strong></span></div><button type="button" onClick={() => navigate(`/organizer/events/${submission.eventId}`)}>Open event</button></div>
          </article>

          <aside className="organizer-decision-panel">
            <div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Your decision</p><h2>Make the collaboration clear.</h2><p>Choose an outcome, then leave any editorial, scheduling, or partner-tagging feedback in the conversation.</p></div>
            <div className="organizer-decision-actions">
              <button type="button" className="organizer-decision organizer-decision--approve" onClick={() => setDecision("Approved")}><Check size={16} />Approve</button>
              <button type="button" className="organizer-decision organizer-decision--changes" onClick={() => setDecision("Changes needed")}><Undo2 size={16} />Ask for changes</button>
              <button type="button" className="organizer-decision organizer-decision--reject" onClick={() => setDecision("Rejected")}><CircleX size={16} />Reject</button>
            </div>
            <div className="organizer-decision-tip"><Sparkles size={15} /><span><strong>Collaboration cue</strong> Confirm tagged accounts, post timing, and any required campaign language before you approve.</span></div>
          </aside>
        </section>

        <section className="organizer-comment-workspace">
          <div className="organizer-comment-workspace-head"><div><p className="eyebrow"><span className="eyebrow-dot" /> Conversation</p><h2>Feedback & comments</h2></div><span><MessageSquareText size={16} />{comments.length} messages</span></div>
          <div className="organizer-comment-thread">
            {comments.map((comment, index) => <article className="organizer-thread-comment" key={`${comment.author}-${index}`}><span className={`organizer-thread-avatar organizer-thread-avatar--${comment.role.toLowerCase()}`}>{comment.initials}</span><div><span><strong>{comment.author}</strong><small>{comment.role} · {comment.time}</small></span><p>{comment.message}</p></div></article>)}
          </div>
          <div className="organizer-comment-compose"><label htmlFor="social-comment">Reply to {submission.organization}</label><textarea id="social-comment" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Share direction, edits, or publishing notes…" /><button type="button" onClick={sendComment}><Send size={15} />Send comment</button></div>
        </section>
      </main>
    </OrganizerShell>
  );
}
