"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { DayOfWeek } from "@/types";

interface ProgrammeOption {
  id: string;
  title: string;
  presenter: { name: string };
}

interface ScheduleSlot {
  id: string;
  programmeId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
  programme: {
    title: string;
    presenter: { name: string };
    category: { name: string };
  };
}

interface Props {
  initialSchedules: ScheduleSlot[];
  programmes: ProgrammeOption[];
}

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export function ScheduleManagementClient({
  initialSchedules,
  programmes,
}: Props) {
  const [schedules, setSchedules] = React.useState<ScheduleSlot[]>(initialSchedules);
  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek | "ALL">("MONDAY");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingSlot, setEditingSlot] = React.useState<ScheduleSlot | null>(null);

  // Form State
  const [programmeId, setProgrammeId] = React.useState("");
  const [dayOfWeek, setDayOfWeek] = React.useState<DayOfWeek>("MONDAY");
  const [startTime, setStartTime] = React.useState("08:00");
  const [endTime, setEndTime] = React.useState("10:00");
  const [isLive, setIsLive] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const filteredSchedules = schedules
    .filter((s) => (selectedDay === "ALL" ? true : s.dayOfWeek.toUpperCase() === selectedDay))
    .sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return DAYS.indexOf(a.dayOfWeek as any) - DAYS.indexOf(b.dayOfWeek as any);
      }
      return a.startTime.localeCompare(b.startTime);
    });

  const openCreateModal = () => {
    setEditingSlot(null);
    setProgrammeId(programmes[0]?.id || "");
    setDayOfWeek(selectedDay === "ALL" ? "MONDAY" : selectedDay);
    setStartTime("08:00");
    setEndTime("10:00");
    setIsLive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (slot: ScheduleSlot) => {
    setEditingSlot(slot);
    setProgrammeId(slot.programmeId);
    setDayOfWeek(slot.dayOfWeek as DayOfWeek);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setIsLive(slot.isLive);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editingSlot
        ? `/api/admin/schedules/${editingSlot.id}`
        : `/api/admin/schedules`;
      const method = editingSlot ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmeId,
          dayOfWeek,
          startTime,
          endTime,
          isLive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save schedule slot");
      }

      if (editingSlot) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === editingSlot.id ? data.schedule : s))
        );
        setSuccess(`Updated schedule slot.`);
      } else {
        setSchedules((prev) => [...prev, data.schedule]);
        setSuccess(`Created schedule slot.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (slot: ScheduleSlot) => {
    if (
      !confirm(
        `Delete schedule slot for "${slot.programme.title}" on ${slot.dayOfWeek} (${slot.startTime}-${slot.endTime})?`
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/schedules/${slot.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete slot");
      }

      setSchedules((prev) => prev.filter((s) => s.id !== slot.id));
      setSuccess("Schedule slot deleted successfully.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to delete schedule slot");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Timetable Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Broadcast Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Set weekly recurring airtimes, show segments, and live broadcast flags. Times are in Africa/Kampala (EAT).
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold self-start sm:self-auto"
        >
          Add Time Slot
        </Button>
      </div>

      {success && (
        <Alert variant="success" title="Success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Day Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedDay("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedDay === "ALL"
              ? "bg-radio-500 text-navy-950 font-bold"
              : "bg-navy-900 text-slate-400 hover:text-white border border-navy-800"
          }`}
        >
          All Days ({schedules.length})
        </button>
        {DAYS.map((day) => {
          const count = schedules.filter((s) => s.dayOfWeek.toUpperCase() === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDay === day
                  ? "bg-radio-500 text-navy-950 font-bold"
                  : "bg-navy-900 text-slate-400 hover:text-white border border-navy-800"
              }`}
            >
              {day.slice(0, 3)} ({count})
            </button>
          );
        })}
      </div>

      {/* Schedule Table / Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="p-12 text-center bg-navy-900/50 border border-navy-800 rounded-2xl">
          <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No scheduled shows for this day</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "Add Time Slot" to schedule a programme on air.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSchedules.map((slot) => (
            <Card
              key={slot.id}
              className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 text-center py-2 px-3 bg-navy-900 border border-navy-750 rounded-xl flex-shrink-0">
                    <span className="text-[10px] font-bold text-radio-400 uppercase tracking-wider block">
                      {slot.dayOfWeek.slice(0, 3)}
                    </span>
                    <span className="text-xs font-mono font-bold text-white block mt-0.5">
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white">
                        {slot.programme.title}
                      </h3>
                      <Badge variant="category" size="sm">
                        {slot.programme.category.name}
                      </Badge>
                      {slot.isLive && (
                        <Badge variant="live" size="sm">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Presenter: <strong className="text-slate-300">{slot.programme.presenter.name}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(slot)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(slot)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlot ? "Edit Schedule Slot" : "Add Schedule Slot"}
        description="Allocate airtime on the weekly broadcast timetable."
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Select Programme *
            </label>
            <select
              required
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-radio-500"
            >
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (Host: {p.presenter.name})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Day of the Week *
            </label>
            <select
              required
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-radio-500"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time (24h HH:mm) *"
              required
              placeholder="08:00"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              helperText="EAT (Africa/Kampala)"
            />

            <Input
              label="End Time (24h HH:mm) *"
              required
              placeholder="10:00"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              helperText="EAT (Africa/Kampala)"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isLiveSlot"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              className="w-4 h-4 accent-radio-500 rounded cursor-pointer"
            />
            <label htmlFor="isLiveSlot" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Live Broadcast Slot (Broadcasted directly from studio)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-navy-750">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="font-bold"
            >
              {editingSlot ? "Update Slot" : "Add to Timetable"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
