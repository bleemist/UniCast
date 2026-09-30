"use client";

import * as React from "react";
import {
  Users,
  Plus,
  Shield,
  Key,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { Role } from "@/types";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface Props {
  initialUsers: User[];
  currentUserId: string;
}

export function UserManagementClient({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  // Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<Role>("RADIO_ADMIN");

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("RADIO_ADMIN");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRole(u.role);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : `/api/admin/users`;
      const method = editingUser ? "PUT" : "POST";

      const payload: any = { name, role };
      if (!editingUser) {
        payload.email = email;
        payload.password = password;
      } else if (password) {
        payload.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save user account");
      }

      if (editingUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...data.user } : u))
        );
        setSuccess(`Updated user "${name}".`);
      } else {
        setUsers((prev) => [...prev, data.user]);
        setSuccess(`Created user "${name}" successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (u.id === currentUserId) {
      alert("You cannot delete your own active administrator account.");
      return;
    }

    if (!confirm(`Are you sure you want to delete user account "${u.name}" (${u.email})?`))
      return;

    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      setSuccess(`User "${u.name}" deleted.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-radio-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
              Access Control & RBAC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Users & Role Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage administrative personnel, presenter logins, and role capabilities.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openCreateModal}
          leftIcon={<Plus className="w-4 h-4" />}
          className="font-bold self-start sm:self-auto"
        >
          Add Authorized User
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
          placeholder="Search by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((u) => (
          <Card
            key={u.id}
            className="border-navy-800 bg-navy-850/80 hover:border-navy-700 transition-colors p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-750 flex items-center justify-center text-radio-400 font-bold flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold text-white">{u.name}</h4>
                    <Badge variant="category" size="sm">
                      {u.role}
                    </Badge>
                    {u.id === currentUserId && (
                      <Badge variant="online" size="sm">
                        YOU
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-xs font-mono text-slate-500 mr-2 hidden sm:inline">
                  Joined: {new Date(u.createdAt).toLocaleDateString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(u)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit
                </Button>
                {u.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(u)}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit: ${editingUser.name}` : "Create Authorized User"}
        description="Assign role permissions and credentials for station management."
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {error && (
            <Alert variant="error" title="Error" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Input
            label="Full Name *"
            required
            placeholder="e.g. Isaac Mugerwa"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address *"
            type="email"
            required={!editingUser}
            disabled={!!editingUser}
            placeholder="e.g. isaac@unicast.radio"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText={editingUser ? "Email cannot be changed once created" : undefined}
          />

          <Input
            label={editingUser ? "Reset Password (Leave blank to keep current)" : "Password *"}
            type="password"
            required={!editingUser}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Role & Capability Level *
            </label>
            <select
              required
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-radio-500"
            >
              <option value="RADIO_ADMIN">RADIO_ADMIN (Programmes, Presenters, Schedule, Requests, Analytics)</option>
              <option value="EDITOR">EDITOR (News Articles, Editorial Content, Analytics)</option>
              <option value="PRESENTER">PRESENTER (Assigned Shows, Song Requests, Live Broadcast)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Full Unrestricted System & Settings Access)</option>
            </select>
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
              {editingUser ? "Save User" : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
