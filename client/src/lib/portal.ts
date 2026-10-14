import { useCallback, useEffect, useState } from "react";

export type PortalEvent = {
  id: number; organizerId: number;
  organizer: { companyName: string; primaryContactName: string; primaryContactEmail: string };
  title: string; description: string | null; startsAt: string; endsAt: string; timezone: string;
  venueName: string | null; addressLine1: string | null; city: string | null; stateProvince: string | null; postalCode: string | null;
  capacity: number | null; rsvpUrl: string | null; admissionType: "free" | "paid"; ticketPriceCents: number | null;
  category: string | null; programYear: number; eventStatus: string;
  pipeline: { currentState: string; pendingOn: "lightship" | "partner"; updatedAt: string };
  updatedAt: string;
};

export type PortalOrganizer = {
  id: number; companyName: string; primaryContactName: string; primaryContactPhone: string | null; primaryContactEmail: string;
  addressLine1: string | null; addressLine2: string | null; city: string | null; stateProvince: string | null; postalCode: string | null; countryCode: string;
  websiteUrl: string | null; instagramUrl: string | null; facebookUrl: string | null; xUrl: string | null; threadsUrl: string | null; tiktokUrl: string | null; updatedAt: string;
};

export type OrganizerUpdate = Partial<Omit<PortalOrganizer, "id" | "updatedAt">>;

export type EventUpdate = Partial<Pick<PortalEvent, "title" | "description" | "startsAt" | "endsAt" | "venueName" | "addressLine1" | "city" | "stateProvince" | "postalCode" | "capacity" | "rsvpUrl" | "admissionType" | "ticketPriceCents" | "category">>;

export type SocialRequestStatus = "in_review" | "approved" | "changes_needed" | "not_moving_forward";
export type SocialRequest = {
  id: number; eventId: number; platform: "instagram" | "linkedin" | "tiktok" | "other";
  requestType: "collab_post" | "reshare" | "story_mention" | "newsletter_inclusion" | "other";
  title: string; postUrl: string; preferredPublishDate: string | null; postCopy: string | null; requestContext: string | null;
  status: SocialRequestStatus; createdAt: string; updatedAt: string; submittedBy: { name: string | null; email: string }; reviewedAt: string | null;
};
export type SocialRequestDraft = Pick<SocialRequest, "platform" | "requestType" | "title" | "postUrl" | "preferredPublishDate" | "postCopy" | "requestContext">;
export type SocialRequestMessage = { id: number; socialRequestId: number; body: string; createdAt: string; author: { name: string; email: string; role: string } };
export type PortalMedia = { id: number; eventId: number; originalFilename: string; mediaType: "image" | "video" | "document"; contentType: string; byteSize: number; approvalState: string; uploadedAt: string; isActive: boolean; downloadUrl: string };

async function portalJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const payload = await response.json().catch(() => ({}));
  // A portal session can expire after the app shell has rendered. Do not leave
  // a partner inside a broken event view; return them to the real sign-in flow.
  if (response.status === 401) {
    const returnTo = `${window.location.pathname}${window.location.search}`;
    window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
    throw new Error("Redirecting to sign in.");
  }
  if (!response.ok) throw new Error(payload.error || "The portal request could not be completed.");
  return payload as T;
}

export function usePrimaryEvent() {
  const [event, setEvent] = useState<PortalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await portalJson<{ events: PortalEvent[] }>("/api/events");
      setEvent(payload.events[0] ?? null);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load your event.");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const updateEvent = useCallback(async (update: EventUpdate) => {
    if (!event) throw new Error("No event is available to update.");
    const payload = await portalJson<{ event: PortalEvent }>(`/api/events/${event.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
    setEvent(payload.event);
    return payload.event;
  }, [event]);
  return { event, loading, error, refresh, updateEvent };
}

export function useOrganizer(organizerId: number | null) {
  const [organizer, setOrganizer] = useState<PortalOrganizer | null>(null);
  const [loading, setLoading] = useState(Boolean(organizerId));
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!organizerId) { setOrganizer(null); setLoading(false); return; }
    setLoading(true);
    try {
      const payload = await portalJson<{ organizer: PortalOrganizer }>(`/api/organizers/${organizerId}`);
      setOrganizer(payload.organizer); setError(null);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load organizer."); }
    finally { setLoading(false); }
  }, [organizerId]);
  useEffect(() => { void refresh(); }, [refresh]);
  const updateOrganizer = useCallback(async (update: OrganizerUpdate) => {
    if (!organizerId) throw new Error("No organizer is available to update.");
    const payload = await portalJson<{ organizer: PortalOrganizer }>(`/api/organizers/${organizerId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(update) });
    setOrganizer(payload.organizer); return payload.organizer;
  }, [organizerId]);
  return { organizer, loading, error, refresh, updateOrganizer };
}

export function useSocialRequests(eventId: number | null) {
  const [socialRequests, setSocialRequests] = useState<SocialRequest[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!eventId) { setSocialRequests([]); setLoading(false); return; }
    setLoading(true);
    try {
      const payload = await portalJson<{ socialRequests: SocialRequest[] }>(`/api/events/${eventId}/social-requests`);
      setSocialRequests(payload.socialRequests); setError(null);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load social requests."); }
    finally { setLoading(false); }
  }, [eventId]);
  useEffect(() => { void refresh(); }, [refresh]);
  const createSocialRequest = useCallback(async (draft: SocialRequestDraft) => {
    if (!eventId) throw new Error("No event is available for this request.");
    const payload = await portalJson<{ socialRequest: SocialRequest }>(`/api/events/${eventId}/social-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    setSocialRequests((current) => [payload.socialRequest, ...current]);
    return payload.socialRequest;
  }, [eventId]);
  return { socialRequests, loading, error, refresh, createSocialRequest };
}

export function useSocialRequestMessages(eventId: number | null, requestId: number | null) {
  const [messages, setMessages] = useState<SocialRequestMessage[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId && requestId));
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!eventId || !requestId) { setMessages([]); setLoading(false); return; }
    setLoading(true);
    try {
      const payload = await portalJson<{ messages: SocialRequestMessage[] }>(`/api/events/${eventId}/social-requests/${requestId}/messages`);
      setMessages(payload.messages); setError(null);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load messages."); }
    finally { setLoading(false); }
  }, [eventId, requestId]);
  useEffect(() => { void refresh(); }, [refresh]);
  const sendMessage = useCallback(async (body: string) => {
    if (!eventId || !requestId) throw new Error("No request is selected.");
    const payload = await portalJson<{ message: SocialRequestMessage }>(`/api/events/${eventId}/social-requests/${requestId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    setMessages((current) => [...current, payload.message]); return payload.message;
  }, [eventId, requestId]);
  return { messages, loading, error, refresh, sendMessage };
}

export function useEventMedia(eventId: number | null) {
  const [media, setMedia] = useState<PortalMedia[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId));
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    if (!eventId) { setMedia([]); setLoading(false); return; }
    setLoading(true);
    try {
      const payload = await portalJson<{ media: PortalMedia[] }>(`/api/events/${eventId}/media`);
      setMedia(payload.media); setError(null);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load media."); }
    finally { setLoading(false); }
  }, [eventId]);
  useEffect(() => { void refresh(); }, [refresh]);
  const upload = useCallback(async (file: File) => {
    if (!eventId) throw new Error("No event is available for this upload.");
    const intent = await portalJson<{ upload: { key: string; uploadUrl: string; filename: string; contentType: string; byteSize: number } }>(`/api/events/${eventId}/media/upload-intents`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type, byteSize: file.size }),
    });
    const uploadResponse = await fetch(intent.upload.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!uploadResponse.ok) throw new Error("S3 rejected the file upload.");
    const completed = await portalJson<{ media: PortalMedia }>(`/api/events/${eventId}/media/complete`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: intent.upload.key, filename: intent.upload.filename, contentType: intent.upload.contentType, byteSize: intent.upload.byteSize }),
    });
    setMedia(current => [completed.media, ...current]);
    return completed.media;
  }, [eventId]);
  return { media, loading, error, refresh, upload };
}

export function eventDate(value: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
export function eventTime(value: string) { return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value)); }
export function titleCase(value: string) { return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
