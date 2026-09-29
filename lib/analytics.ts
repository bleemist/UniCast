import { EventType } from "@/types";

const STORAGE_KEY_LISTENER_ID = "unicast_listener_id";
const STORAGE_KEY_UNI_ID = "unicast_university_id";
const STORAGE_KEY_UNI_NAME = "unicast_university_name";
const STORAGE_KEY_DISMISSED = "unicast_university_dismissed";
const SESSION_KEY_SESSION_ID = "unicast_session_id";

export function getAnonymousListenerId(): string {
  if (typeof window === "undefined") return "server-render-anon";

  let listenerId = localStorage.getItem(STORAGE_KEY_LISTENER_ID);
  if (!listenerId) {
    listenerId = `anon_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY_LISTENER_ID, listenerId);
  }
  return listenerId;
}

export function getSelectedUniversity(): { id: string; name: string } | null {
  if (typeof window === "undefined") return null;

  const id = localStorage.getItem(STORAGE_KEY_UNI_ID);
  const name = localStorage.getItem(STORAGE_KEY_UNI_NAME);
  if (id && name) {
    return { id, name };
  }
  return null;
}

export function setSelectedUniversity(id: string, name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_UNI_ID, id);
  localStorage.setItem(STORAGE_KEY_UNI_NAME, name);
  localStorage.removeItem(STORAGE_KEY_DISMISSED);

  // Send event
  recordListenerEvent("UNIVERSITY_SELECTED", undefined, { universityId: id, universityName: name });
}

export function setDismissUniversityPrompt(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
}

export function hasDismissedUniversityPrompt(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_KEY_DISMISSED) === "true";
}

export function getDeviceAndBrowser(): { deviceType: string; browser: string } {
  if (typeof window === "undefined") {
    return { deviceType: "unknown", browser: "unknown" };
  }

  const ua = navigator.userAgent;
  let deviceType = "desktop";
  if (/mobile/i.test(ua)) {
    deviceType = "mobile";
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = "tablet";
  }

  let browser = "Other";
  if (/chrome|crios/i.test(ua) && !/edge|edg|opr/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/edg/i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua)) browser = "Opera";

  return { deviceType, browser };
}

export function getActiveSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY_SESSION_ID);
}

export function setActiveSessionId(sessionId: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY_SESSION_ID, sessionId);
}

export function clearActiveSessionId(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY_SESSION_ID);
}

export async function recordListenerEvent(
  eventType: EventType,
  programmeId?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  if (typeof window === "undefined") return;

  const anonymousListenerId = getAnonymousListenerId();
  const selectedUni = getSelectedUniversity();
  const sessionId = getActiveSessionId();

  try {
    await fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonymousListenerId,
        sessionId,
        universityId: selectedUni?.id || null,
        eventType,
        programmeId: programmeId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }),
    });
  } catch (err) {
    // Fail silently in client to avoid disrupting audio
    console.debug("Analytics event push skipped:", err);
  }
}

export async function sendListenerHeartbeat(
  programmeId?: string,
  durationIncrement: number = 30
): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const anonymousListenerId = getAnonymousListenerId();
  const selectedUni = getSelectedUniversity();
  const sessionId = getActiveSessionId();
  const { deviceType, browser } = getDeviceAndBrowser();

  try {
    const res = await fetch("/api/analytics/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        anonymousListenerId,
        universityId: selectedUni?.id || null,
        programmeId: programmeId || null,
        durationIncrement,
        deviceType,
        browser,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.sessionId && data.sessionId !== sessionId) {
        setActiveSessionId(data.sessionId);
      }
      return data.sessionId;
    }
  } catch (err) {
    console.debug("Heartbeat ping skipped:", err);
  }

  return null;
}
