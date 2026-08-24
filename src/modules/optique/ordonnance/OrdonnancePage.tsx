import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  FileText,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  getAllOrdonnances,
  removeOrdonnance,
} from "../../../services/ordonnanceService";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import OrdonnanceFormModal from "./components/OrdonnanceFormModal";
import OrdonnanceDetailModal from "./components/OrdonnanceDetailModal";

import type { Ordonnance } from "../../../interfaces/ordonnance.types";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isExpired(dateExpiration: string): boolean {
  return new Date(dateExpiration) < new Date();
}

export default function OrdonnancePage(): React.JSX.Element {
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "expired">(
    "all",
  );

  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrdonnance, setSelectedOrdonnance] =
    useState<Ordonnance | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredOrdonnances = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return ordonnances.filter((ordonnance) => {
      const client = ordonnance.dossier?.client;
      const expired = isExpired(ordonnance.dateExpiration);

      const matchesSearch = !keyword
        ? true
        : `
          ${ordonnance.id}
          ${ordonnance.medecin}
          ${ordonnance.scanUrl ?? ""}
          ${ordonnance.dossier?.numeroDossier ?? ""}
          ${client?.nom ?? ""}
          ${client?.prenom ?? ""}
        `
            .toLowerCase()
            .includes(keyword);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "expired"
            ? expired
            : !expired;

      return matchesSearch && matchesStatus;
    });
  }, [ordonnances, search, statusFilter]);

  const expiredCount = useMemo(() => {
    return ordonnances.filter((ordonnance) =>
      isExpired(ordonnance.dateExpiration),
    ).length;
  }, [ordonnances]);

  const validCount = ordonnances.length - expiredCount;


  useEffect(() => {
    const fetchOrdonnances = async () => {
      try {
        setLoading(true);

        const data = await getAllOrdonnances();

        setOrdonnances(data);
      } catch (error) {
        console.error("Erreur chargement ordonnances:", error);
        setOrdonnances([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrdonnances();
  }, []);

  const openDetail = (ordonnance: Ordonnance) => {
    setSelectedOrdonnance(ordonnance);
    setDetailOpen(true);
  };

  const openDelete = (ordonnance: Ordonnance) => {
    setSelectedOrdonnance(ordonnance);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedOrdonnance) return;

    try {
      setDeleting(true);

      await removeOrdonnance(selectedOrdonnance.id);

      setOrdonnances((prev) =>
        prev.filter((item) => item.id !== selectedOrdonnance.id),
      );

      setDeleteOpen(false);
      setSelectedOrdonnance(null);
    } catch (error) {
      console.error("Erreur suppression ordonnance:", error);
      alert("Impossible de supprimer cette ordonnance.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreatedOrdonnance = async () => {
    setFormOpen(false);
    await fetchOrdonnances();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Gestion optique</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-h">
            Ordonnances
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Gérez les prescriptions médicales liées aux dossiers optiques.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} />
          Nouvelle ordonnance
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <FileText size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {ordonnances.length}
          </p>

          <p className="mt-1 text-sm text-text-muted">Ordonnances</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success">
            <CalendarDays size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{validCount}</p>

          <p className="mt-1 text-sm text-text-muted">Valides</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-danger-bg text-danger">
            <CalendarDays size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{expiredCount}</p>

          <p className="mt-1 text-sm text-text-muted">Expirées</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des ordonnances
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredOrdonnances.length} ordonnance
              {filteredOrdonnances.length > 1 ? "s" : ""} trouvée
              {filteredOrdonnances.length > 1 ? "s" : ""}
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
                placeholder="Rechercher médecin, client, dossier..."
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | "valid" | "expired",
                )
              }
              className="rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition focus:border-primary"
            >
              <option value="all">Tous les statuts</option>
              <option value="valid">Valides</option>
              <option value="expired">Expirées</option>
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
        ) : filteredOrdonnances.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <XCircle size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucune ordonnance trouvée
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Créez une ordonnance depuis un dossier optique.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredOrdonnances.map((ordonnance) => {
              const expired = isExpired(ordonnance.dateExpiration);
              const client = ordonnance.dossier?.client;

              return (
                <div
                  key={ordonnance.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      <Stethoscope size={19} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text-h">
                          {ordonnance.medecin}
                        </p>

                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            expired
                              ? "bg-danger-bg text-danger"
                              : "bg-success-bg text-success"
                          }`}
                        >
                          {expired ? "Expirée" : "Valide"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                        <span>
                          {client
                            ? `${client.nom} ${client.prenom}`
                            : `Dossier #${ordonnance.dossierId}`}
                        </span>

                        <span>
                          {ordonnance.dossier?.numeroDossier ??
                            `Dossier #${ordonnance.dossierId}`}
                        </span>

                        <span>{formatDate(ordonnance.dateOrdonnance)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:min-w-[300px]">
                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {formatDate(ordonnance.dateOrdonnance)}
                      </p>
                      <p className="text-[11px] text-text-muted">Date</p>
                    </div>

                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p
                        className={`text-sm font-semibold ${
                          expired ? "text-danger" : "text-text-h"
                        }`}
                      >
                        {formatDate(ordonnance.dateExpiration)}
                      </p>
                      <p className="text-[11px] text-text-muted">Expiration</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(ordonnance)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                      title="Voir"
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openDelete(ordonnance)}
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

      {formOpen && (
        <OrdonnanceFormModal
          onClose={() => setFormOpen(false)}
          onCreated={() => {
            void handleCreatedOrdonnance();
          }}
        />
      )}

      {detailOpen && selectedOrdonnance && (
        <OrdonnanceDetailModal
          ordonnance={selectedOrdonnance}
          onClose={() => {
            setDetailOpen(false);
            setSelectedOrdonnance(null);
          }}
        />
      )}

      {deleteOpen && selectedOrdonnance && (
        <DeleteConfirmModal
          title="Supprimer l'ordonnance"
          description={`Êtes-vous sûr de vouloir supprimer l'ordonnance du médecin "${selectedOrdonnance.medecin}" ? Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedOrdonnance(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
}
