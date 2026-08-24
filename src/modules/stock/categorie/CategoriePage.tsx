import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Edit3,
  FolderOpen,
  Package,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  createCategorie,
  getAllCategories,
  removeCategorie,
  updateCategorie,
} from "../../../services/categorieService";

import type { Categorie } from "../../../interfaces/categorie.types";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";

function getProductsCount(categorie: Categorie): number {
  return categorie.produits?.length ?? 0;
}

function getTotalStock(categorie: Categorie): number {
  return (
    categorie.produits?.reduce((sum, produit) => {
      return sum + produit.stockActuel;
    }, 0) ?? 0
  );
}

function getLowStockCount(categorie: Categorie): number {
  return (
    categorie.produits?.filter(
      (produit) => produit.stockActuel <= produit.stockMinimum,
    ).length ?? 0
  );
}

export default function CategoriePage(): React.JSX.Element {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategorie, setEditingCategorie] = useState<Categorie | null>(
    null,
  );

  const [libelle, setLibelle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);



  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return categories;

    return categories.filter((categorie) => {
      return (
        categorie.libelle.toLowerCase().includes(keyword) ||
        categorie.produits?.some((produit) =>
          `${produit.designation} ${produit.marque} ${produit.modele}`
            .toLowerCase()
            .includes(keyword),
        )
      );
    });
  }, [categories, search]);



  const totalProduits = useMemo(() => {
    return categories.reduce((sum, categorie) => {
      return sum + getProductsCount(categorie);
    }, 0);
  }, [categories]);



  const totalStock = useMemo(() => {
    return categories.reduce((sum, categorie) => {
      return sum + getTotalStock(categorie);
    }, 0);
  }, [categories]);







  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Erreur chargement catégories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const openCreateForm = () => {
    setEditingCategorie(null);
    setLibelle("");
    setError(null);
    setFormOpen(true);
  };

  const openEditForm = (categorie: Categorie) => {
    setEditingCategorie(categorie);
    setLibelle(categorie.libelle);
    setError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingCategorie(null);
    setLibelle("");
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanLibelle = libelle.trim();

    if (!cleanLibelle) {
      setError("Le libellé est obligatoire.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingCategorie) {
        const updatedCategorie = await updateCategorie(editingCategorie.id, {
          libelle: cleanLibelle,
        });

        setCategories((prev) =>
          prev.map((categorie) =>
            categorie.id === editingCategorie.id
              ? {
                  ...categorie,
                  ...updatedCategorie,
                  produits: categorie.produits,
                }
              : categorie,
          ),
        );
      } else {
        const newCategorie = await createCategorie({
          libelle: cleanLibelle,
        });

        setCategories((prev) => [
          {
            ...newCategorie,
            produits: newCategorie.produits ?? [],
          },
          ...prev,
        ]);
      }

      closeForm();
    } catch (error) {
      console.error("Erreur sauvegarde catégorie:", error);
      setError("Impossible de sauvegarder cette catégorie.");
    } finally {
      setSubmitting(false);
    }
  };


const handleDelete = (categorie: Categorie) => {
  const productsCount = getProductsCount(categorie);

  if (productsCount > 0) {
    alert(
      "Impossible de supprimer cette catégorie car elle contient des produits.",
    );
    return;
  }

  setSelectedCategorie(categorie);
  setDeleteOpen(true);
};


const confirmDelete = async () => {
  if (!selectedCategorie) return;

  try {
    setDeleting(true);

    await removeCategorie(selectedCategorie.id);

    setCategories((prev) =>
      prev.filter((item) => item.id !== selectedCategorie.id),
    );

    setDeleteOpen(false);
    setSelectedCategorie(null);
  } catch (error) {
    console.error("Erreur suppression catégorie:", error);
    alert("Impossible de supprimer cette catégorie.");
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
            Catégories
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Gérez les familles de produits utilisées dans le stock.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} />
          Nouvelle catégorie
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <FolderOpen size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {categories.length}
          </p>

          <p className="mt-1 text-sm text-text-muted">Catégories</p>
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
            <Boxes size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{totalStock}</p>

          <p className="mt-1 text-sm text-text-muted">Stock total</p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des catégories
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredCategories.length} catégorie
              {filteredCategories.length > 1 ? "s" : ""} trouvée
              {filteredCategories.length > 1 ? "s" : ""}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une catégorie..."
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
        ) : filteredCategories.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <FolderOpen size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucune catégorie trouvée
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Créez une catégorie pour organiser vos produits.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredCategories.map((categorie) => {
              const productsCount = getProductsCount(categorie);
              const stockCount = getTotalStock(categorie);
              const lowStockCount = getLowStockCount(categorie);

              return (
                <div
                  key={categorie.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      <FolderOpen size={19} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text-h">
                          {categorie.libelle}
                        </p>

                        {lowStockCount > 0 && (
                          <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[11px] font-medium text-warning">
                            {lowStockCount} stock faible
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-text-muted">
                        ID #{categorie.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:min-w-[360px] md:grid-cols-3">
                    <div className="rounded-xl bg-bg px-3 py-2 text-center md:bg-bg-subtle">
                      <p className="text-sm font-semibold text-text-h">
                        {productsCount}
                      </p>
                      <p className="text-[11px] text-text-muted">Produits</p>
                    </div>

                    <div className="rounded-xl bg-bg px-3 py-2 text-center md:bg-bg-subtle">
                      <p className="text-sm font-semibold text-text-h">
                        {stockCount}
                      </p>
                      <p className="text-[11px] text-text-muted">Stock</p>
                    </div>

                    <div className="rounded-xl bg-bg px-3 py-2 text-center md:bg-bg-subtle">
                      <p className="text-sm font-semibold text-text-h">
                        {lowStockCount}
                      </p>
                      <p className="text-[11px] text-text-muted">Alertes</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(categorie)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                      title="Modifier"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(categorie)}
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

      {/* MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-bg shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-text-h">
                  {editingCategorie
                    ? "Modifier la catégorie"
                    : "Nouvelle catégorie"}
                </h3>

                <p className="mt-1 text-xs text-text-muted">
                  Renseignez le libellé de la catégorie.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition hover:bg-bg-subtle hover:text-text-h"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-h">
                  Libellé
                </label>

                <input
                  value={libelle}
                  onChange={(event) => setLibelle(event.target.value)}
                  placeholder="Ex: Montures, Verres, Lentilles..."
                  className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
                />

                {error && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {error}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-bg-subtle hover:text-text-h"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Sauvegarde..."
                    : editingCategorie
                      ? "Modifier"
                      : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {deleteOpen && selectedCategorie && (
        <DeleteConfirmModal
          title="Supprimer la catégorie"
          description={`Êtes-vous sûr de vouloir supprimer la catégorie "${selectedCategorie.libelle}" ? Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedCategorie(null);
          }}
          onConfirm={confirmDelete}
        />
      )}


    </div>
  );
}
