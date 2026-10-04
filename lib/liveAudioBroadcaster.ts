/**
 * UniCast Real-Time Live Audio Broadcasting & VoIP Engine
 * 
 * Manages in-memory live broadcast state, audio chunk distribution,
 * and WebRTC signaling for direct low-latency presenter-to-listener transmission.
 */

export interface BroadcastSession {
  isBroadcasting: boolean;
  broadcasterId: string | null;
  presenterName: string;
  showTitle: string;
  startedAt: number | null;
  mimeType: string;
  headerChunk: Uint8Array | null;
  recentChunks: Uint8Array[]; // ring buffer
  listeners: Map<string, (chunk: Uint8Array) => void>;
  // WebRTC Signaling
  webrtcBroadcasterActive: boolean;
  offers: Map<string, any>; // listenerId -> SDP offer
  answers: Map<string, any>; // listenerId -> SDP answer
  listenerCandidates: Map<string, any[]>; // listenerId -> ICE candidates
  broadcasterCandidates: Map<string, any[]>; // listenerId -> ICE candidates from broadcaster
}

declare global {
  // eslint-disable-next-line no-var
  var __unicastBroadcastSession: BroadcastSession | undefined;
}

const MAX_RING_BUFFER_CHUNKS = 15; // ~3-4 seconds of audio for instant playback

export function getBroadcastSession(): BroadcastSession {
  if (!global.__unicastBroadcastSession) {
    global.__unicastBroadcastSession = {
      isBroadcasting: false,
      broadcasterId: null,
      presenterName: "UniCast Host",
      showTitle: "Live Studio Broadcast",
      startedAt: null,
      mimeType: "audio/webm; codecs=opus",
      headerChunk: null,
      recentChunks: [],
      listeners: new Map(),
      webrtcBroadcasterActive: false,
      offers: new Map(),
      answers: new Map(),
      listenerCandidates: new Map(),
      broadcasterCandidates: new Map(),
    };
  }
  return global.__unicastBroadcastSession;
}

export function startBroadcast(broadcasterId: string, presenterName = "Presenter", showTitle = "Live Show", mimeType = "audio/webm; codecs=opus") {
  const session = getBroadcastSession();
  session.isBroadcasting = true;
  session.broadcasterId = broadcasterId;
  session.presenterName = presenterName;
  session.showTitle = showTitle;
  session.startedAt = Date.now();
  session.mimeType = mimeType;
  session.headerChunk = null;
  session.recentChunks = [];
  session.offers.clear();
  session.answers.clear();
  session.listenerCandidates.clear();
  session.broadcasterCandidates.clear();
  session.webrtcBroadcasterActive = true;
  return session;
}

export function stopBroadcast() {
  const session = getBroadcastSession();
  session.isBroadcasting = false;
  session.broadcasterId = null;
  session.startedAt = null;
  session.headerChunk = null;
  session.recentChunks = [];
  session.webrtcBroadcasterActive = false;
  session.offers.clear();
  session.answers.clear();
  session.listenerCandidates.clear();
  session.broadcasterCandidates.clear();

  // Notify and close any open HTTP chunked listeners
  session.listeners.forEach((_, id) => {
    try {
      session.listeners.delete(id);
    } catch {
      // ignore
    }
  });
}

export function pushAudioChunk(chunk: Uint8Array) {
  const session = getBroadcastSession();
  if (!session.isBroadcasting) return;

  // The very first chunk produced by MediaRecorder is the WebM container header
  if (!session.headerChunk) {
    session.headerChunk = chunk;
  }

  // Push to recent ring buffer
  session.recentChunks.push(chunk);
  if (session.recentChunks.length > MAX_RING_BUFFER_CHUNKS) {
    session.recentChunks.shift();
  }

  // Broadcast to all active HTTP stream subscribers
  session.listeners.forEach((sendChunk, id) => {
    try {
      sendChunk(chunk);
    } catch {
      session.listeners.delete(id);
    }
  });
}

export function addStreamListener(id: string, sendChunk: (chunk: Uint8Array) => void) {
  const session = getBroadcastSession();
  session.listeners.set(id, sendChunk);

  // Send header chunk first so listener's audio decoder can initialize
  if (session.headerChunk) {
    try {
      sendChunk(session.headerChunk);
    } catch {
      session.listeners.delete(id);
      return;
    }
  }

  // Send recent buffer for instant audio start
  for (const chunk of session.recentChunks) {
    try {
      sendChunk(chunk);
    } catch {
      session.listeners.delete(id);
      return;
    }
  }
}

export function removeStreamListener(id: string) {
  const session = getBroadcastSession();
  session.listeners.delete(id);
}
