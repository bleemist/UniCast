"use client";

import * as React from "react";
import {
  Activity,
  Search,
  RefreshCw,
  Shield,
  Clock,
  Terminal,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  resource: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
}

interface Props {
  initialLogs: AuditLog[];
}

export function AuditLogsClient({ initialLogs }: Props) {
  const [logs, setLogs] = React.useState<AuditLog[]>(initialLogs);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const refreshLogs = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Security Compliance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Security & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Immutable audit trail of administrative modifications, settings updates, and content actions.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={refreshLogs}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          className="self-start sm:self-auto"
        >
          Refresh Logs
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Input
          placeholder="Filter by action, user, or resource..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-navy-900/50 border border-navy-800 rounded-2xl">
          <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No audit records found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Administrative actions will be permanently logged here as they occur.
          </p>
        </div>
      ) : (
        <Card className="border-navy-800 bg-navy-850/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-900/80 border-b border-navy-750 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp (EAT)</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Resource</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] whitespace-nowrap text-slate-400">
                      {new Date(log.createdAt).toLocaleString("en-UG", {
                        timeZone: "Africa/Kampala",
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-white">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.userEmail || "System Automation"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono px-2 py-0.5 rounded bg-radio-500/10 text-radio-300 border border-radio-500/20 font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-300 font-semibold">
                      {log.resource}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px] text-slate-400">
                      {log.details || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
