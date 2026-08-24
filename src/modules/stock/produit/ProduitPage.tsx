import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Barcode,
  Boxes,
  Edit3,
  Package,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  getAllProduits,
  removeProduit,
} from "../../../services/produitService";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import ProduitFormModal from "./components/ProduitFormModal";

import type { Produit } from "../../../interfaces/produit.types";

function formatPrice(value: string | number): string {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

function isLowStock(produit: Produit): boolean {
  return produit.stockActuel <= produit.stockMinimum;
}

export default function ProduitPage(): React.JSX.Element {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredProduits = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return produits;

    return produits.filter((produit) => {
      return `
        ${produit.designation}
        ${produit.marque}
        ${produit.modele}
        ${produit.codeBarre}
        ${produit.categorie?.libelle ?? ""}
        ${produit.fournisseur?.nom ?? ""}
      `
        .toLowerCase()
        .includes(keyword);
    });
  }, [produits, search]);

  const totalStock = useMemo(() => {
    return produits.reduce((sum, produit) => sum + produit.stockActuel, 0);
  }, [produits]);

  const lowStockCount = useMemo(() => {
    return produits.filter(isLowStock).length;
  }, [produits]);

  const totalValue = useMemo(() => {
    return produits.reduce((sum, produit) => {
      return sum + Number(produit.prixVente || 0) * produit.stockActuel;
    }, 0);
  }, [produits]);

  const fetchProduits = async () => {
    try {
      setLoading(true);
      const data = await getAllProduits();
      setProduits(data);
    } catch (error) {
      console.error("Erreur chargement produits:", error);
      setProduits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const openCreateForm = () => {
    setEditingProduit(null);
    setFormOpen(true);
  };

  const openEditForm = (produit: Produit) => {
    setEditingProduit(produit);
    setFormOpen(true);
  };

  const handleSavedProduit = (savedProduit: Produit) => {
    if (editingProduit) {
      setProduits((prev) =>
        prev.map((produit) =>
          produit.id === savedProduit.id ? savedProduit : produit,
        ),
      );
    } else {
      setProduits((prev) => [savedProduit, ...prev]);
    }

    setEditingProduit(null);
  };

  const handleDelete = (produit: Produit) => {
    setSelectedProduit(produit);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduit) return;

    try {
      setDeleting(true);

      await removeProduit(selectedProduit.id);

      setProduits((prev) =>
        prev.filter((produit) => produit.id !== selectedProduit.id),
      );

      setDeleteOpen(false);
      setSelectedProduit(null);
    } catch (error) {
      console.error("Erreur suppression produit:", error);
      alert("Impossible de supprimer ce produit.");
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
            Produits
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Gérez les montures, verres, lentilles et accessoires du magasin.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} />
          Nouveau produit
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <Package size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {produits.length}
          </p>

          <p className="mt-1 text-sm text-text-muted">Produits</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success">
            <Boxes size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{totalStock}</p>

          <p className="mt-1 text-sm text-text-muted">Stock total</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg text-warning">
            <AlertTriangle size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{lowStockCount}</p>

          <p className="mt-1 text-sm text-text-muted">Stock faible</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des produits
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredProduits.length} produit
              {filteredProduits.length > 1 ? "s" : ""} trouvé
              {filteredProduits.length > 1 ? "s" : ""}
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
              placeholder="Rechercher produit, marque, code-barres..."
              className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
            />
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
        ) : filteredProduits.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <Package size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucun produit trouvé
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Créez un produit pour commencer à gérer votre stock.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredProduits.map((produit) => (
              <div
                key={produit.id}
                className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                    <Package size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-text-h">
                        {produit.designation}
                      </p>

                      {isLowStock(produit) && (
                        <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[11px] font-medium text-warning">
                          Stock faible
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span>
                        {produit.marque} · {produit.modele}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Barcode size={12} />
                        {produit.codeBarre}
                      </span>

                      <span>
                        {produit.categorie?.libelle ?? "Sans catégorie"}
                      </span>

                      <span>
                        {produit.fournisseur?.nom ?? "Sans fournisseur"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[560px]">
                  <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-text-h">
                      {formatPrice(produit.prixAchat)}
                    </p>
                    <p className="text-[11px] text-text-muted">Achat</p>
                  </div>

                  <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-text-h">
                      {formatPrice(produit.prixVente)}
                    </p>
                    <p className="text-[11px] text-text-muted">Vente</p>
                  </div>

                  <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-text-h">
                      {produit.stockActuel}
                    </p>
                    <p className="text-[11px] text-text-muted">Stock</p>
                  </div>

                  <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-text-h">
                      {produit.stockMinimum}
                    </p>
                    <p className="text-[11px] text-text-muted">Minimum</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(produit)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                    title="Modifier"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(produit)}
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
        <ProduitFormModal
          produit={editingProduit}
          onClose={() => {
            setFormOpen(false);
            setEditingProduit(null);
          }}
          onSaved={handleSavedProduit}
        />
      )}

      {deleteOpen && selectedProduit && (
        <DeleteConfirmModal
          title="Supprimer le produit"
          description={`Êtes-vous sûr de vouloir supprimer "${selectedProduit.designation}" ? Cette action est irréversible.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedProduit(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
}
