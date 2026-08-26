/**
 * Gallery Operations design reminder:
 * Media review should feel like a curated program wall: colored review markers, direct feedback, and no ambiguity about the next partner action.
 */
import { useMemo, useState } from "react";
import { Check, ChevronRight, CircleAlert, Film, ImagePlus, MessageCircle, Send, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PartnerShell from "@/components/PartnerShell";

type Status = "Approved" | "Changes needed" | "In review";
type MediaItem = { id: number; name: string; type: "Image" | "Video"; status: Status; comment: string; active: boolean; color: string; };

const baseMedia: MediaItem[] = [
  { id: 1, name: "BTW_build-with-us_feed.png", type: "Image", status: "Changes needed", comment: "The final lockup looks great. Please add the Black Tech Week logo and keep 12px clear space around it.", active: true, color: "pink" },
  { id: 2, name: "Speaker-highlight_v2.mp4", type: "Video", status: "Approved", comment: "Approved for publishing. The 9:16 crop is ready for social.", active: true, color: "cyan" },
  { id: 3, name: "Save-the-date_square.png", type: "Image", status: "In review", comment: "Your asset is with the Black Tech Week team. We’ll send feedback within 2–3 business days.", active: true, color: "lime" },
  { id: 4, name: "Draft_poster.png", type: "Image", status: "Approved", comment: "Archived at your request. Reactivate this asset anytime if you plan to use it.", active: false, color: "yellow" },
];

const statusClass: Record<Status, string> = { "Approved": "media-status--approved", "Changes needed": "media-status--changes", "In review": "media-status--review" };

export default function MediaLibrary() {
  const [media, setMedia] = useState(baseMedia);
  const [selectedId, setSelectedId] = useState(1);
  const [comment, setComment] = useState("");
  const selected = useMemo(() => media.find((item) => item.id === selectedId) ?? media[0], [media, selectedId]);
  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const next = Array.from(files).map((file, index) => ({ id: Date.now() + index, name: file.name, type: (file.type.startsWith("video") ? "Video" : "Image") as "Image" | "Video", status: "In review" as Status, comment: "Your upload is now in the Black Tech Week review queue.", active: true, color: index % 2 ? "pink" : "cyan" }));
    setMedia((current) => [...next, ...current]); setSelectedId(next[0].id); toast.success(`${next.length} media ${next.length === 1 ? "item" : "items"} added for review`);
  };
  const toggleActive = () => { setMedia((current) => current.map((item) => item.id === selected.id ? { ...item, active: !item.active } : item)); toast(selected.active ? "Asset marked inactive" : "Asset reactivated"); };
  const sendComment = () => { if (!comment.trim()) return; setMedia((current) => current.map((item) => item.id === selected.id ? { ...item, comment: `${item.comment}\n\nPartner note: ${comment.trim()}` } : item)); setComment(""); toast.success("Comment sent to the Black Tech Week team"); };

  return <PartnerShell>
    <main className="portal-canvas" id="media-library">
      <section className="page-masthead page-masthead--library"><div><p className="eyebrow"><span className="eyebrow-dot" /> Program assets</p><h1>Media library</h1><p>Share the material you plan to use and follow feedback from the Black Tech Week team.</p></div><label className="portal-primary upload-label"><Upload size={16} /> Upload media<input type="file" multiple accept="image/*,video/*" onChange={(e) => addFiles(e.target.files)} /></label></section>
      <div className="page-route" aria-label="Media route: uploaded, Black Tech Week review, ready to publish"><span className="page-route__node page-route__node--program" /><strong>Upload assets</strong><i /><span className="page-route__node page-route__node--review" /><strong>Team review</strong><i /><span className="page-route__node page-route__node--approved" /><strong>Ready to publish</strong></div>
      <section className="media-workspace">
        <div className="media-collection"><div className="library-summary"><span><strong>{media.filter((item) => item.active).length}</strong> active assets</span><span><strong>{media.filter((item) => item.status === "Changes needed" && item.active).length}</strong> need attention</span></div><label className="dropzone"><ImagePlus size={22} /><strong>Drop images or videos here</strong><span>PNG, JPG, GIF, MP4 or MOV · multiple files welcome</span><input type="file" multiple accept="image/*,video/*" onChange={(e) => addFiles(e.target.files)} /></label><div className="media-grid">{media.map((item) => <button key={item.id} className={`asset-card ${selected.id === item.id ? "asset-card--selected" : ""} ${!item.active ? "asset-card--inactive" : ""}`} type="button" onClick={() => setSelectedId(item.id)}><span className={`asset-visual asset-visual--${item.color}`}>{item.type === "Video" ? <Film size={24} /> : <ImagePlus size={24} />}{!item.active && <span className="inactive-flag">Inactive</span>}</span><span className="asset-meta"><span className="asset-name">{item.name}</span><span className="asset-row"><span>{item.type}</span><span className={`media-status ${statusClass[item.status]}`}>{item.status}</span></span></span></button>)}</div></div>
        <aside className="media-review-panel"><div className="review-panel-head"><span className={`asset-visual asset-visual--${selected.color}`}>{selected.type === "Video" ? <Film size={27} /> : <ImagePlus size={27} />}</span><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Selected asset</p><h2>{selected.name}</h2></div></div><div className="review-status"><span className={`media-status ${statusClass[selected.status]}`}>{selected.status}</span>{!selected.active && <span className="media-status media-status--inactive">Inactive</span>}</div><div className="review-comment"><span className="comment-mark"><MessageCircle size={16} /></span><div><span>Black Tech Week review</span>{selected.comment.split("\n").map((part, index) => <p key={index}>{part}</p>)}</div></div><div className="reply-box"><label htmlFor="media-comment">Reply to this review</label><textarea id="media-comment" placeholder="Add context or let us know when a revision is ready…" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} /><Button className="reply-button" onClick={sendComment}><Send size={15} /> Send reply</Button></div><button className="inactivity-button" type="button" onClick={toggleActive}>{selected.active ? <><X size={16} /> Mark media inactive</> : <><Check size={16} /> Reactivate media</>}<ChevronRight size={15} /></button><p className="inactivity-copy"><CircleAlert size={14} /> Inactive assets remain visible to your team but are not considered for event promotion.</p></aside>
      </section>
    </main>
  </PartnerShell>;
}
