import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Edit,
  Mail,
  MessageSquare,
  Phone,
  Search,
  Trash,
  User,
} from "lucide-react";

import { getAllRappels, removeRappel } from "../../../services/rappelService";

import type { Rappel } from "../../../interfaces/rappel";
import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import RappelEditModal from "./RappelEditModal"


function formatDate(date: string | null | undefined): string {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}


function formatType(type: string): string {
  const types: Record<string, string> = {
    controle_vue: "Contrôle de vue",
    renouvellement_lunettes: "Renouvellement lunettes",
    recuperation_commande: "Récupération commande",
    paiement: "Paiement",
    autre: "Autre",
  };

  return types[type] || type;
}



function getStatusClass(statut: string): string {
  switch (statut) {
    case "en_attente":
      return "bg-warning-bg text-warning";
    case "envoye":
      return "bg-success-bg text-success";
    case "annule":
      return "bg-danger-bg text-danger";
    case "termine":
      return "bg-primary-bg text-primary";
    default:
      return "bg-bg-subtle text-text-muted";
  }
}



function getCanalIcon(canal: string) {
  switch (canal) {
    case "sms":
      return <MessageSquare size={14} />;
    case "email":
      return <Mail size={14} />;
    case "appel":
      return <Phone size={14} />;
    case "whatsapp":
      return <MessageSquare size={14} />;
    default:
      return <Bell size={14} />;
  }
}



export default function RappelPage(): React.JSX.Element {

  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [canalFilter, setCanalFilter] = useState("all");

  const [editTarget, setEditTarget] = useState<Rappel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Rappel | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRappels = async () => {
      try {
        const data = await getAllRappels();
        setRappels(data);
      } catch (error) {
        console.error(error);
        setRappels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRappels();
  }, []);



  const filteredRappels = useMemo(() => {
    return rappels.filter((rappel) => {
      const clientName = `${rappel.client?.nom ?? ""} ${
        rappel.client?.prenom ?? ""
      }`.toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        clientName.includes(searchValue) ||
        rappel.client?.telephone?.includes(search) ||
        rappel.typeRappel.toLowerCase().includes(searchValue) ||
        rappel.statut.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || rappel.statut === statusFilter;

      const matchesCanal =
        canalFilter === "all" || rappel.canal === canalFilter;

      return matchesSearch && matchesStatus && matchesCanal;
    });
  }, [rappels, search, statusFilter, canalFilter]);



  const stats = useMemo(() => {
    return {
      total: rappels.length,
      enAttente: rappels.filter((rappel) => rappel.statut === "en_attente")
        .length,
      envoyes: rappels.filter((rappel) => rappel.statut === "envoye").length,
      annules: rappels.filter((rappel) => rappel.statut === "annule").length,
    };
  }, [rappels]);


  const statsConfig = [
    {
      key: "total",
      label: "Total rappels",
      icon: Bell,
      iconColor: "text-primary",
    },
    {
      key: "enAttente",
      label: "En attente",
      icon: CalendarDays,
      iconColor: "text-warning",
    },
    {
      key: "envoyes",
      label: "Envoyés",
      icon: Mail,
      iconColor: "text-success",
    },
    {
      key: "annules",
      label: "Annulés",
      icon: Trash,
      iconColor: "text-danger",
    },
  ] as const;



  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await removeRappel(deleteTarget.id);

      setRappels((prev) =>
        prev.filter((rappel) => rappel.id !== deleteTarget.id),
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
            Historique des rappels
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Suivi des rappels clients : contrôle de vue, paiement, commande et
            relances.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map(({ key, label, icon: Icon, iconColor }) => (
          <div key={key} className="rounded-xl border border-border bg-bg p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">{label}</p>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="mt-2 text-2xl font-semibold text-text-h">
              {stats[key]}
            </p>
          </div>
        ))}
      </div>


      {/* FILTERS */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par client, téléphone, type..."
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
          >
            <option value="all">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="envoye">Envoyé</option>
            <option value="annule">Annulé</option>
            <option value="termine">Terminé</option>
          </select>

          <select
            value={canalFilter}
            onChange={(e) => setCanalFilter(e.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
          >
            <option value="all">Tous les canaux</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
            <option value="appel">Appel</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-bg-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className="p-4 text-left font-medium">Client</th>
                <th className="p-4 text-left font-medium">Type</th>
                <th className="p-4 text-left font-medium">Date prévue</th>
                <th className="p-4 text-left font-medium">Canal</th>
                <th className="p-4 text-left font-medium">Statut</th>
                <th className="p-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-t border-border">
                    <td className="p-4" colSpan={6}>
                      <div className="h-5 w-full animate-pulse rounded bg-bg-subtle" />
                    </td>
                  </tr>
                ))
              ) : filteredRappels.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <p className="text-sm font-medium text-text-h">
                      Aucun rappel trouvé
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      Essayez de modifier la recherche ou les filtres.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRappels.map((rappel) => (
                  <tr
                    key={rappel.id}
                    className="border-t border-border transition hover:bg-bg-subtle"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-bg text-primary">
                          <User size={16} />
                        </div>

                        <div>
                          <p className="font-medium text-text-h">
                            {rappel.client
                              ? `${rappel.client.nom} ${rappel.client.prenom}`
                              : `Client #${rappel.clientId}`}
                          </p>

                          <p className="text-xs text-text-muted">
                            {rappel.client?.telephone || "Téléphone non défini"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="text-sm font-medium text-text-h">
                        {formatType(rappel.typeRappel)}
                      </p>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-text">
                        <CalendarDays size={15} className="text-text-subtle" />
                        {formatDate(rappel.datePrevue)}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text">
                        {getCanalIcon(rappel.canal)}
                        {rappel.canal}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                          rappel.statut,
                        )}`}
                      >
                        {rappel.statut}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          title="Modifier"
                          onClick={() => setEditTarget(rappel)}
                          className="rounded-lg p-2 text-text-muted transition hover:bg-warning-bg hover:text-warning"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          title="Supprimer"
                          onClick={() => setDeleteTarget(rappel)}
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


      {/* EDIT MODAL */}
      {editTarget && (
        <RappelEditModal
          rappel={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={(updatedRappel) => {
            setRappels((prev) =>
              prev.map((rappel) =>
                rappel.id === updatedRappel.id ? updatedRappel : rappel,
              ),
            );

            setEditTarget(null);
          }}
        />
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Supprimer ce rappel ?"
          description={`Le rappel "${formatType(
            deleteTarget.typeRappel,
          )}" sera définitivement supprimé.`}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
      
    </div>
  );
}
