import { BadgeCheck, BookOpen, Handshake, Image, Mail, ShieldCheck } from "lucide-react";
import PartnerShell from "@/components/PartnerShell";

const mediaGuidelines = [
  "Upload the final version you intend to publish, with a clear filename and the correct social format.",
  "Use only images, video, music, and logos your organization is authorized to share.",
  "Leave clear space around Black Tech Week branding and do not alter approved logo artwork.",
  "Submit assets early enough for review, and address any requested changes before publishing.",
];

const partnershipGuidelines = [
  "Keep event dates, venue details, access information, and RSVP links current in your event record.",
  "Use inclusive, accessible language and provide any relevant access or accommodation details.",
  "Do not publish Black Tech Week partnership announcements until the event and related assets are approved.",
  "Reply to review feedback and updates promptly so the program team can keep your event moving forward.",
];

function GuidelineCard({ icon: Icon, eyebrow, title, items }: { icon: typeof Image; eyebrow: string; title: string; items: string[] }) {
  return <article className="guideline-card">
    <div className="guideline-card-head"><span className="guideline-icon"><Icon size={23} /></span><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> {eyebrow}</p><h2>{title}</h2></div></div>
    <ol className="guideline-list">{items.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
  </article>;
}

export default function Guidelines() {
  return <PartnerShell><main className="portal-canvas" id="guidelines">
    <section className="page-masthead"><div><p className="eyebrow"><span className="eyebrow-dot" /> Partner resources</p><h1>Guidelines</h1><p>Use these quick references when preparing your event and any Black Tech Week-related media.</p></div></section>
    <section className="guidelines-intro"><div><BookOpen size={21} /><p>These are working guidelines for partners. The Black Tech Week team may share additional event-specific direction during review.</p></div><img src="/assets/btw-signal-mosaic.webp" alt="" /></section>
    <section className="guidelines-grid" aria-label="Partner guidelines"><GuidelineCard icon={Image} eyebrow="01 · Asset review" title="Media guidelines" items={mediaGuidelines} /><GuidelineCard icon={Handshake} eyebrow="02 · Working together" title="Partnership guidelines" items={partnershipGuidelines} /></section>
    <section className="guidelines-support"><ShieldCheck size={19} /><div><strong>Need help applying a guideline?</strong><p>Contact the Black Tech Week team before publishing or changing an approved event detail.</p></div><button type="button" onClick={() => window.location.href = "mailto:partnerships@blacktechweek.com"}><Mail size={15} /> Contact the team</button></section>
  </main></PartnerShell>;
}
