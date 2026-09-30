"use client";

import * as React from "react";
import Image from "next/image";
import {
  Newspaper,
  Plus,
  Edit2,
  Archive,
  Search,
  Upload,
  Calendar,
  Sparkles,
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

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  categoryId: string;
  authorId: string;
  isFeatured: boolean;
  isPublished: boolean;
  isArchived: boolean;
  publishedAt: string;
  category: Category;
  author: { id: string; name: string };
  createdAt: string;
}

interface Props {
  initialArticles: Article[];
  categories: Category[];
}

export function NewsManagementClient({ initialArticles, categories }: Props) {
  const [articles, setArticles] = React.useState<Article[]>(initialArticles);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingArticle, setEditingArticle] = React.useState<Article | null>(null);

  // Form State
  const [title, setTitle] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [isPublished, setIsPublished] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setCoverImage("");
    setCategoryId(categories[0]?.id || "");
    setIsFeatured(false);
    setIsPublished(true);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (a: Article) => {
    setEditingArticle(a);
    setTitle(a.title);
    setExcerpt(a.excerpt);
    setContent(a.content);
    setCoverImage(a.coverImage);
    setCategoryId(a.categoryId);
    setIsFeatured(a.isFeatured);
    setIsPublished(a.isPublished);
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
      const url = editingArticle
        ? `/api/admin/news/${editingArticle.id}`
        : `/api/admin/news`;
      const method = editingArticle ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          coverImage,
          categoryId,
          isFeatured,
          isPublished,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save article");
      }

      if (editingArticle) {
        setArticles((prev) =>
          prev.map((a) => (a.id === editingArticle.id ? data.article : a))
        );
        setSuccess(`Updated article "${title}".`);
      } else {
        setArticles((prev) => [data.article, ...prev]);
        setSuccess(`Published article "${title}".`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async (a: Article) => {
    if (!confirm(`Are you sure you want to archive "${a.title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/news/${a.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to archive article");
      }

      setArticles((prev) => prev.filter((item) => item.id !== a.id));
      setSuccess(`Archived article "${a.title}".`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to archive article");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Editorial Desk
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            News & Campus Stories
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish news, entertainment buzz, campus updates, and editorial articles.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold self-start sm:self-auto"
        >
          Create Article
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
          placeholder="Search articles by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* List */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center bg-navy-900/50 border border-navy-800 rounded-2xl">
          <Newspaper className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No articles published yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Click "Create Article" to write your first news piece.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredArticles.map((art) => (
            <Card
              key={art.id}
              className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-navy-900 border border-navy-700 flex-shrink-0">
                    <Image
                      src={art.coverImage || "/images/news/default.jpg"}
                      alt={art.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">{art.title}</h3>
                      <Badge variant="category" size="sm">{art.category.name}</Badge>
                      {art.isFeatured && (
                        <Badge variant="gold" size="sm">
                          FEATURED
                        </Badge>
                      )}
                      <Badge variant={art.isPublished ? "online" : "offline"} size="sm">
                        {art.isPublished ? "PUBLISHED" : "DRAFT"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      By {art.author?.name || "Editorial Team"} • {new Date(art.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(art)}
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArchive(art)}
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
        title={editingArticle ? `Edit: ${editingArticle.title}` : "Create News Article"}
        description="Write campus stories, announcement features, and student articles."
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Article Headline *"
                required
                placeholder="e.g. Makerere and Kyambogo Debate Guild Elections Outcome"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

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
          </div>

          <Textarea
            label="Brief Excerpt / Summary *"
            required
            rows={2}
            placeholder="A compelling 1-2 sentence lead summary..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <Textarea
            label="Article Full Body Content *"
            required
            rows={6}
            placeholder="Write the full journalistic story here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Cover Image Upload / URL */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Featured Header Artwork
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                placeholder="/images/news/story.jpg or upload"
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

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isArticleFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-radio-500 rounded cursor-pointer"
              />
              <label htmlFor="isArticleFeatured" className="text-xs font-semibold text-slate-300 cursor-pointer">
                Highlight on Homepage Featured Slider
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isArticlePublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-radio-500 rounded cursor-pointer"
              />
              <label htmlFor="isArticlePublished" className="text-xs font-semibold text-slate-300 cursor-pointer">
                Publish Immediately to /news
              </label>
            </div>
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
              {editingArticle ? "Save Changes" : "Publish Article"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
