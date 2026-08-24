import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Edit,
  Search,
  Trash,
  User,
  FileText,
} from "lucide-react";

import { getAllExamens, removeExamen } from "../../../services/examenService";

import type { ExamenVue } from "../../../interfaces/examen.types";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import ExamenEditModal from "./ExamenEditModal";

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getClientName(examen: ExamenVue): string {
  if (!examen.dossier?.client) return "Client non défini";

  return `${examen.dossier.client.nom} ${examen.dossier.client.prenom}`;
}

export default function ExamenPage(): React.JSX.Element {
  const [examens, setExamens] = useState<ExamenVue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editTarget, setEditTarget] = useState<ExamenVue | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamenVue | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchExamens = async () => {
      try {
        const data = await getAllExamens();
        setExamens(data);
      } catch (error) {
        console.error(error);
        setExamens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExamens();
  }, []);

  const filteredExamens = useMemo(() => {
    const value = search.toLowerCase();

    return examens.filter((examen) => {
      const clientName = getClientName(examen).toLowerCase();
      const dossierNumero = examen.dossier?.numeroDossier?.toLowerCase() || "";

      return (
        clientName.includes(value) ||
        dossierNumero.includes(value) ||
        examen.dossier?.client?.telephone?.includes(search)
      );
    });
  }, [examens, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await removeExamen(deleteTarget.id);

      setExamens((prev) =>
        prev.filter((examen) => examen.id !== deleteTarget.id),
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
      <div className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-h">Examens de vue</h1>

          <p className="mt-1 text-sm text-text-muted">
            Historique global des examens optiques liés aux dossiers clients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Total examens</p>
            <Activity size={18} className="text-primary" />
          </div>

          <p className="mt-2 text-2xl font-semibold text-text-h">
            {examens.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Résultat affiché</p>
            <Search size={18} className="text-primary" />
          </div>

          <p className="mt-2 text-2xl font-semibold text-text-h">
            {filteredExamens.length}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-bg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">Dernier examen</p>
            <CalendarDays size={18} className="text-primary" />
          </div>

          <p className="mt-2 text-lg font-semibold text-text-h">
            {formatDate(examens[0]?.dateExamen)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg p-4">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par client, téléphone ou dossier..."
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-bg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-bg-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="p-4 text-left font-medium">Client</th>
                <th className="p-4 text-left font-medium">Dossier</th>
                <th className="p-4 text-left font-medium">Date</th>
                <th className="p-4 text-left font-medium">OD</th>
                <th className="p-4 text-left font-medium">OG</th>
                <th className="p-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-t border-border">
                    <td colSpan={6} className="p-4">
                      <div className="h-5 w-full animate-pulse rounded bg-bg-subtle" />
                    </td>
                  </tr>
                ))
              ) : filteredExamens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <p className="text-sm font-medium text-text-h">
                      Aucun examen trouvé
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      Essayez une autre recherche.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExamens.map((examen) => (
                  <tr
                    key={examen.id}
                    className="border-t border-border transition hover:bg-bg-subtle"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-bg text-primary">
                          <User size={16} />
                        </div>

                        <div>
                          <p className="font-medium text-text-h">
                            {getClientName(examen)}
                          </p>

                          <p className="text-xs text-text-muted">
                            {examen.dossier?.client?.telephone || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-text">
                        <FileText size={15} className="text-text-subtle" />
                        {examen.dossier?.numeroDossier ||
                          `Dossier #${examen.dossierId}`}
                      </div>
                    </td>

                    <td className="p-4 text-sm text-text">
                      {formatDate(examen.dateExamen)}
                    </td>

                    <td className="p-4">
                      <div className="text-xs text-text">
                        <p>Sphère : {examen.sphereOd}</p>
                        <p>Cyl. : {examen.cylindreOd}</p>
                        <p>Axe : {examen.axeOd}</p>
                        <p>Add. : {examen.additionOd}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-xs text-text">
                        <p>Sphère : {examen.sphereOg}</p>
                        <p>Cyl. : {examen.cylindreOg}</p>
                        <p>Axe : {examen.axeOg}</p>
                        <p>Add. : {examen.additionOg}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Modifier"
                          onClick={() => setEditTarget(examen)}
                          className="rounded-lg p-2 text-text-muted transition hover:bg-warning-bg hover:text-warning"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          title="Supprimer"
                          onClick={() => setDeleteTarget(examen)}
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

      {editTarget && (
        <ExamenEditModal
          examen={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={(updatedExamen) => {
            setExamens((prev) =>
              prev.map((examen) =>
                examen.id === updatedExamen.id ? updatedExamen : examen,
              ),
            );

            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Supprimer cet examen ?"
          description={`L'examen du ${formatDate(
            deleteTarget.dateExamen,
          )} sera définitivement supprimé.`}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
