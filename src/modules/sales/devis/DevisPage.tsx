import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  XCircle,
} from "lucide-react";

import { getAllDevis, removeDevis } from "../../../services/devisService";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import DevisFormModal from "./components/DevisFormModal";
import DevisDetailModal from "./components/DevisDetailModal";
import ConvertDevisModal from "./components/ConvertDevisModal";

import type { Devis, DevisStatut } from "../../../interfaces/devis.types";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value: string | number): string {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

function getStatusLabel(statut: DevisStatut): string {
  const labels: Record<DevisStatut, string> = {
    en_attente: "En attente",
    accepte: "Accepté",
    refuse: "Refusé",
    converti: "Converti",
  };

  return labels[statut] || statut;
}

function getStatusClass(statut: DevisStatut): string {
  const classes: Record<DevisStatut, string> = {
    en_attente: "bg-warning-bg text-warning",
    accepte: "bg-success-bg text-success",
    refuse: "bg-danger-bg text-danger",
    converti: "bg-primary-bg text-primary",
  };

  return classes[statut] || "bg-bg-subtle text-text-muted";
}

export default function DevisPage(): React.JSX.Element {
  const [devis, setDevis] = useState<Devis[]>([]);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState<"all" | DevisStatut>("all");

  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDevis, setEditingDevis] = useState<Devis | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);


  const [convertOpen, setConvertOpen] = useState(false);
  const [devisToConvert, setDevisToConvert] = useState<Devis | null>(null);


  const openConvert = (item: Devis) => {
    if (item.statut === "converti") {
      alert("Ce devis est déjà converti en vente.");
      return;
    }

    if (item.statut === "refuse") {
      alert("Impossible de convertir un devis refusé.");
      return;
    }

    setDevisToConvert(item);
    setConvertOpen(true);
  };

  const filteredDevis = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return devis.filter((item) => {
      const matchesSearch = !keyword
        ? true
        : `
          ${item.id}
          ${item.client?.nom ?? ""}
          ${item.client?.prenom ?? ""}
          ${item.client?.telephone ?? ""}
          ${item.statut}
          ${item.lignes?.map((ligne) => ligne.produit.designation).join(" ") ?? ""}
        `
            .toLowerCase()
            .includes(keyword);

      const matchesStatut =
        statutFilter === "all" ? true : item.statut === statutFilter;

      return matchesSearch && matchesStatut;
    });
  }, [devis, search, statutFilter]);

  const totalAmount = useMemo(() => {
    return devis.reduce((sum, item) => sum + Number(item.montantTotal || 0), 0);
  }, [devis]);

  const pendingCount = useMemo(() => {
    return devis.filter((item) => item.statut === "en_attente").length;
  }, [devis]);

  const convertedCount = useMemo(() => {
    return devis.filter((item) => item.statut === "converti").length;
  }, [devis]);

  const fetchDevis = async () => {
    try {
      setLoading(true);
      const data = await getAllDevis();
      setDevis(data);
    } catch (error) {
      console.error("Erreur chargement devis:", error);
      setDevis([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevis();
  }, []);

  const openCreateForm = () => {
    setEditingDevis(null);
    setFormOpen(true);
  };

  const openEditForm = (item: Devis) => {
    if (item.statut === "converti") {
      alert("Ce devis est déjà converti en vente. Modification non autorisée.");
      return;
    }

    setEditingDevis(item);
    setFormOpen(true);
  };

  const openDetail = (item: Devis) => {
    setSelectedDevis(item);
    setDetailOpen(true);
  };

  const openDelete = (item: Devis) => {
    if (item.statut === "converti") {
      alert("Impossible de supprimer un devis déjà converti en vente.");
      return;
    }

    setSelectedDevis(item);
    setDeleteOpen(true);
  };

  const handleSavedDevis = async () => {
    setFormOpen(false);
    setEditingDevis(null);
    await fetchDevis();
  };

  const confirmDelete = async () => {
    if (!selectedDevis) return;

    try {
      setDeleting(true);

      await removeDevis(selectedDevis.id);

      setDevis((prev) => prev.filter((item) => item.id !== selectedDevis.id));

      setDeleteOpen(false);
      setSelectedDevis(null);
    } catch (error) {
      console.error("Erreur suppression devis:", error);
      alert("Impossible de supprimer ce devis.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Commercial</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-h">
            Devis
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Créez, suivez et gérez les propositions commerciales des clients.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} />
          Nouveau devis
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <FileText size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{devis.length}</p>
          <p className="mt-1 text-sm text-text-muted">Total devis</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg text-warning">
            <FileText size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{pendingCount}</p>
          <p className="mt-1 text-sm text-text-muted">En attente</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success">
            <CheckCircle2 size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{convertedCount}</p>
          <p className="mt-1 text-sm text-text-muted">Convertis</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg text-info">
            <FileText size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {formatPrice(totalAmount)}
          </p>
          <p className="mt-1 text-sm text-text-muted">Montant total</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des devis
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredDevis.length} devis trouvé
              {filteredDevis.length > 1 ? "s" : ""}
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
                placeholder="Rechercher client, téléphone..."
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <select
              value={statutFilter}
              onChange={(event) =>
                setStatutFilter(event.target.value as "all" | DevisStatut)
              }
              className="rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition focus:border-primary"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="accepte">Acceptés</option>
              <option value="refuse">Refusés</option>
              <option value="converti">Convertis</option>
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
        ) : filteredDevis.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <XCircle size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucun devis trouvé
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Créez un devis pour commencer le suivi commercial.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredDevis.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                    <FileText size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-text-h">
                        Devis #{item.id}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusClass(
                          item.statut,
                        )}`}
                      >
                        {getStatusLabel(item.statut)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span>
                        {item.client
                          ? `${item.client.nom} ${item.client.prenom}`
                          : `Client #${item.clientId}`}
                      </span>

                      <span>{item.client?.telephone ?? "—"}</span>
                      <span>{formatDate(item.dateDevis)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:min-w-[300px]">
                  <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-text-h">
                      {item.lignes?.length ?? 0}
                    </p>
                    <p className="text-[11px] text-text-muted">Produits</p>
                  </div>

                  <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-text-h">
                      {formatPrice(item.montantTotal)}
                    </p>
                    <p className="text-[11px] text-text-muted">Montant</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openDetail(item)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                    title="Voir"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                    title="Modifier"
                  >
                    <Edit3 size={15} />
                  </button>

                  {item.statut !== "converti" && item.statut !== "refuse" && (
                    <button
                      type="button"
                      onClick={() => openConvert(item)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-success hover:text-success"
                      title="Convertir en vente"
                    >
                      <ShoppingCart size={15} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openDelete(item)}
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
        <DevisFormModal
          devis={editingDevis}
          onClose={() => {
            setFormOpen(false);
            setEditingDevis(null);
          }}
          onSaved={() => {
            void handleSavedDevis();
          }}
        />
      )}

      {convertOpen && devisToConvert && (
        <ConvertDevisModal
          devis={devisToConvert}
          onClose={() => {
            setConvertOpen(false);
            setDevisToConvert(null);
          }}
          onConverted={async () => {
            setConvertOpen(false);
            setDevisToConvert(null);
            await fetchDevis();
          }}
        />
      )}

      {detailOpen && selectedDevis && (
        <DevisDetailModal
          devis={selectedDevis}
          onClose={() => {
            setDetailOpen(false);
            setSelectedDevis(null);
          }}
        />
      )}

      {deleteOpen && selectedDevis && (
        <DeleteConfirmModal
          title="Supprimer le devis"
          description={`Êtes-vous sûr de vouloir supprimer le devis #${selectedDevis.id} ? Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedDevis(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
}
