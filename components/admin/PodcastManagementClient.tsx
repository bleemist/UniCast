"use client";

import * as React from "react";
import Image from "next/image";
import {
  Headphones,
  Plus,
  Edit2,
  Archive,
  Search,
  Upload,
  Play,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { formatDuration } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Presenter {
  id: string;
  name: string;
}

interface Podcast {
  id: string;
  title: string;
  slug: string;
  description: string;
  audioUrl: string;
  duration: number;
  coverImage: string;
  categoryId: string;
  presenterId: string;
  isPublished: boolean;
  isArchived: boolean;
  category: Category;
  presenter: Presenter;
  createdAt: string;
}

interface Props {
  initialPodcasts: Podcast[];
  categories: Category[];
  presenters: Presenter[];
}

export function PodcastManagementClient({
  initialPodcasts,
  categories,
  presenters,
}: Props) {
  const [podcasts, setPodcasts] = React.useState<Podcast[]>(initialPodcasts);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPodcast, setEditingPodcast] = React.useState<Podcast | null>(null);

  // Form State
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [audioUrl, setAudioUrl] = React.useState("");
  const [duration, setDuration] = React.useState("1800");
  const [coverImage, setCoverImage] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [presenterId, setPresenterId] = React.useState("");
  const [isPublished, setIsPublished] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const filteredPodcasts = podcasts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.presenter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingPodcast(null);
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setDuration("1800");
    setCoverImage("");
    setCategoryId(categories[0]?.id || "");
    setPresenterId(presenters[0]?.id || "");
    setIsPublished(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Podcast) => {
    setEditingPodcast(p);
    setTitle(p.title);
    setDescription(p.description);
    setAudioUrl(p.audioUrl);
    setDuration(String(p.duration));
    setCoverImage(p.coverImage);
    setCategoryId(p.categoryId);
    setPresenterId(p.presenterId);
    setIsPublished(p.isPublished);
    setError(null);
    setIsModalOpen(true);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", "audio");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Audio upload failed");
      }
      setAudioUrl(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload audio file");
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaType", "image");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Image upload failed");
      }
      setCoverImage(data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload cover image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editingPodcast
        ? `/api/admin/podcasts/${editingPodcast.id}`
        : `/api/admin/podcasts`;
      const method = editingPodcast ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          audioUrl,
          duration: Number(duration) || 0,
          coverImage,
          categoryId,
          presenterId,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save podcast");
      }

      if (editingPodcast) {
        setPodcasts((prev) =>
          prev.map((p) => (p.id === editingPodcast.id ? data.podcast : p))
        );
        setSuccess(`Updated podcast "${title}".`);
      } else {
        setPodcasts((prev) => [data.podcast, ...prev]);
        setSuccess(`Uploaded podcast "${title}".`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (p: Podcast) => {
    if (!confirm(`Are you sure you want to archive podcast "${p.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/podcasts/${p.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to archive podcast");
      }

      setPodcasts((prev) => prev.filter((item) => item.id !== p.id));
      setSuccess(`Archived podcast "${p.title}".`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to archive podcast");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Media Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Podcasts & Recordings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload studio session recordings, interviews, and on-demand campus audio.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold self-start sm:self-auto"
        >
          Upload Episode
        </Button>
      </div>

      {success && (
        <Alert variant="success" title="Success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search by title, host, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* List */}
      {filteredPodcasts.length === 0 ? (
        <div className="p-12 text-center bg-navy-900/50 border border-navy-800 rounded-2xl">
          <Headphones className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No podcast episodes found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "Upload Episode" to add your first recorded show.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPodcasts.map((pod) => (
            <Card
              key={pod.id}
              className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-navy-900 border border-navy-700 flex-shrink-0">
                    <Image
                      src={pod.coverImage || "/images/podcasts/default.jpg"}
                      alt={pod.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white">{pod.title}</h3>
                      <Badge variant="category" size="sm">{pod.category.name}</Badge>
                      <Badge variant={pod.isPublished ? "online" : "offline"} size="sm">
                        {pod.isPublished ? "PUBLISHED" : "DRAFT"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      Host: <strong className="text-slate-300">{pod.presenter.name}</strong> • Duration: {formatDuration(pod.duration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(pod)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArchive(pod)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    leftIcon={<Archive className="w-3.5 h-3.5" />}
                  >
                    Archive
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
        title={editingPodcast ? `Edit: ${editingPodcast.title}` : "Upload Podcast Episode"}
        description="Publish on-demand audio content, set host, duration, and episode art."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Input
            label="Episode Title *"
            required
            placeholder="e.g. Episode 12: Navigating University Internships"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-radio-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Host Broadcaster *
              </label>
              <select
                required
                value={presenterId}
                onChange={(e) => setPresenterId(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-radio-500"
              >
                {presenters.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Textarea
            label="Episode Description *"
            required
            rows={3}
            placeholder="Key discussion points, guest interviews, and show notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Audio Upload / URL */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Audio File / Stream URL *
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                required
                placeholder="https://... or /uploads/audio/episode.mp3"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                className="flex-1"
              />
              <label className="cursor-pointer bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0">
                <Upload className="w-4 h-4 text-radio-400" />
                <span>{isUploadingAudio ? "Uploading..." : "Upload MP3"}</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  disabled={isUploadingAudio}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Duration (Seconds) *"
              type="number"
              required
              placeholder="e.g. 1800 for 30 minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              helperText={`Preview: ${formatDuration(Number(duration) || 0)}`}
            />

            {/* Cover Image Upload / URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Cover Image
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="/images/podcasts/cover.jpg"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="flex-1"
                />
                <label className="cursor-pointer bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0">
                  <Upload className="w-3.5 h-3.5 text-radio-400" />
                  <span>{isUploadingImage ? "..." : "Upload"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPodcastPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-radio-500 rounded cursor-pointer"
            />
            <label htmlFor="isPodcastPublished" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Publish Immediately (Visible to public listeners on /podcasts)
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
              {editingPodcast ? "Save Changes" : "Publish Episode"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
