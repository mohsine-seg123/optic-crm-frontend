import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash,
  MapPin,
  FileText,
  Phone,
} from "lucide-react";
import { getAllClients, removeClient } from "../../../services/clientService";
import type { Client } from "./client.types";
import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import ClientFormModal from "./components/ClientFormModal";
import ClientDetailModal from "./components/clientDetail";
import EditClientModal from "./components/EditClientModal";

function getInitials(nom: string, prenom: string): string {
  return `${nom?.[0] ?? ""}${prenom?.[0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClientPage(): React.JSX.Element {


  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [clientdetailopen, setClientDetailopen] = useState(false);
  const [clientID, setClientID] = useState<number | null>(null);
  const [editClient, setEditClient] = useState<Client | null>(null);
  


  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data } = await getAllClients();
        setClients(data.data.clients);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeClient(deleteTarget.id);
      setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

    const handleCreate = () => {
      setFormOpen(true);
    };

  const filteredClients = useMemo(
    () =>
      clients.filter(
        (client) =>
          `${client.nom} ${client.prenom}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          client.telephone.includes(search) ||
          client.adresse?.toLowerCase().includes(search.toLowerCase()),
      ),
    [clients, search],
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4">
        <h1 className="text-2xl font-semibold text-text-h">Clients</h1>

        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition hover:bg-text-muted active:scale-[0.98]"
        >
          <Plus size={18} />
          Nouveau client
        </button>
      </div>

      {/* SEARCH + STATS */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-bg p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
            size={16}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone ou adresse"
            className="w-full rounded-lg border border-border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-primary-border focus:ring-4 focus:ring-primary-bg"
          />
        </div>

        {!loading && (
          <p className="text-sm text-text-muted">
            <span className="font-medium text-text-h">
              {filteredClients.length}
            </span>{" "}
            client
            {filteredClients.length > 1 ? "s" : ""}
            {search && ` sur ${clients.length}`}
          </p>
        )}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-border bg-bg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-bg-subtle text-xs uppercase tracking-wide text-text-muted">
              <tr>
                <th className=" p-4 text-left font-medium">Client</th>
                <th className="p-4 text-left font-medium">Contact</th>
                <th className="p-4 text-left font-medium">Adresse</th>
                <th className="p-4 text-left font-medium">Mutuelle</th>
                <th className="p-4 text-left font-medium">Dossier</th>
                <th className="p-4 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-4" colSpan={6}>
                      <div className="h-5 w-full animate-pulse rounded bg-bg-subtle" />
                    </td>
                  </tr>
                ))
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center">
                    <p className="text-sm font-medium text-text-h">
                      {search
                        ? "Aucun client trouvé"
                        : "Aucun client pour le moment"}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      {search
                        ? "Essayez une autre recherche."
                        : "Ajoutez votre premier client pour commencer."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-t border-border transition hover:bg-bg-subtle"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg text-xs font-semibold text-primary">
                          {getInitials(client.nom, client.prenom)}
                        </div>
                        <div>
                          <p className="font-medium text-text-h">
                            {client.nom} {client.prenom}
                          </p>
                          <p className="text-xs text-text-muted">
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-text">
                        <Phone size={14} className="text-text-subtle" />
                        {client.telephone}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-text">
                        <MapPin
                          size={14}
                          className="shrink-0 text-text-subtle"
                        />
                        <span className="line-clamp-1">
                          {client.adresse || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {client.mutuelle ? (
                        <span className="inline-flex items-center rounded-full bg-primary-bg px-2.5 py-1 text-xs font-medium text-primary">
                          {client.mutuelle.nom} ·{" "}
                          {client.mutuelle.tauxRemboursement}%
                        </span>
                      ) : (
                        <span className="text-xs text-text-subtle">Aucune</span>
                      )}
                    </td>

                    <td className="p-4">
                      {client.dossier ? (
                        <div className="flex items-center gap-1.5 text-sm text-text">
                          <FileText size={14} className="text-text-subtle" />
                          <div>
                            <p className="font-medium text-text-h">
                              {client.dossier.numeroDossier}
                            </p>
                            <p className="text-xs text-text-muted">
                              Créé le {formatDate(client.dossier.dateCreation)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                          Pas de dossier
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          title="Voir"
                          onClick={() => {
                            setClientDetailopen(true);
                            setClientID(client.id);
                          }}
                          className="rounded-lg p-2 text-text-muted transition hover:bg-primary-bg hover:text-primary"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Modifier"
                          onClick={() => setEditClient(client)}
                          className="rounded-lg p-2 text-text-muted transition hover:bg-warning-bg hover:text-warning"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          title="Supprimer"
                          onClick={() => setDeleteTarget(client)}
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

      {clientdetailopen && (
        <ClientDetailModal
          clientID={clientID}
          onClose={() => setClientDetailopen(false)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title="Supprimer ce client ?"
          description={`"${deleteTarget.nom} ${deleteTarget.prenom}" sera définitivement supprimé. Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {formOpen && (
        <ClientFormModal
          onClose={() => setFormOpen(false)}
          onCreated={(client) => {
            setClients((prev) => [client, ...prev]);
          }}
        />
      )}

      {editClient && (
        <EditClientModal
          client={editClient}
          onClose={() => setEditClient(null)}
          onUpdated={(updatedClient) => {
            setClients((prev) =>
              prev.map((client) =>
                client.id === updatedClient.id ? updatedClient : client,
              ),
            );
          }}
        />
      )}
    </div>
  );
}
