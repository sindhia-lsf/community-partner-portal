/**
 * Gallery Operations design reminder:
 * Communication is part of the partner’s route forward: show what changed, who said it, and a calm direct path to respond.
 */
import { useState } from "react";
import { Bell, CheckCheck, MessageCircle, Paperclip, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PartnerShell from "@/components/PartnerShell";

const notifications = [
  { icon: MessageCircle, type: "Organizer note", time: "Today, 10:24 AM", text: "The event brief is looking strong. Please add the final social graphic so we can complete review.", unread: true },
  { icon: Sparkles, type: "Status updated", time: "Yesterday", text: "Your event moved from Submitted to In review.", unread: true },
  { icon: Bell, type: "Media review", time: "Apr 13", text: "Feedback is ready on BTW_build-with-us_feed.png.", unread: false },
];

type ChatMessage = { sender: "team" | "partner"; text: string; time: string; };
const initialMessages: ChatMessage[] = [
  { sender: "team", text: "Hi Camille — excited to have Build With Us: AI × Community in this year’s community program.", time: "10:08 AM" },
  { sender: "team", text: "I left feedback on your event graphic. Let us know if you have questions about the lockup or social formats.", time: "10:24 AM" },
  { sender: "partner", text: "Thank you! I’m making the update today and will upload a new version this afternoon.", time: "10:32 AM" },
];

export default function Updates() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [unread, setUnread] = useState(true);
  const send = () => { if (!draft.trim()) return; setMessages((current) => [...current, { sender: "partner", text: draft.trim(), time: "Now" }]); setDraft(""); };

  return <PartnerShell>
    <main className="portal-canvas" id="updates">
      <section className="page-masthead page-masthead--updates"><div><p className="eyebrow"><span className="eyebrow-dot" /> Partner communication</p><h1>Updates</h1><p>Follow review activity and keep your conversation with the Black Tech Week team in one place.</p></div><Button className="subtle-button subtle-button--boxed" onClick={() => setUnread(false)}><CheckCheck size={16} /> Mark all read</Button></section>
      <div className="page-route" aria-label="Communication route: activity, direct team conversation, next partner reply"><span className="page-route__node page-route__node--program" /><strong>Review activity</strong><i /><span className="page-route__node page-route__node--review" /><strong>Team conversation</strong><i /><span className="page-route__node page-route__node--action" /><strong>Next: send your reply</strong></div>
      <section className="updates-workspace">
        <aside className="notification-panel"><div className="workspace-heading"><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Activity</p><h2>Recent updates</h2></div><span className="unread-count">{unread ? "2 new" : "All read"}</span></div><div className="notification-list">{notifications.map(({ icon: Icon, type, time, text, unread: isUnread }) => <article className={`notification-item ${unread && isUnread ? "notification-item--unread" : ""}`} key={type}><span className="notification-icon"><Icon size={17} /></span><div><div className="notification-top"><strong>{type}</strong><time>{time}</time></div><p>{text}</p></div></article>)}</div></aside>
        <section className="chat-panel"><header className="chat-head"><div className="chat-avatar">BT</div><div><span>Black Tech Week team</span><strong>Community events support</strong></div><span className="online-indicator">Online</span></header><div className="chat-context"><Sparkles size={15} /> Your event is currently <strong>in review</strong>. Typical response time: one business day.</div><div className="message-list">{messages.map((message, index) => <div className={`chat-message chat-message--${message.sender}`} key={`${message.time}-${index}`}><div><p>{message.text}</p><time>{message.time}</time></div></div>)}</div><form className="chat-composer" onSubmit={(e) => { e.preventDefault(); send(); }}><button className="attachment-button" type="button" aria-label="Attach a file"><Paperclip size={18} /></button><textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message to the Black Tech Week team…" rows={1} /><Button className="send-button" type="submit" aria-label="Send message"><Send size={17} /></Button></form></section>
      </section>
    </main>
  </PartnerShell>;
}
