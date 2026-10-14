import { useEffect, useState } from "react";
import { Building2, Edit3, Globe2, Save, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import PartnerShell from "@/components/PartnerShell";
import { type OrganizerUpdate, type PortalOrganizer, useOrganizer, usePrimaryEvent } from "@/lib/portal";

type OrganizerForm = Omit<PortalOrganizer, "id" | "updatedAt">;
const blank = "";
function toForm(organizer: PortalOrganizer): OrganizerForm {
  return {
    companyName: organizer.companyName, primaryContactName: organizer.primaryContactName, primaryContactPhone: organizer.primaryContactPhone || blank,
    primaryContactEmail: organizer.primaryContactEmail, addressLine1: organizer.addressLine1 || blank, addressLine2: organizer.addressLine2 || blank,
    city: organizer.city || blank, stateProvince: organizer.stateProvince || blank, postalCode: organizer.postalCode || blank, countryCode: organizer.countryCode || "US",
    websiteUrl: organizer.websiteUrl || blank, instagramUrl: organizer.instagramUrl || blank, facebookUrl: organizer.facebookUrl || blank,
    xUrl: organizer.xUrl || blank, threadsUrl: organizer.threadsUrl || blank, tiktokUrl: organizer.tiktokUrl || blank,
  };
}
function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="form-field"><span>{label}</span><input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}
type SocialPlatform = "instagram" | "facebook" | "x" | "threads" | "tiktok";
function accountName(url: string) {
  try {
    const path = new URL(url).pathname.split("/").filter(Boolean).pop();
    return path ? `@${decodeURIComponent(path).replace(/^@/, "")}` : new URL(url).hostname.replace(/^www\./, "");
  } catch { return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); }
}
function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>;
  if (platform === "facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.6 20v-7h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.4 1.4-1.4h1.5V4.5c-.3 0-1.1-.1-2-.1-2.1 0-3.5 1.3-3.5 3.7v2.1H8.5V13H11v7h2.6Z" fill="currentColor" stroke="none" /></svg>;
  if (platform === "x") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 4 14 16M19 4 5 20" /></svg>;
  if (platform === "threads") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7.5" /><path d="M8 10.5c.7-2.8 7.6-3.3 7.6.2 0 3.3-5.5 1.3-5.5 4 0 1.5 2.2 2.1 4.4 1" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5v10.2a3.2 3.2 0 1 1-2-3V7.4c2.5.8 4.4 2.4 6.5 2.5V7.1C16.5 7 15.4 5.7 14 5Z" fill="currentColor" stroke="none" /></svg>;
}

export default function Organizer() {
  const { event, loading: eventLoading } = usePrimaryEvent();
  const { organizer, loading, error, refresh, updateOrganizer } = useOrganizer(event?.organizerId ?? null);
  const [form, setForm] = useState<OrganizerForm | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (organizer && !editing) setForm(toForm(organizer)); }, [organizer, editing]);
  const update = (key: keyof OrganizerForm, value: string) => setForm((current) => current ? { ...current, [key]: value } : current);
  const cancel = () => { if (organizer) setForm(toForm(organizer)); setEditing(false); };
  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const compact = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, typeof value === "string" ? value.trim() || null : value])) as OrganizerUpdate;
      // Required organizer fields may not be cleared by a partner.
      compact.companyName = form.companyName.trim(); compact.primaryContactName = form.primaryContactName.trim(); compact.primaryContactEmail = form.primaryContactEmail.trim();
      await updateOrganizer(compact);
      setEditing(false);
      toast.success("Organizer details saved", { description: "Your company and contact details are now available to the review team." });
    } catch (saveError) { toast.error("Could not save organizer details", { description: saveError instanceof Error ? saveError.message : "Please try again." }); }
    finally { setSaving(false); }
  };

  if (eventLoading || loading || !form) return <PartnerShell><main className="portal-canvas"><p>Loading organizer details...</p></main></PartnerShell>;
  if (error || !organizer) return <PartnerShell><main className="portal-canvas"><h1>We could not load your organizer details.</h1><p>{error || "No organizer is assigned to this account."}</p><Button onClick={() => void refresh()}>Try again</Button></main></PartnerShell>;

  return <PartnerShell><main className="portal-canvas" id="organizer-details">
    <section className="page-masthead"><div><p className="eyebrow"><span className="eyebrow-dot" /> Partner profile</p><h1>Organizer details</h1><p>Keep your company and primary contact information current for the Black Tech Week team.</p></div>{!editing ? <Button className="portal-primary" onClick={() => setEditing(true)}><Edit3 size={16} /> Edit organizer</Button> : <div className="edit-actions"><button className="subtle-button" type="button" onClick={cancel} disabled={saving}>Cancel <X size={15} /></button><Button className="portal-primary" onClick={() => void save()} disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save changes"}</Button></div>}</section>
    {!editing ? <section className="event-record-grid"><article className="event-record-main"><div className="record-title"><span className="record-number">01</span><div><p className="eyebrow"><span className="eyebrow-dot eyebrow-dot--orange" /> Organization</p><h2>{organizer.companyName}</h2></div></div><div className="detail-grid organizer-detail-grid"><div className="detail-item"><UserRound size={18} /><div><span>Primary contact</span><strong>{organizer.primaryContactName}</strong><small>{organizer.primaryContactEmail}</small><small>{organizer.primaryContactPhone || "Phone not added"}</small></div></div><div className="detail-item"><Building2 size={18} /><div><span>Address</span><strong>{[organizer.addressLine1, organizer.city, organizer.stateProvince, organizer.postalCode].filter(Boolean).join(", ") || "Address not added"}</strong></div></div><div className="detail-item"><Globe2 size={18} /><div><span>Website</span><strong>{organizer.websiteUrl || "Website not added"}</strong></div></div></div></article><aside className="event-record-side"><span className="record-label">Social profiles</span><div className="organizer-social-list">{([ ["instagram", organizer.instagramUrl], ["facebook", organizer.facebookUrl], ["x", organizer.xUrl], ["threads", organizer.threadsUrl], ["tiktok", organizer.tiktokUrl] ] as Array<[SocialPlatform, string | null]>).filter(([, url]) => Boolean(url)).map(([platform, url]) => <a className="social-profile-link" key={platform} href={url!} target="_blank" rel="noreferrer" aria-label={`Open ${platform} profile`}><span className="social-profile-icon"><SocialIcon platform={platform} /></span><span>{accountName(url!)}</span></a>)}{![organizer.instagramUrl, organizer.facebookUrl, organizer.xUrl, organizer.threadsUrl, organizer.tiktokUrl].some(Boolean) && <p className="social-profile-empty">No social profiles added yet.</p>}</div></aside></section> : <form className="event-form" onSubmit={(event) => { event.preventDefault(); void save(); }}><section className="form-section"><div className="form-section-title"><span>01</span><div><h2>Organization & contact</h2><p>These details identify the organization managing your community event.</p></div></div><div className="form-grid"><Field label="Company name" value={form.companyName} onChange={(value) => update("companyName", value)} /><Field label="Primary contact name" value={form.primaryContactName} onChange={(value) => update("primaryContactName", value)} /><Field label="Primary contact email" type="email" value={form.primaryContactEmail} onChange={(value) => update("primaryContactEmail", value)} /><Field label="Primary contact phone" type="tel" value={form.primaryContactPhone || blank} onChange={(value) => update("primaryContactPhone", value)} /></div></section><section className="form-section"><div className="form-section-title"><span>02</span><div><h2>Address & web presence</h2><p>Use public organization information only.</p></div></div><div className="form-grid"><Field label="Address line 1" value={form.addressLine1 || blank} onChange={(value) => update("addressLine1", value)} /><Field label="Address line 2" value={form.addressLine2 || blank} onChange={(value) => update("addressLine2", value)} /><Field label="City" value={form.city || blank} onChange={(value) => update("city", value)} /><Field label="State" value={form.stateProvince || blank} onChange={(value) => update("stateProvince", value)} /><Field label="ZIP code" value={form.postalCode || blank} onChange={(value) => update("postalCode", value)} /><Field label="Website" type="url" value={form.websiteUrl || blank} onChange={(value) => update("websiteUrl", value)} /><Field label="Instagram" type="url" value={form.instagramUrl || blank} onChange={(value) => update("instagramUrl", value)} /><Field label="Facebook" type="url" value={form.facebookUrl || blank} onChange={(value) => update("facebookUrl", value)} /><Field label="X" type="url" value={form.xUrl || blank} onChange={(value) => update("xUrl", value)} /><Field label="Threads" type="url" value={form.threadsUrl || blank} onChange={(value) => update("threadsUrl", value)} /><Field label="TikTok" type="url" value={form.tiktokUrl || blank} onChange={(value) => update("tiktokUrl", value)} /></div></section><div className="form-save-bar"><p>Changes are recorded in the organizer history.</p><Button className="portal-primary" type="submit" disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save changes"}</Button></div></form>}
  </main></PartnerShell>;
}
