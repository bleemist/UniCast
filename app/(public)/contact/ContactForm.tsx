"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Send, Mail, User, Tag } from "lucide-react";

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send message. Please try again.");
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
          title="Message Sent Successfully!"
          onDismiss={() => setSuccess(false)}
        >
          Thank you for reaching out to Kyambogo Radio. The station management will review your inquiry.
        </Alert>
      )}

      {error && (
        <Alert variant="error" title="Submission Error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Full Name *"
          required
          placeholder="e.g. Sarah Namubiru"
          value={name}
          onChange={(e) => setName(e.target.value)}
          leftIcon={<User className="w-4 h-4" />}
        />

        <Input
          label="Email Address *"
          type="email"
          required
          placeholder="sarah@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />
      </div>

      <Input
        label="Subject *"
        required
        placeholder="e.g. Programme Sponsorship or Campus Announcement"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        leftIcon={<Tag className="w-4 h-4" />}
      />

      <Textarea
        label="Your Message *"
        required
        rows={4}
        placeholder="Type your message, news tip, or feedback for the station..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        rightIcon={<Send className="w-4 h-4" />}
        className="w-full justify-center mt-2 font-bold"
      >
        Send Message to Management
      </Button>
    </form>
  );
}
