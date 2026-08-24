import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Edit3,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import {
  getAllFournisseurs,
  removeFournisseur,
} from "../../../services/fournisseurService";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import FournisseurFormModal from "./components/FournisseurFormModal";

import type { Fournisseur } from "../../../interfaces/fournisseur.types";

function getProductsCount(fournisseur: Fournisseur): number {
  return fournisseur.produits?.length ?? 0;
}

function getTotalStock(fournisseur: Fournisseur): number {
  return (
    fournisseur.produits?.reduce((sum, produit) => {
      return sum + produit.stockActuel;
    }, 0) ?? 0
  );
}

export default function FournisseurPage(): React.JSX.Element {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingFournisseur, setEditingFournisseur] =
    useState<Fournisseur | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] =
    useState<Fournisseur | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredFournisseurs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return fournisseurs;

    return fournisseurs.filter((fournisseur) => {
      return `
        ${fournisseur.nom}
        ${fournisseur.telephone}
        ${fournisseur.email}
        ${fournisseur.adresse}
        ${fournisseur.produits?.map((produit) => produit.designation).join(" ")}
      `
        .toLowerCase()
        .includes(keyword);
    });
  }, [fournisseurs, search]);

  const totalProduits = useMemo(() => {
    return fournisseurs.reduce((sum, fournisseur) => {
      return sum + getProductsCount(fournisseur);
    }, 0);
  }, [fournisseurs]);

  const totalStock = useMemo(() => {
    return fournisseurs.reduce((sum, fournisseur) => {
      return sum + getTotalStock(fournisseur);
    }, 0);
  }, [fournisseurs]);

 

  useEffect(() => {
     const fetchFournisseurs = async () => {
       try {
         setLoading(true);
         const data = await getAllFournisseurs();
         setFournisseurs(data);
       } catch (error) {
         console.error("Erreur chargement fournisseurs:", error);
         setFournisseurs([]);
       } finally {
         setLoading(false);
       }
     };
    fetchFournisseurs();
  }, []);

  const openCreateForm = () => {
    setEditingFournisseur(null);
    setFormOpen(true);
  };

  const openEditForm = (fournisseur: Fournisseur) => {
    setEditingFournisseur(fournisseur);
    setFormOpen(true);
  };

  const handleSavedFournisseur = (savedFournisseur: Fournisseur) => {
    if (editingFournisseur) {
      setFournisseurs((prev) =>
        prev.map((fournisseur) =>
          fournisseur.id === savedFournisseur.id
            ? {
                ...fournisseur,
                ...savedFournisseur,
                produits: fournisseur.produits ?? [],
              }
            : fournisseur,
        ),
      );
    } else {
      setFournisseurs((prev) => [
        {
          ...savedFournisseur,
          produits: savedFournisseur.produits ?? [],
        },
        ...prev,
      ]);
    }

    setEditingFournisseur(null);
  };

  const handleDelete = (fournisseur: Fournisseur) => {
    const productsCount = getProductsCount(fournisseur);

    if (productsCount > 0) {
      alert(
        "Impossible de supprimer ce fournisseur car il contient des produits.",
      );
      return;
    }

    setSelectedFournisseur(fournisseur);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFournisseur) return;

    try {
      setDeleting(true);

      await removeFournisseur(selectedFournisseur.id);

      setFournisseurs((prev) =>
        prev.filter((item) => item.id !== selectedFournisseur.id),
      );

      setDeleteOpen(false);
      setSelectedFournisseur(null);
    } catch (error) {
      console.error("Erreur suppression fournisseur:", error);
      alert("Impossible de supprimer ce fournisseur.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Stock</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-h">
            Fournisseurs
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Gérez les fournisseurs associés aux produits du magasin.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} />
          Nouveau fournisseur
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <Truck size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {fournisseurs.length}
          </p>

          <p className="mt-1 text-sm text-text-muted">Fournisseurs</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg text-info">
            <Package size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{totalProduits}</p>

          <p className="mt-1 text-sm text-text-muted">Produits liés</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success">
            <Building2 size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{totalStock}</p>

          <p className="mt-1 text-sm text-text-muted">Stock fourni</p>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des fournisseurs
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredFournisseurs.length} fournisseur
              {filteredFournisseurs.length > 1 ? "s" : ""} trouvé
              {filteredFournisseurs.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher fournisseur, téléphone, email..."
              className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-bg-subtle"
              />
            ))}
          </div>
        ) : filteredFournisseurs.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <Truck size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucun fournisseur trouvé
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Créez un fournisseur pour lier vos produits au stock.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredFournisseurs.map((fournisseur) => {
              const productsCount = getProductsCount(fournisseur);
              const stockCount = getTotalStock(fournisseur);

              return (
                <div
                  key={fournisseur.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      <Truck size={19} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-h">
                        {fournisseur.nom}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} />
                          {fournisseur.telephone}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Mail size={12} />
                          {fournisseur.email}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} />
                          {fournisseur.adresse}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:min-w-[280px]">
                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {productsCount}
                      </p>
                      <p className="text-[11px] text-text-muted">Produits</p>
                    </div>

                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {stockCount}
                      </p>
                      <p className="text-[11px] text-text-muted">Stock</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(fournisseur)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                      title="Modifier"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(fournisseur)}
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
        <FournisseurFormModal
          fournisseur={editingFournisseur}
          onClose={() => {
            setFormOpen(false);
            setEditingFournisseur(null);
          }}
          onSaved={handleSavedFournisseur}
        />
      )}



      {deleteOpen && selectedFournisseur && (
        <DeleteConfirmModal
          title="Supprimer le fournisseur"
          description={`Êtes-vous sûr de vouloir supprimer "${selectedFournisseur.nom}" ? Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedFournisseur(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
}
