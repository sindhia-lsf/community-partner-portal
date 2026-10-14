import { useCallback, useEffect, useState } from "react";
import type { PortalEvent, PortalMedia, SocialRequest, SocialRequestMessage } from "./portal";

export type OrganizerEvent = PortalEvent & { mediaCount: number; pendingMediaCount: number; socialCount: number; pendingSocialCount: number };
export type OrganizerMedia = PortalMedia & { event: { title: string; organizerName: string }; uploader: { name: string | null; email: string | null }; commentCount: number };
export type OrganizerSocialRequest = SocialRequest & { event: { title: string; organizerName: string }; commentCount: number };
export type ReviewComment = { id: number; body: string; createdAt: string; author: { name: string; email: string; role: string } };
export type OrganizerOverview = { eventCount: number; pendingPartnerCount: number; pendingMediaCount: number; pendingSocialCount: number };

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const payload = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.assign(`/login?returnTo=${encodeURIComponent(`${window.location.pathname}${window.location.search}`)}`);
    throw new Error("Redirecting to sign in.");
  }
  if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
  return payload as T;
}

function useLiveData<T>(path: string, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const payload = await api<Record<string, T>>(path); setData(payload[key]); setError(null); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load data."); }
    finally { setLoading(false); }
  }, [key, path]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { data, loading, error, refresh, setData };
}

export function useOrganizerOverview() { return useLiveData<OrganizerOverview>("/api/organizer/overview", "overview"); }
export function useOrganizerEvents() { return useLiveData<OrganizerEvent[]>("/api/organizer/events", "events"); }
export function useOrganizerMedia() { return useLiveData<OrganizerMedia[]>("/api/organizer/media", "media"); }
export function useOrganizerSocial() { return useLiveData<OrganizerSocialRequest[]>("/api/organizer/social", "socialRequests"); }
export function useOrganizerEvent(eventId: string | undefined) { return useLiveData<OrganizerEvent>(eventId ? `/api/organizer/events/${eventId}` : "/api/organizer/events/0", "event"); }
export function useOrganizerMediaDetail(mediaId: string | undefined) { return useLiveData<OrganizerMedia>(mediaId ? `/api/organizer/media/${mediaId}` : "/api/organizer/media/0", "media"); }
export function useOrganizerSocialDetail(requestId: string | undefined) { return useLiveData<OrganizerSocialRequest>(requestId ? `/api/organizer/social/${requestId}` : "/api/organizer/social/0", "socialRequest"); }

export async function reviewEvent(id: number, state: string) { return api<{ event: OrganizerEvent }>(`/api/organizer/events/${id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }) }); }
export async function reviewMedia(id: number, state: string) { return api<{ media: PortalMedia }>(`/api/organizer/media/${id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }) }); }
export async function reviewSocial(id: number, state: string) { return api<{ socialRequest: SocialRequest }>(`/api/organizer/social/${id}/review`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }) }); }
export function useMediaComments(mediaId: string | undefined) { return useLiveData<ReviewComment[]>(mediaId ? `/api/organizer/media/${mediaId}/comments` : "/api/organizer/media/0/comments", "comments"); }
export async function addMediaComment(id: number, body: string) { return api<{ comment: ReviewComment }>(`/api/organizer/media/${id}/comments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) }); }
export function useSocialMessages(eventId: number | undefined, requestId: string | undefined) { return useLiveData<SocialRequestMessage[]>(eventId && requestId ? `/api/events/${eventId}/social-requests/${requestId}/messages` : "/api/events/0/social-requests/0/messages", "messages"); }
export async function addSocialMessage(eventId: number, requestId: number, body: string) { return api<{ message: SocialRequestMessage }>(`/api/events/${eventId}/social-requests/${requestId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) }); }
