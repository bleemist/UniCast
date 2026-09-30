"use client";

import * as React from "react";
import Image from "next/image";
import {
  Layers,
  Plus,
  Edit2,
  Archive,
  Search,
  CheckCircle2,
  XCircle,
  Upload,
  Mic,
  Calendar,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";

interface Category {
  id: string;
  name: string;
}

interface Presenter {
  id: string;
  name: string;
}

interface Programme {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  coverImage: string;
  categoryId: string;
  presenterId: string;
  isActive: boolean;
  isArchived: boolean;
  category: Category;
  presenter: Presenter;
  schedules: Array<{
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

interface Props {
  initialProgrammes: Programme[];
  categories: Category[];
  presenters: Presenter[];
}

export function ProgrammeManagementClient({
  initialProgrammes,
  categories,
  presenters,
}: Props) {
  const [programmes, setProgrammes] = React.useState<Programme[]>(initialProgrammes);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProg, setEditingProg] = React.useState<Programme | null>(null);

  // Form State
  const [title, setTitle] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [presenterId, setPresenterId] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const filteredProgrammes = programmes.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.presenter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingProg(null);
    setTitle("");
    setTagline("");
    setDescription("");
    setCoverImage("");
    setCategoryId(categories[0]?.id || "");
    setPresenterId(presenters[0]?.id || "");
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prog: Programme) => {
    setEditingProg(prog);
    setTitle(prog.title);
    setTagline(prog.tagline);
    setDescription(prog.description);
    setCoverImage(prog.coverImage);
    setCategoryId(prog.categoryId);
    setPresenterId(prog.presenterId);
    setIsActive(prog.isActive);
    setError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
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
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editingProg
        ? `/api/admin/programmes/${editingProg.id}`
        : `/api/admin/programmes`;
      const method = editingProg ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          tagline,
          description,
          coverImage,
          categoryId,
          presenterId,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save programme");
      }

      if (editingProg) {
        setProgrammes((prev) =>
          prev.map((p) => (p.id === editingProg.id ? { ...p, ...data.programme } : p))
        );
        setSuccess(`Updated "${title}" successfully.`);
      } else {
        setProgrammes((prev) => [data.programme, ...prev]);
        setSuccess(`Created programme "${title}" successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (prog: Programme) => {
    if (!confirm(`Are you sure you want to archive "${prog.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/programmes/${prog.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to archive programme");
      }

      setProgrammes((prev) => prev.filter((p) => p.id !== prog.id));
      setSuccess(`Archived "${prog.title}".`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to archive programme");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Programming Roster
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Radio Programmes
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, edit, and organize scheduled shows, host presenters, and cover art.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold self-start sm:self-auto"
        >
          Add New Programme
        </Button>
      </div>

      {success && (
        <Alert variant="success" title="Success" onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search by title, host, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Grid */}
      {filteredProgrammes.length === 0 ? (
        <div className="p-12 text-center bg-navy-900/50 border border-navy-800 rounded-2xl">
          <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No programmes found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or create a new programme above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProgrammes.map((prog) => (
            <Card
              key={prog.id}
              className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-navy-900 overflow-hidden">
                  <Image
                    src={prog.coverImage || "/images/programmes/default.jpg"}
                    alt={prog.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant="category" size="sm">
                      {prog.category.name}
                    </Badge>
                    <Badge variant={prog.isActive ? "online" : "offline"} size="sm">
                      {prog.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {prog.tagline}
                  </p>

                  <div className="pt-2 border-t border-navy-750 flex items-center gap-2 text-xs text-slate-300">
                    <Mic className="w-3.5 h-3.5 text-radio-400" />
                    <span>Host: <strong>{prog.presenter.name}</strong></span>
                  </div>

                  <div className="text-xs text-slate-400">
                    <span>Scheduled Slots: <strong>{prog.schedules?.length || 0} active</strong></span>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 border-t border-navy-750/80 bg-navy-900/40 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(prog)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchive(prog)}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  leftIcon={<Archive className="w-3.5 h-3.5" />}
                >
                  Archive
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProg ? `Edit: ${editingProg.title}` : "Add New Programme"}
        description="Provide show identity, category, assigned presenter, and artwork."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Programme Title *"
              required
              placeholder="e.g. The Campus Breakfast Show"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              label="Tagline / Catchphrase *"
              required
              placeholder="e.g. Kickstarting your academic day"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>

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
                Lead Host / Presenter *
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
            label="Programme Description *"
            required
            rows={3}
            placeholder="Comprehensive description of the show, segments, and topics covered..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Cover Image Upload / URL */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Cover Artwork
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                placeholder="/images/programmes/show.jpg or upload"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1"
              />
              <label className="cursor-pointer bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0">
                <Upload className="w-4 h-4 text-radio-400" />
                <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            {coverImage && (
              <div className="relative h-28 w-44 rounded-lg overflow-hidden border border-navy-700 mt-2">
                <Image src={coverImage} alt="Cover Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-radio-500 rounded cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Active Programme (Visible on public schedule and directories)
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
              {editingProg ? "Save Changes" : "Create Programme"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
