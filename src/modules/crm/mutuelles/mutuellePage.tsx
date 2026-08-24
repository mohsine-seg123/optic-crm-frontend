import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Phone,
  Mail,
  Users,
  Percent,
} from "lucide-react";


import mutuelleService from "../../../services/mutuelleService";
import type { Mutuelle } from "../../../interfaces/Mutuelle";
import MutuelleFormModal from "../mutuelles/MutuelleFormModal";
import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";

export default function MutuelleList() {
  const [mutuelles, setMutuelles] = useState<Mutuelle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Mutuelle | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Mutuelle | null>(null);
  const [deleting, setDeleting] = useState(false);


   const fetchMutuelles = async () => {
     setLoading(true);
     try {
       const data = await mutuelleService.getAllMutuelles();
       setMutuelles(data);
     } catch (err) {
       console.error(err);
     } finally {
       setLoading(false);
     }
   };


  useEffect(() => {
    fetchMutuelles();
  }, []);
  

  const filtered = mutuelles.filter((m) =>
    `${m.nom} ${m.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  

  const handleCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (m: Mutuelle) => {
    setEditing(m);
    setFormOpen(true);
  };

  const handleSaved = () => {
    setFormOpen(false);
    fetchMutuelles();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await mutuelleService.removeMutuelle(deleteTarget.id);
      setDeleteTarget(null);
      fetchMutuelles();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* En-tête */}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-h">Mutuelles</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {mutuelles.length} mutuelle{mutuelles.length > 1 ? "s" : ""}{" "}
            enregistrée
            {mutuelles.length > 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-text-muted transition-colors"
        >
          <Plus size={17} />
          Nouvelle mutuelle
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-5 max-w-sm">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-subtle"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une mutuelle..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-bg-subtle border-border text-sm text-text placeholder:text-text-subtle outline-none border transition-all"
        />
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl border border-border bg-bg-subtle animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
          <Users size={32} className="text-text-subtle mb-3" />
          <p className="text-text-h font-medium">Aucune mutuelle trouvée</p>
          <p className="text-sm text-text-muted mt-1">
            {search
              ? "Essayez une autre recherche"
              : "Commencez par ajouter votre première mutuelle"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="group relative rounded-xl border border-border bg-bg p-5 hover:shadow-sm  hover:border-primary-border transition-all"
            >
              {/* Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(m)}
                  className="p-1.5 rounded-md text-text-muted hover:bg-bg-subtle hover:text-primary transition-colors"
                  aria-label="Modifier"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(m)}
                  className="p-1.5 rounded-md text-text-muted hover:bg-danger-bg hover:text-danger transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Nom + taux */}
              <div className="flex items-start gap-3 mb-4 pr-14">
                <div className="w-10 h-10 rounded-lg bg-primary-bg flex items-center justify-center shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {m.nom.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-text-h truncate">{m.nom}</p>
                  <div className="flex items-center gap-1 text-xs text-success font-medium mt-0.5">
                    <Percent size={11} />
                    {m.tauxRemboursement} remboursé
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Phone size={13} className="text-text-subtle" />
                  {m.telephone}
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted truncate">
                  <Mail size={13} className="text-text-subtle shrink-0" />
                  <span className="truncate">{m.email}</span>
                </div>
              </div>

              {/* Clients rattachés */}
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <Users size={13} className="text-text-subtle" />
                <span className="text-xs text-text-muted">
                  {m.client?.length ?? 0} client
                  {(m.client?.length ?? 0) > 1 ? "s" : ""} rattaché
                  {(m.client?.length ?? 0) > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal formulaire */}
      {formOpen && (
        <MutuelleFormModal
          mutuelle={editing}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Modal suppression */}
      {deleteTarget && (
        <DeleteConfirmModal
          title="Supprimer cette mutuelle ?"
          description={`"${deleteTarget.nom}" sera définitivement supprimée. Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
