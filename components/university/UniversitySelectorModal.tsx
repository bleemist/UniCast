"use client";

import * as React from "react";
import { GraduationCap, Search, Check, X, Shield, Sparkles, Building2 } from "lucide-react";
import {
  getSelectedUniversity,
  setSelectedUniversity,
  setDismissUniversityPrompt,
  hasDismissedUniversityPrompt,
} from "@/lib/analytics";
import { Button } from "@/components/ui/Button";

interface UniversityOption {
  id: string;
  name: string;
  shortName?: string | null;
  location?: string | null;
}

interface UniversitySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelected?: (uni: { id: string; name: string }) => void;
}

export function UniversitySelectorModal({
  isOpen,
  onClose,
  onSelected,
}: UniversitySelectorModalProps) {
  const [universities, setUniversities] = React.useState<UniversityOption[]>([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [confirmedName, setConfirmedName] = React.useState<string | null>(null);

  // Fetch active universities on open
  React.useEffect(() => {
    if (!isOpen) return;

    const current = getSelectedUniversity();
    if (current) {
      setSelectedId(current.id);
    }

    async function loadUniversities() {
      try {
        setLoading(true);
        const res = await fetch("/api/universities");
        if (res.ok) {
          const data = await res.json();
          if (data.universities) {
            setUniversities(data.universities);
          }
        }
      } catch (err) {
        console.error("Failed to load universities list:", err);
      } finally {
        setLoading(false);
      }
    }

    loadUniversities();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUniversities = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.shortName && u.shortName.toLowerCase().includes(search.toLowerCase())) ||
      (u.location && u.location.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (uni: UniversityOption) => {
    setSelectedId(uni.id);
  };

  const handleConfirm = () => {
    const chosen = universities.find((u) => u.id === selectedId);
    if (!chosen) return;

    setSelectedUniversity(chosen.id, chosen.name);
    setConfirmedName(chosen.name);

    if (onSelected) {
      onSelected({ id: chosen.id, name: chosen.name });
    }

    // Auto close after showing thank you feedback
    setTimeout(() => {
      setConfirmedName(null);
      onClose();
    }, 1800);
  };

  const handleSkip = () => {
    setDismissUniversityPrompt();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-navy-900 border border-navy-750 shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-radio-500/10 blur-[80px] pointer-events-none rounded-full" />

        {confirmedName ? (
          /* Success state after selection */
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-white">
                Thanks! You&apos;re listening from {confirmedName}.
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your campus has been attached to listener analytics. Enjoy the live UniCast broadcast!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-radio-500/20 border border-radio-500/40 flex items-center justify-center text-radio-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Which university are you from?
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Help us measure which universities are tuning in most. All campuses hear the exact same live stream.
                </p>
              </div>

              <button
                onClick={handleSkip}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your university (e.g. Kyambogo, Makerere, MUST)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-850 border border-navy-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-radio-400 focus:ring-1 focus:ring-radio-400 transition-all"
              />
            </div>

            {/* University Selection List */}
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                  <div className="w-5 h-5 border-2 border-radio-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p>Loading universities roster...</p>
                </div>
              ) : filteredUniversities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                  <Building2 className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="font-semibold text-slate-300">No matching university found</p>
                  <p className="text-[11px] text-slate-500">
                    Try searching by full name or acronym (e.g. KYU, MAK)
                  </p>
                </div>
              ) : (
                filteredUniversities.map((uni) => {
                  const isSelected = selectedId === uni.id;
                  return (
                    <button
                      key={uni.id}
                      type="button"
                      onClick={() => handleSelect(uni)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-radio-500/15 border-radio-400/80 text-white shadow-sm shadow-radio-500/20"
                          : "bg-navy-850/60 border-navy-800 text-slate-300 hover:bg-navy-800 hover:border-navy-700"
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-white truncate">
                            {uni.name}
                          </span>
                          {uni.shortName && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-navy-800 border border-navy-700 text-radio-300 font-bold">
                              {uni.shortName}
                            </span>
                          )}
                        </div>
                        {uni.location && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {uni.location}
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                          isSelected
                            ? "border-radio-400 bg-radio-500 text-navy-950 font-bold"
                            : "border-navy-600 bg-navy-900"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Privacy Assurance Note */}
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-navy-950 border border-navy-800 text-[11px] text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>100% Anonymous:</strong> UniCast does not ask for student IDs, emails, or logins.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-navy-800">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium px-2 py-1.5"
              >
                Skip for now
              </button>

              <Button
                variant="primary"
                size="md"
                disabled={!selectedId}
                onClick={handleConfirm}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="font-bold px-5"
              >
                Select University
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
