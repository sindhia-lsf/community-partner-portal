import { FileText, Film, ImagePlus, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import PartnerShell from "@/components/PartnerShell";
import { useEventMedia, usePrimaryEvent } from "@/lib/portal";

const accept = "image/jpeg,image/png,image/webp,application/pdf,video/mp4";
function label(kind: string) { return kind === "video" ? "Video" : kind === "document" ? "PDF" : "Image"; }

export default function MediaLibrary() {
  const { event, loading: eventLoading } = usePrimaryEvent();
  const { media, loading, error, upload } = useEventMedia(event?.id ?? null);
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) await upload(file);
      toast.success(`${files.length} ${files.length === 1 ? "file" : "files"} uploaded for review.`);
    } catch (uploadError) { toast.error(uploadError instanceof Error ? uploadError.message : "Unable to upload media."); }
    finally { setUploading(false); if (input.current) input.current.value = ""; }
  };
  if (eventLoading || loading) return <PartnerShell><main className="portal-canvas"><p>Loading media library…</p></main></PartnerShell>;
  if (!event || error) return <PartnerShell><main className="portal-canvas"><h1>We could not load the media library.</h1><p>{error || "No event is assigned to this account."}</p></main></PartnerShell>;
  return <PartnerShell><main className="portal-canvas" id="media-library">
    <section className="page-masthead page-masthead--library"><div><p className="eyebrow"><span className="eyebrow-dot" /> Program assets</p><h1>Media library</h1><p>Share materials with the Black Tech Week team. JPG/JPEG, PNG, WebP, PDF, and MP4 only; up to 100 MB each.</p></div><button className="portal-primary upload-label" type="button" disabled={uploading} onClick={() => input.current?.click()}><Upload size={16} />{uploading ? "Uploading…" : "Upload media"}</button><input ref={input} className="sr-only" type="file" multiple accept={accept} onChange={event => void addFiles(event.target.files)} /></section>
    <section className="media-workspace"><div className="media-collection"><div className="library-summary"><span><strong>{media.filter(item => item.isActive).length}</strong> active assets</span><span><strong>{media.filter(item => item.approvalState === "pending").length}</strong> awaiting review</span></div><button className="dropzone" type="button" disabled={uploading} onClick={() => input.current?.click()}><ImagePlus size={22} /><strong>Upload media for review</strong><span>JPG/JPEG, PNG, WebP, PDF, or MP4 · 100 MB maximum</span></button><div className="media-grid">{media.map(item => <a key={item.id} className={`asset-card ${!item.isActive ? "asset-card--inactive" : ""}`} href={item.downloadUrl} target="_blank" rel="noreferrer"><span className="asset-visual asset-visual--cyan">{item.mediaType === "video" ? <Film size={24} /> : item.mediaType === "document" ? <FileText size={24} /> : <ImagePlus size={24} />}</span><span className="asset-meta"><span className="asset-name">{item.originalFilename}</span><span className="asset-row"><span>{label(item.mediaType)}</span><span className="media-status media-status--review">{item.approvalState.replace(/_/g, " ")}</span></span></span></a>)}</div>{media.length === 0 && <p className="social-thread-empty">No media uploaded yet. Upload an asset to start the review process.</p>}</div></section>
  </main></PartnerShell>;
}
