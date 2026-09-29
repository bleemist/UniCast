"use client";

import * as React from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  CheckCircle2,
  XCircle,
  Building2,
  X,
  Users,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface UniversityItem {
  id: string;
  name: string;
  shortName?: string | null;
  location?: string | null;
  country: string;
  isActive: boolean;
  listenerCount: number;
  sessionCount: number;
  totalDurationSeconds: number;
  avgDurationMinutes: number;
  lastActivity: string | Date | null;
  createdAt: string | Date;
}

export function UniversityManagementClient({
  initialUniversities,
}: {
  initialUniversities: UniversityItem[];
}) {
  const [universities, setUniversities] = React.useState<UniversityItem[]>(initialUniversities);
  const [search, setSearch] = React.useState("");
  const [modalMode, setModalMode] = React.useState<"add" | "edit" | null>(null);
  const [editingUni, setEditingUni] = React.useState<UniversityItem | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [shortName, setShortName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [country, setCountry] = React.useState("Uganda");
  const [isActive, setIsActive] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const refreshList = async () => {
    try {
      const res = await fetch("/api/universities?stats=true");
      if (res.ok) {
        const json = await res.json();
        if (json.universities) {
          setUniversities(json.universities);
        }
      }
    } catch (err) {
      console.error("Failed to refresh universities list:", err);
    }
  };

  const handleOpenAdd = () => {
    setModalMode("add");
    setEditingUni(null);
    setName("");
    setShortName("");
    setLocation("Kampala");
    setCountry("Uganda");
    setIsActive(true);
    setError(null);
  };

  const handleOpenEdit = (uni: UniversityItem) => {
    setModalMode("edit");
    setEditingUni(uni);
    setName(uni.name);
    setShortName(uni.shortName || "");
    setLocation(uni.location || "");
    setCountry(uni.country || "Uganda");
    setIsActive(uni.isActive);
    setError(null);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingUni(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("University name is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (modalMode === "add") {
        const res = await fetch("/api/universities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            shortName: shortName.trim() || null,
            location: location.trim() || "Kampala",
            country: country.trim() || "Uganda",
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to create university");
          return;
        }
      } else if (modalMode === "edit" && editingUni) {
        const res = await fetch(`/api/universities/${editingUni.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            shortName: shortName.trim() || null,
            location: location.trim() || null,
            country: country.trim() || "Uganda",
            isActive,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to update university");
          return;
        }
      }

      handleCloseModal();
      await refreshList();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (uni: UniversityItem) => {
    try {
      const res = await fetch(`/api/universities/${uni.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !uni.isActive }),
      });
      if (res.ok) {
        await refreshList();
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const filtered = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.shortName && u.shortName.toLowerCase().includes(search.toLowerCase())) ||
      (u.location && u.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Campus Registry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            University Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Maintain the verified list of universities. Campuses serve strictly as audience measurement categories.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold self-start sm:self-auto"
        >
          Add University
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search universities by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <span className="text-xs text-slate-400 self-start sm:self-auto">
          Showing <strong>{filtered.length}</strong> of {universities.length} universities
        </span>
      </div>

      {/* Table */}
      <Card className="border-navy-800 bg-navy-850/80 overflow-hidden shadow-xl">
        <CardContent className="p-0 overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="font-semibold text-slate-400">No universities match your search</p>
              <p className="text-[11px]">Try adjusting your search query or add a new university.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-900 border-b border-navy-750 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-bold">University & Short Code</th>
                  <th className="py-3.5 px-4 font-bold text-center">Location</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Audience (Listeners)</th>
                  <th className="py-3.5 px-4 font-bold text-right">Sessions</th>
                  <th className="py-3.5 px-4 font-bold text-right">Avg Duration</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-750">
                {filtered.map((uni) => (
                  <tr key={uni.id} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center text-radio-400 flex-shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs sm:text-sm">
                              {uni.name}
                            </span>
                            {uni.shortName && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-900 border border-navy-700 text-radio-300 font-bold">
                                {uni.shortName}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Registered on {new Date(uni.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-300">
                      {uni.location ? `${uni.location}, ${uni.country}` : uni.country}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(uni)}
                        className="cursor-pointer focus:outline-none"
                        title={uni.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        <Badge variant={uni.isActive ? "online" : "offline"} size="sm">
                          {uni.isActive ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {uni.listenerCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {uni.sessionCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-300">
                      {uni.avgDurationMinutes} min
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(uni)}
                          aria-label={`Edit ${uni.name}`}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-navy-900 border border-navy-750 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-radio-400" />
                <h3 className="text-lg font-bold text-white">
                  {modalMode === "add" ? "Add New University" : "Edit University"}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">
                  Full University Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Makerere University"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-radio-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">
                    Short Code / Acronym
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MAK"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 uppercase focus:outline-none focus:border-radio-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300 block">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kampala"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-radio-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 block">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g. Uganda"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 focus:outline-none focus:border-radio-400"
                />
              </div>

              {modalMode === "edit" && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-radio-500 focus:ring-radio-400 bg-navy-850 border-navy-700"
                  />
                  <label htmlFor="isActiveCheck" className="text-slate-300 font-medium">
                    Active in listener selection modal
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={submitting}
                  className="font-bold px-5"
                >
                  {submitting
                    ? "Saving..."
                    : modalMode === "add"
                    ? "Add University"
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
