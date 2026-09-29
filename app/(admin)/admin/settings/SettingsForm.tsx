"use client";

import * as React from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Save, Radio, Mail, Phone, Tag } from "lucide-react";

interface SettingsFormProps {
  initialSettings: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [stationName, setStationName] = React.useState(
    initialSettings?.stationName || "UniCast"
  );
  const [frequency, setFrequency] = React.useState(
    initialSettings?.frequency || "Online Radio Network"
  );
  const [streamUrl, setStreamUrl] = React.useState(
    initialSettings?.streamUrl || "https://stream.zeno.fm/f3wvbbqmdg8uv"
  );
  const [contactEmail, setContactEmail] = React.useState(
    initialSettings?.contactEmail || "studio@unicast.radio"
  );
  const [contactPhone, setContactPhone] = React.useState(
    initialSettings?.contactPhone || "+256 700 000 000"
  );

  const [isLoading, setIsLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stationName,
          frequency,
          streamUrl,
          contactEmail,
          contactPhone,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <Alert variant="success" title="Settings Saved">
          Radio station parameters updated successfully.
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Station Brand Name *"
          required
          value={stationName}
          onChange={(e) => setStationName(e.target.value)}
          leftIcon={<Radio className="w-4 h-4" />}
        />

        <Input
          label="Broadcast Frequency *"
          required
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          leftIcon={<Tag className="w-4 h-4" />}
        />
      </div>

      <Input
        label="Stream Server Mount URL *"
        required
        value={streamUrl}
        onChange={(e) => setStreamUrl(e.target.value)}
        helperText="Icecast mount or public streaming relay endpoint"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Station Email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Studio Phone Line"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4" />}
        />
      </div>

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save All Changes
        </Button>
      </div>
    </form>
  );
}
