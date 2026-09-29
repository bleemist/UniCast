"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Send, Music, User, GraduationCap, CheckCircle2 } from "lucide-react";

export function SongRequestForm() {
  const [studentName, setStudentName] = React.useState("");
  const [course, setCourse] = React.useState("");
  const [songTitle, setSongTitle] = React.useState("");
  const [artist, setArtist] = React.useState("");
  const [dedication, setDedication] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          course,
          songTitle,
          artist,
          dedication,
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
          title="Request Sent Successfully!"
          onDismiss={() => setSuccess(false)}
        >
          Your song request has arrived in the studio queue. The presenter on air
          will review and play it soon!
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Submission Error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Name / Nickname *"
          required
          placeholder="e.g. Derrick or DJ Sparks"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Course / Faculty (Optional)"
          placeholder="e.g. BSc Computer Science"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          leftIcon={<GraduationCap className="w-4 h-4" />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Song Title *"
          required
          placeholder="e.g. Nana or City Boys"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          leftIcon={<Music className="w-4 h-4" />}
        />

        <Input
          label="Artist Name *"
          required
          placeholder="e.g. Joshua Baraka or Burna Boy"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
      </div>

      <Textarea
        label="Dedication / Shoutout Message (Optional)"
        rows={3}
        placeholder="e.g. Big up to everyone in Mitchell Hall revising for end-of-semester exams!"
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
        Submit Song Request to DJ
      </Button>
    </form>
  );
}
