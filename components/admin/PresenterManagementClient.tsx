"use client";

import * as React from "react";
import Image from "next/image";
import {
  Mic,
  Plus,
  Edit2,
  Archive,
  Search,
  Upload,
  Globe,
  Radio,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";

interface ProgrammeRef {
  id: string;
  title: string;
}

interface Presenter {
  id: string;
  name: string;
  slug: string;
  roleTitle: string;
  bio: string;
  avatar: string;
  socialLinks: string | null;
  isActive: boolean;
  isArchived: boolean;
  programmes: ProgrammeRef[];
}

interface Props {
  initialPresenters: Presenter[];
}

export function PresenterManagementClient({ initialPresenters }: Props) {
  const [presenters, setPresenters] = React.useState<Presenter[]>(initialPresenters);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPresenter, setEditingPresenter] = React.useState<Presenter | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [roleTitle, setRoleTitle] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [avatar, setAvatar] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [instagram, setInstagram] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [isActive, setIsActive] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const filteredPresenters = presenters.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingPresenter(null);
    setName("");
    setRoleTitle("");
    setBio("");
    setAvatar("");
    setTwitter("");
    setInstagram("");
    setLinkedin("");
    setIsActive(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Presenter) => {
    setEditingPresenter(p);
    setName(p.name);
    setRoleTitle(p.roleTitle);
    setBio(p.bio);
    setAvatar(p.avatar);
    let parsedLinks: any = {};
    try {
      if (p.socialLinks) parsedLinks = JSON.parse(p.socialLinks);
    } catch {}
    setTwitter(parsedLinks.twitter || "");
    setInstagram(parsedLinks.instagram || "");
    setLinkedin(parsedLinks.linkedin || "");
    setIsActive(p.isActive);
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
      setAvatar(data.url);
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

    const socialLinks = {
      twitter: twitter.trim() || undefined,
      instagram: instagram.trim() || undefined,
      linkedin: linkedin.trim() || undefined,
    };

    try {
      const url = editingPresenter
        ? `/api/admin/presenters/${editingPresenter.id}`
        : `/api/admin/presenters`;
      const method = editingPresenter ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          roleTitle,
          bio,
          avatar,
          socialLinks,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save presenter");
      }

      if (editingPresenter) {
        setPresenters((prev) =>
          prev.map((p) => (p.id === editingPresenter.id ? { ...p, ...data.presenter } : p))
        );
        setSuccess(`Updated presenter "${name}".`);
      } else {
        setPresenters((prev) => [{ ...data.presenter, programmes: [] }, ...prev]);
        setSuccess(`Created presenter "${name}".`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (p: Presenter) => {
    if (!confirm(`Are you sure you want to archive presenter "${p.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/presenters/${p.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to archive presenter");
      }

      setPresenters((prev) => prev.filter((item) => item.id !== p.id));
      setSuccess(`Archived presenter "${p.name}".`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to archive presenter");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Talent Roster
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Radio Presenters & DJs
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage student broadcasters, DJs, profile biographies, and social links.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold self-start sm:self-auto"
        >
          Add Presenter
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
          placeholder="Search by presenter name or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Grid */}
      {filteredPresenters.length === 0 ? (
        <div className="p-12 text-center bg-navy-900/50 border border-navy-800 rounded-2xl">
          <Mic className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No presenters found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or add a new presenter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresenters.map((p) => (
            <Card
              key={p.id}
              className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-navy-900 border-2 border-radio-500/40 flex-shrink-0">
                    <Image
                      src={p.avatar || "/images/presenters/default.jpg"}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-radio-400 font-medium">{p.roleTitle}</p>
                    <Badge variant={p.isActive ? "online" : "offline"} size="sm" className="mt-1">
                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {p.bio}
                </p>

                <div className="text-xs text-slate-400 border-t border-navy-750 pt-3">
                  <span>Assigned Shows: <strong>{p.programmes?.length || 0}</strong></span>
                </div>
              </CardContent>

              <div className="p-4 border-t border-navy-750/80 bg-navy-900/40 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(p)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchive(p)}
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
        title={editingPresenter ? `Edit: ${editingPresenter.name}` : "Add New Presenter"}
        description="Configure presenter profile, photo, and social media channels."
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
              label="Full Name *"
              required
              placeholder="e.g. Sandra Nabirye"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Role / On-Air Title *"
              required
              placeholder="e.g. Lead Campus DJ & Host"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>

          <Textarea
            label="Biography *"
            required
            rows={3}
            placeholder="Tell listeners about the presenter's background, passion, and style..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          {/* Avatar Upload / URL */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                placeholder="/images/presenters/photo.jpg or upload"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="flex-1"
              />
              <label className="cursor-pointer bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0">
                <Upload className="w-4 h-4 text-radio-400" />
                <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            {avatar && (
              <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-radio-500/40 mt-2">
                <Image src={avatar} alt="Avatar Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="space-y-2 pt-2 border-t border-navy-750">
            <span className="text-xs font-semibold text-slate-300 block">
              Social Media Handles (Optional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="X / Twitter"
                placeholder="@handle"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
              <Input
                label="Instagram"
                placeholder="@username"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
              />
              <Input
                label="LinkedIn / Web"
                placeholder="https://..."
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPresenterActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-radio-500 rounded cursor-pointer"
            />
            <label htmlFor="isPresenterActive" className="text-xs font-semibold text-slate-300 cursor-pointer">
              Active Broadcaster (Visible on public talent roster)
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
              {editingPresenter ? "Save Changes" : "Create Presenter"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
