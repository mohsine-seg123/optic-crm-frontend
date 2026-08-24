import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Edit,
  Trash,
  FileText,
  CalendarDays,
  User,
  ClipboardList,
  Activity,
} from "lucide-react";

import {
  getAllDossiers,
  removeDossier,
} from "../../../services/dossierService";

import type { DossierOptique } from "../../../interfaces/dossier.types";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import DossierDetailModal from "./DossierDetailModal";
import DossierEditModal from "./DossierEditModal";

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getClientName(dossier: DossierOptique): string {
  if (!dossier.client) return `Client #${dossier.clientId}`;

  return `${dossier.client.nom} ${dossier.client.prenom}`;
}

export default function DossierPage(): React.JSX.Element {
  const [dossiers, setDossiers] = useState<DossierOptique[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [detailTarget, setDetailTarget] = useState<DossierOptique | null>(null);
  const [editTarget, setEditTarget] = useState<DossierOptique | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DossierOptique | null>(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        const data = await getAllDossiers();
        setDossiers(data);
      } catch (error) {
        console.error(error);
        setDossiers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDossiers();
  }, []);

  const filteredDossiers = useMemo(() => {
    const value = search.toLowerCase();

    return dossiers.filter((dossier) => {
      const clientName = getClientName(dossier).toLowerCase();

      return (
        dossier.numeroDossier.toLowerCase().includes(value) ||
        clientName.includes(value) ||
        dossier.client?.telephone?.includes(search) ||
        dossier.observations?.toLowerCase().includes(value)
      );
    });
  }, [dossiers, search]);

  const stats = useMemo(() => {
    const totalExamens = dossiers.reduce(
      (sum, dossier) => sum + (dossier.examens?.length ?? 0),
      0,
    );

    const totalOrdonnances = dossiers.reduce(
      (sum, dossier) => sum + (dossier.ordonnances?.length ?? 0),
      0,
    );

    const withLastExam = dossiers.filter(
      (dossier) => dossier.dateDernierExamen,
    ).length;

    return {
      total: dossiers.length,
      totalExamens,
      totalOrdonnances,
      withLastExam,
    };
  }, [dossiers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await removeDossier(deleteTarget.id);

      setDossiers((prev) =>
        prev.filter((dossier) => dossier.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-h">
            Dossiers optiques
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Consultation et gestion globale des dossiers optiques des clients.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Total dossiers</p>
            <FileText size={18} className="text-primary" />
          </div>

          <p className="mt-2 text-2xl font-semibold text-text-h">
            {stats.total}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Avec dernier examen</p>
            <CalendarDays size={18} className="text-primary" />
          </div>

          <p className="mt-2 text-2xl font-semibold text-text-h">
            {stats.withLastExam}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Examens</p>
            <Activity size={18} className="text-primary" />
          </div>

          <p className="mt-2 text-2xl font-semibold text-text-h">
            {stats.totalExamens}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Ordonnances</p>
            <ClipboardList size={18} className="text-primary" />
          </div>

          <p className="mt-2 text-2xl font-semibold text-text-h">
            {stats.totalOrdonnances}
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par numéro, client, téléphone..."
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
          />
        </div>

        {!loading && (
          <p className="text-sm text-text-muted">
            <span className="font-medium text-text-h">
              {filteredDossiers.length}
            </span>{" "}
            dossier{filteredDossiers.length > 1 ? "s" : ""}
            {search && ` sur ${dossiers.length}`}
          </p>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-bg-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="p-4 text-left font-medium">Dossier</th>
                <th className="p-4 text-left font-medium">Client</th>
                <th className="p-4 text-left font-medium">Date création</th>
                <th className="p-4 text-left font-medium">Dernier examen</th>
                <th className="p-4 text-left font-medium">Examens</th>
                <th className="p-4 text-left font-medium">Ordonnances</th>
                <th className="p-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-t border-border">
                    <td colSpan={7} className="p-4">
                      <div className="h-5 w-full animate-pulse rounded bg-bg-subtle" />
                    </td>
                  </tr>
                ))
              ) : filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center">
                    <p className="text-sm font-medium text-text-h">
                      Aucun dossier trouvé
                    </p>

                    <p className="mt-1 text-sm text-text-muted">
                      Essayez une autre recherche.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDossiers.map((dossier) => (
                  <tr
                    key={dossier.id}
                    className="border-t border-border transition hover:bg-bg-subtle"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-bg text-primary">
                          <FileText size={16} />
                        </div>

                        <div>
                          <p className="font-medium text-text-h">
                            {dossier.numeroDossier}
                          </p>

                          <p className="text-xs text-text-muted">
                            ID #{dossier.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <User size={15} className="text-text-subtle" />

                        <div>
                          <p className="text-sm font-medium text-text-h">
                            {getClientName(dossier)}
                          </p>

                          <p className="text-xs text-text-muted">
                            {dossier.client?.telephone ||
                              "Téléphone non défini"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-text">
                      {formatDate(dossier.dateCreation)}
                    </td>

                    <td className="p-4 text-sm text-text">
                      {formatDate(dossier.dateDernierExamen)}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                        {dossier.examens?.length ?? 0}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                        {dossier.ordonnances?.length ?? 0}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Voir"
                          onClick={() => setDetailTarget(dossier)}
                          className="rounded-lg p-2 text-text-muted transition hover:bg-primary-bg hover:text-primary"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          title="Modifier"
                          onClick={() => setEditTarget(dossier)}
                          className="rounded-lg p-2 text-text-muted transition hover:bg-warning-bg hover:text-warning"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          title="Supprimer"
                          onClick={() => setDeleteTarget(dossier)}
                          className="rounded-lg p-2 text-danger transition hover:bg-danger-bg"
                        >
                          <Trash size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {detailTarget && (
        <DossierDetailModal
          dossierId={detailTarget.id}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {editTarget && (
        <DossierEditModal
          dossier={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={(updatedDossier) => {
            setDossiers((prev) =>
              prev.map((dossier) =>
                dossier.id === updatedDossier.id ? updatedDossier : dossier,
              ),
            );

            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Supprimer ce dossier optique ?"
          description={`Le dossier "${deleteTarget.numeroDossier}" sera définitivement supprimé.`}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
