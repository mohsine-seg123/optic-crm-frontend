import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";

import {
  getAllUtilisateurs,
  removeUtilisateur,
} from "../../services/utilisateurService";

import DeleteConfirmModal from "../../components/ui/DeleteConfirmModal";
import UtilisateurFormModal from "./components/UtilisateurFormModal";

import type { UserRole, Utilisateur } from "../../interfaces/utilisateur.types";

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    admin: "Admin",
    vendeur: "Vendeur",
  };

  return labels[role] || role;
}

function getRoleClass(role: UserRole): string {
  const classes: Record<UserRole, string> = {
    admin: "bg-primary-bg text-primary",
    vendeur: "bg-success-bg text-success",
  };

  return classes[role] || "bg-bg-subtle text-text-muted";
}

function getInitials(user: Utilisateur): string {
  return `${user.nom?.[0] ?? ""}${user.prenom?.[0] ?? ""}`.toUpperCase();
}

export default function UtilisateurPage(): React.JSX.Element {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");

  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Utilisateur | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = !keyword
        ? true
        : `
          ${user.nom}
          ${user.prenom}
          ${user.email}
          ${user.role}
        `
            .toLowerCase()
            .includes(keyword);

      const matchesRole =
        roleFilter === "all" ? true : user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const adminsCount = useMemo(() => {
    return users.filter((user) => user.role === "admin").length;
  }, [users]);

  const vendeursCount = useMemo(() => {
    return users.filter((user) => user.role === "vendeur").length;
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUtilisateurs();
      setUsers(data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreateForm = () => {
    setEditingUser(null);
    setFormOpen(true);
  };

  const openEditForm = (user: Utilisateur) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleSavedUser = (savedUser: Utilisateur) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((user) => (user.id === savedUser.id ? savedUser : user)),
      );
    } else {
      setUsers((prev) => [savedUser, ...prev]);
    }

    setEditingUser(null);
  };

  const openDelete = (user: Utilisateur) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setDeleting(true);

      await removeUtilisateur(selectedUser.id);

      setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id));

      setDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erreur suppression utilisateur:", error);
      alert("Impossible de supprimer cet utilisateur.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Administration</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-h">
            Utilisateurs
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Gérez les comptes administrateurs et vendeurs du système.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} />
          Nouvel utilisateur
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <UsersRound size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{users.length}</p>
          <p className="mt-1 text-sm text-text-muted">Utilisateurs</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <ShieldCheck size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{adminsCount}</p>
          <p className="mt-1 text-sm text-text-muted">Admins</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success">
            <UserRound size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{vendeursCount}</p>
          <p className="mt-1 text-sm text-text-muted">Vendeurs</p>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des utilisateurs
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredUsers.length} utilisateur
              {filteredUsers.length > 1 ? "s" : ""} trouvé
              {filteredUsers.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-80">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher nom, email, rôle..."
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(event.target.value as "all" | UserRole)
              }
              className="rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition focus:border-primary"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Admins</option>
              <option value="vendeur">Vendeurs</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-bg-subtle"
              />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <XCircle size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucun utilisateur trouvé
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Créez un compte admin ou vendeur pour commencer.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-bg text-sm font-semibold text-primary">
                    {getInitials(user)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-text-h">
                        {user.nom} {user.prenom}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getRoleClass(
                          user.role,
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Mail size={12} />
                        {user.email}
                      </span>

                      <span>ID #{user.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(user)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                    title="Modifier"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openDelete(user)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-danger hover:text-danger"
                    title="Supprimer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <UtilisateurFormModal
          utilisateur={editingUser}
          onClose={() => {
            setFormOpen(false);
            setEditingUser(null);
          }}
          onSaved={handleSavedUser}
        />
      )}

      {deleteOpen && selectedUser && (
        <DeleteConfirmModal
          title="Supprimer l'utilisateur"
          description={`Êtes-vous sûr de vouloir supprimer "${selectedUser.nom} ${selectedUser.prenom}" ? Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
}
