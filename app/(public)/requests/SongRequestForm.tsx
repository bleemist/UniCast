"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Send, Music, User, GraduationCap, School, CheckCircle2 } from "lucide-react";
import { getSelectedUniversity, getAnonymousListenerId } from "@/lib/analytics";

interface UniversityOption {
  id: string;
  name: string;
  shortName: string | null;
}

export function SongRequestForm() {
  const [studentName, setStudentName] = React.useState("");
  const [course, setCourse] = React.useState("");
  const [universityId, setUniversityId] = React.useState("");
  const [universities, setUniversities] = React.useState<UniversityOption[]>([]);
  const [songTitle, setSongTitle] = React.useState("");
  const [artist, setArtist] = React.useState("");
  const [dedication, setDedication] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Fetch university options
    fetch("/api/universities")
      .then((res) => res.json())
      .then((data) => {
        if (data.universities && Array.isArray(data.universities)) {
          setUniversities(data.universities);
          // Check if user already picked a university in localStorage
          const stored = getSelectedUniversity();
          if (stored?.id) {
            setUniversityId(stored.id);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const anonId = getAnonymousListenerId();
      const selectedUni = universities.find((u) => u.id === universityId);

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim() || undefined,
          course: course.trim() || undefined,
          universityId: universityId || undefined,
          universityName: selectedUni?.name || undefined,
          songTitle,
          artist,
          dedication,
          anonymousListenerId: anonId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSuccess(true);
      setStudentName("");
      setCourse("");
      setSongTitle("");
      setArtist("");
      setDedication("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send your request. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert
          variant="success"
          title="Request Sent to DJ!"
          onDismiss={() => setSuccess(false)}
        >
          Your song request and dedication have been submitted to the live studio queue. The presenter on air will review and play it soon!
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Submission Error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Name or Nickname (Optional)"
          placeholder="e.g. Derrick, DJ Sparks, or leave blank"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          leftIcon={<User className="w-4 h-4 text-slate-400" />}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Your University (Optional)
          </label>
          <div className="relative">
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-radio-500 transition-colors"
            >
              <option value="">Select your university (Optional)</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} {uni.shortName ? `(${uni.shortName})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Course / Faculty (Optional)"
          placeholder="e.g. BSc Computer Science, Law, etc."
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          leftIcon={<GraduationCap className="w-4 h-4 text-slate-400" />}
        />

        <Input
          label="Song Title *"
          required
          placeholder="e.g. Nana or City Boys"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          leftIcon={<Music className="w-4 h-4 text-slate-400" />}
        />
      </div>

      <div>
        <Input
          label="Artist Name *"
          required
          placeholder="e.g. Joshua Baraka, Burna Boy, Azawi"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
      </div>

      <Textarea
        label="Dedication / Shoutout Message (Optional)"
        rows={3}
        placeholder="e.g. Sending this out to all students pulling an all-nighter at the library!"
        value={dedication}
        onChange={(e) => setDedication(e.target.value)}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        rightIcon={<Send className="w-4 h-4" />}
        className="w-full justify-center mt-2 font-bold"
      >
        Submit Song Request to Studio
      </Button>
    </form>
  );
}
