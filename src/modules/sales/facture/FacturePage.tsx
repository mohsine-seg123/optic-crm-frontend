import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  ReceiptText,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  downloadFacturePdf,
  getAllFactures,
  removeFacture,
  updateFacture,
} from "../../../services/factureService";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import FactureDetailModal from "./components/FactureDetailModal";

import type { Facture, FactureStatutRemboursement } from "../../../interfaces/facture.types";

function formatPrice(value: string | number): string {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status: FactureStatutRemboursement): string {
  const labels: Record<FactureStatutRemboursement, string> = {
    en_attente: "En attente",
    rembourse: "Remboursé",
    partiel: "Partiel",
    refuse: "Refusé",
  };

  return labels[status] || status;
}

function getStatusClass(status: FactureStatutRemboursement): string {
  const classes: Record<FactureStatutRemboursement, string> = {
    en_attente: "bg-warning-bg text-warning",
    rembourse: "bg-success-bg text-success",
    partiel: "bg-primary-bg text-primary",
    refuse: "bg-danger-bg text-danger",
  };

  return classes[status] || "bg-bg-subtle text-text-muted";
}

export default function FacturePage(): React.JSX.Element {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | FactureStatutRemboursement
  >("all");

  const [loading, setLoading] = useState(true);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredFactures = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return factures.filter((facture) => {
      const client = facture.vente?.client;

      const matchesSearch = !keyword
        ? true
        : `
          ${facture.numeroFacture}
          ${facture.venteId}
          ${facture.mutuelle?.nom ?? ""}
          ${client?.nom ?? ""}
          ${client?.prenom ?? ""}
          ${client?.telephone ?? ""}
        `
            .toLowerCase()
            .includes(keyword);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : facture.statutRemboursement === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [factures, search, statusFilter]);

  const totalAmount = useMemo(() => {
    return factures.reduce((sum, facture) => {
      return sum + Number(facture.montantTotal || 0);
    }, 0);
  }, [factures]);

  const pendingCount = useMemo(() => {
    return factures.filter(
      (facture) => facture.statutRemboursement === "en_attente",
    ).length;
  }, [factures]);

  const mutuelleAmount = useMemo(() => {
    return factures.reduce((sum, facture) => {
      return sum + Number(facture.partMutuelle || 0);
    }, 0);
  }, [factures]);

  const fetchFactures = async () => {
    try {
      setLoading(true);
      const data = await getAllFactures();
      setFactures(data);
    } catch (error) {
      console.error("Erreur chargement factures:", error);
      setFactures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactures();
  }, []);

  const openDetail = (facture: Facture) => {
    setSelectedFacture(facture);
    setDetailOpen(true);
  };

  const openDelete = (facture: Facture) => {
    setSelectedFacture(facture);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFacture) return;

    try {
      setDeleting(true);

      await removeFacture(selectedFacture.id);

      setFactures((prev) =>
        prev.filter((facture) => facture.id !== selectedFacture.id),
      );

      setDeleteOpen(false);
      setSelectedFacture(null);
    } catch (error) {
      console.error("Erreur suppression facture:", error);
      alert("Impossible de supprimer cette facture.");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (
    facture: Facture,
    status: FactureStatutRemboursement,
  ) => {
    try {
      const updatedFacture = await updateFacture(facture.id, {
        statutRemboursement: status,
      });

      setFactures((prev) =>
        prev.map((item) =>
          item.id === facture.id
            ? {
                ...item,
                ...updatedFacture,
                vente: updatedFacture.vente ?? item.vente,
                mutuelle: updatedFacture.mutuelle ?? item.mutuelle,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Erreur modification statut facture:", error);
      alert("Impossible de modifier le statut.");
    }
  };

  const handleDownloadPdf = async (facture: Facture) => {
    try {
      await downloadFacturePdf(facture.id, facture.numeroFacture);
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      alert("Impossible de télécharger le PDF.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Commercial</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-h">
            Factures
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Suivez les factures, les parts patient et les remboursements
            mutuelle.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <ReceiptText size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {factures.length}
          </p>
          <p className="mt-1 text-sm text-text-muted">Factures</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success">
            <ReceiptText size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {formatPrice(totalAmount)}
          </p>
          <p className="mt-1 text-sm text-text-muted">Montant total</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg text-warning">
            <ShieldCheck size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{pendingCount}</p>
          <p className="mt-1 text-sm text-text-muted">En attente</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg text-info">
            <ShieldCheck size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {formatPrice(mutuelleAmount)}
          </p>
          <p className="mt-1 text-sm text-text-muted">Part mutuelle</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des factures
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredFactures.length} facture
              {filteredFactures.length > 1 ? "s" : ""} trouvée
              {filteredFactures.length > 1 ? "s" : ""}
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
                placeholder="Rechercher facture, client, mutuelle..."
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | FactureStatutRemboursement,
                )
              }
              className="rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition focus:border-primary"
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="rembourse">Remboursé</option>
              <option value="partiel">Partiel</option>
              <option value="refuse">Refusé</option>
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
        ) : filteredFactures.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <XCircle size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucune facture trouvée
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Les factures générées depuis les ventes apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredFactures.map((facture) => {
              const client = facture.vente?.client;

              return (
                <div
                  key={facture.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      <ReceiptText size={19} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text-h">
                          {facture.numeroFacture}
                        </p>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusClass(
                            facture.statutRemboursement,
                          )}`}
                        >
                          {getStatusLabel(facture.statutRemboursement)}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                        <span>
                          {client
                            ? `${client.nom} ${client.prenom}`
                            : `Vente #${facture.venteId}`}
                        </span>

                        <span>{facture.mutuelle?.nom ?? "Sans mutuelle"}</span>
                        <span>{formatDate(facture.dateFacture)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:min-w-[420px]">
                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {formatPrice(facture.montantTotal)}
                      </p>
                      <p className="text-[11px] text-text-muted">Total</p>
                    </div>

                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {formatPrice(facture.partPatient)}
                      </p>
                      <p className="text-[11px] text-text-muted">Patient</p>
                    </div>

                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {formatPrice(facture.partMutuelle)}
                      </p>
                      <p className="text-[11px] text-text-muted">Mutuelle</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={facture.statutRemboursement}
                      onChange={(event) =>
                        void handleStatusChange(
                          facture,
                          event.target.value as FactureStatutRemboursement,
                        )
                      }
                      className="hidden rounded-lg border border-border bg-bg px-2 py-2 text-xs text-text-h outline-none focus:border-primary md:block"
                    >
                      <option value="en_attente">En attente</option>
                      <option value="rembourse">Remboursé</option>
                      <option value="partiel">Partiel</option>
                      <option value="refuse">Refusé</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => openDetail(facture)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                      title="Voir"
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDownloadPdf(facture)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-success hover:text-success"
                      title="Télécharger PDF"
                    >
                      <Download size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openDelete(facture)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-danger hover:text-danger"
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailOpen && selectedFacture && (
        <FactureDetailModal
          facture={selectedFacture}
          onClose={() => {
            setDetailOpen(false);
            setSelectedFacture(null);
          }}
        />
      )}

      {deleteOpen && selectedFacture && (
        <DeleteConfirmModal
          title="Supprimer la facture"
          description={`Êtes-vous sûr de vouloir supprimer la facture "${selectedFacture.numeroFacture}" ? Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedFacture(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
}
