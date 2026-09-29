"use client";

import * as React from "react";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Play,
  Trash2,
  Search,
  RefreshCw,
  Clock,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface RequestQueueClientProps {
  initialRequests: any[];
}

export function RequestQueueClient({
  initialRequests,
}: RequestQueueClientProps) {
  const [requests, setRequests] = React.useState(initialRequests);
  const [filter, setFilter] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const updateStatus = async (id: string, status: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this song request?")) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = requests.filter((r) => {
    const matchesFilter = filter === "ALL" || r.status === filter;
    const matchesSearch =
      r.songTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.artist.toLowerCase().includes(search.toLowerCase()) ||
      r.studentName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              DJ Live Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Song Requests Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Moderate student song dedications and cue them for the on-air show.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="pending" size="md">
            {requests.filter((r) => r.status === "PENDING").length} PENDING
          </Badge>
          <Badge variant="approved" size="md">
            {requests.filter((r) => r.status === "APPROVED").length} APPROVED
          </Badge>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-navy-850 p-4 rounded-xl border border-navy-800">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by song, artist, student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "PENDING", "APPROVED", "PLAYED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                filter === st
                  ? "bg-radio-500 text-navy-950"
                  : "bg-navy-900 text-slate-400 hover:text-white border border-navy-800"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table / Card List */}
      {filtered.length === 0 ? (
        <Card className="border-navy-800 bg-navy-850/60 p-12 text-center">
          <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-white">No requests found</h3>
          <p className="text-xs text-slate-400">
            No incoming song requests match the current filter.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <Card
              key={req.id}
              className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-bold text-white truncate">
                      {req.songTitle}
                    </span>
                    <span className="text-xs text-radio-400 font-semibold">
                      by {req.artist}
                    </span>
                    <Badge
                      variant={
                        req.status === "PENDING"
                          ? "pending"
                          : req.status === "APPROVED"
                          ? "approved"
                          : req.status === "PLAYED"
                          ? "played"
                          : "rejected"
                      }
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <User className="w-3.5 h-3.5 text-radio-400" />
                      {req.studentName}
                    </span>
                    {req.course && (
                      <>
                        <span>•</span>
                        <span>{req.course}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(req.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {req.dedication && (
                    <p className="text-xs text-slate-300 italic pt-1 border-t border-navy-800/80">
                      Dedication: "{req.dedication}"
                    </p>
                  )}
                </div>

                {/* DJ Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  {req.status === "PENDING" && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={loadingId === req.id}
                        onClick={() => updateStatus(req.id, "APPROVED")}
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={loadingId === req.id}
                        onClick={() => updateStatus(req.id, "REJECTED")}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {req.status === "APPROVED" && (
                    <Button
                      variant="gold"
                      size="sm"
                      isLoading={loadingId === req.id}
                      onClick={() => updateStatus(req.id, "PLAYED")}
                      leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      Mark Played
                    </Button>
                  )}

                  <button
                    onClick={() => deleteRequest(req.id)}
                    aria-label="Delete request"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-navy-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
