import { NextResponse } from "next/server";
import { getBroadcastSession } from "@/lib/liveAudioBroadcaster";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = getBroadcastSession();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const listenerId = searchParams.get("listenerId");

    // Action: Listener registers & sends SDP offer to broadcaster
    if (action === "listener_offer") {
      if (!listenerId) {
        return NextResponse.json({ error: "Missing listenerId" }, { status: 400 });
      }
      const { offer } = await req.json();
      session.offers.set(listenerId, offer);

      return NextResponse.json({ success: true, isBroadcasting: session.isBroadcasting });
    }

    // Action: Broadcaster polls for pending listener offers
    if (action === "broadcaster_poll_offers") {
      const pendingOffers: { listenerId: string; offer: any }[] = [];
      session.offers.forEach((offer, id) => {
        pendingOffers.push({ listenerId: id, offer });
      });
      // clear delivered offers
      session.offers.clear();

      // Also get any pending listener ICE candidates
      const candidates: Record<string, any[]> = {};
      session.listenerCandidates.forEach((cList, id) => {
        if (cList.length > 0) {
          candidates[id] = [...cList];
          session.listenerCandidates.set(id, []);
        }
      });

      return NextResponse.json({
        success: true,
        offers: pendingOffers,
        candidates,
      });
    }

    // Action: Broadcaster posts SDP answer for a listener
    if (action === "broadcaster_answer") {
      if (!listenerId) {
        return NextResponse.json({ error: "Missing listenerId" }, { status: 400 });
      }
      const { answer } = await req.json();
      session.answers.set(listenerId, answer);
      return NextResponse.json({ success: true });
    }

    // Action: Listener polls for broadcaster answer
    if (action === "listener_poll_answer") {
      if (!listenerId) {
        return NextResponse.json({ error: "Missing listenerId" }, { status: 400 });
      }
      const answer = session.answers.get(listenerId) || null;
      if (answer) {
        session.answers.delete(listenerId);
      }

      const candidates = session.broadcasterCandidates.get(listenerId) || [];
      if (candidates.length > 0) {
        session.broadcasterCandidates.set(listenerId, []);
      }

      return NextResponse.json({
        success: true,
        answer,
        candidates,
        isBroadcasting: session.isBroadcasting,
      });
    }

    // Action: Exchange ICE candidates
    if (action === "ice_candidate") {
      const { candidate, role } = await req.json();
      if (!listenerId || !candidate) {
        return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
      }

      if (role === "listener") {
        const list = session.listenerCandidates.get(listenerId) || [];
        list.push(candidate);
        session.listenerCandidates.set(listenerId, list);
      } else {
        const list = session.broadcasterCandidates.get(listenerId) || [];
        list.push(candidate);
        session.broadcasterCandidates.set(listenerId, list);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("WebRTC signaling error:", error);
    return NextResponse.json({ error: "Signaling failed" }, { status: 500 });
  }
}

export async function GET() {
  const session = getBroadcastSession();
  return NextResponse.json({
    isBroadcasting: session.isBroadcasting,
    presenterName: session.presenterName,
    showTitle: session.showTitle,
    activeSubscribers: session.listeners.size,
  });
}
