import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  Truck,
} from "lucide-react";

import {
  getAllBonsLivraison,
  removeBonLivraison,
} from "../../../services/bonLivraisonService";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import BonLivraisonFormModal from "./components/BonLivraisonFormModal";
import BonLivraisonDetailModal from "./components/BonLivraisonDetailModal";

import type { BonLivraison } from "../../../interfaces/bonLivraison.types";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTotalQuantite(bon: BonLivraison): number {
  return bon.lignes.reduce((sum, ligne) => sum + ligne.quantite, 0);
}

function getTotalAchat(bon: BonLivraison): number {
  return bon.lignes.reduce((sum, ligne) => {
    return sum + ligne.quantite * Number(ligne.prixAchat || 0);
  }, 0);
}

function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR")} DH`;
}

export default function BonLivraisonPage(): React.JSX.Element {
  const [bonsLivraison, setBonsLivraison] = useState<BonLivraison[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBon, setSelectedBon] = useState<BonLivraison | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredBons = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return bonsLivraison;

    return bonsLivraison.filter((bon) => {
      return `
        ${bon.numeroBon}
        ${bon.fournisseur.nom}
        ${bon.fournisseur.telephone}
        ${bon.lignes.map((ligne) => ligne.produit.designation).join(" ")}
        ${bon.lignes.map((ligne) => ligne.produit.codeBarre).join(" ")}
      `
        .toLowerCase()
        .includes(keyword);
    });
  }, [bonsLivraison, search]);

  const totalBons = bonsLivraison.length;

  const totalLignes = useMemo(() => {
    return bonsLivraison.reduce((sum, bon) => sum + bon.lignes.length, 0);
  }, [bonsLivraison]);

  const totalQuantite = useMemo(() => {
    return bonsLivraison.reduce((sum, bon) => sum + getTotalQuantite(bon), 0);
  }, [bonsLivraison]);

  const totalAchat = useMemo(() => {
    return bonsLivraison.reduce((sum, bon) => sum + getTotalAchat(bon), 0);
  }, [bonsLivraison]);

  const fetchBonsLivraison = async () => {
    try {
      setLoading(true);
      const data = await getAllBonsLivraison();
      setBonsLivraison(data);
    } catch (error) {
      console.error("Erreur chargement bons de livraison:", error);
      setBonsLivraison([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonsLivraison();
  }, []);

  const handleCreatedBon = async () => {
    setFormOpen(false);

    // Important: on recharge pour récupérer le stock mis à jour et les relations complètes.
    await fetchBonsLivraison();
  };

  const openDetail = (bon: BonLivraison) => {
    setSelectedBon(bon);
    setDetailOpen(true);
  };

  const openDelete = (bon: BonLivraison) => {
    setSelectedBon(bon);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBon) return;

    try {
      setDeleting(true);

      await removeBonLivraison(selectedBon.id);

      setBonsLivraison((prev) =>
        prev.filter((bon) => bon.id !== selectedBon.id),
      );

      setDeleteOpen(false);
      setSelectedBon(null);
    } catch (error) {
      console.error("Erreur suppression bon de livraison:", error);
      alert(
        "Impossible de supprimer ce bon. Il a peut-être déjà impacté le stock.",
      );
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
            Bons de livraison
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Gérez les réceptions de stock depuis les fournisseurs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} />
          Nouveau bon
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <Truck size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{totalBons}</p>
          <p className="mt-1 text-sm text-text-muted">Bons enregistrés</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg text-info">
            <Package size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{totalLignes}</p>
          <p className="mt-1 text-sm text-text-muted">Lignes produits</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success">
            <Package size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{totalQuantite}</p>
          <p className="mt-1 text-sm text-text-muted">Unités reçues</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg text-warning">
            <CalendarDays size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {formatPrice(totalAchat)}
          </p>
          <p className="mt-1 text-sm text-text-muted">Total achat</p>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des bons
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredBons.length} bon
              {filteredBons.length > 1 ? "s" : ""} trouvé
              {filteredBons.length > 1 ? "s" : ""}
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
              placeholder="Rechercher bon, fournisseur, produit..."
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
        ) : filteredBons.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <Truck size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucun bon de livraison
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Créez un bon pour enregistrer une réception de stock.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredBons.map((bon) => {
              const quantite = getTotalQuantite(bon);
              const montant = getTotalAchat(bon);

              return (
                <div
                  key={bon.id}
                  className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                      <Truck size={19} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-text-h">
                          {bon.numeroBon}
                        </p>

                        <span className="rounded-full bg-primary-bg px-2 py-0.5 text-[11px] font-medium text-primary">
                          {bon.lignes.length} produit
                          {bon.lignes.length > 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                        <span>{bon.fournisseur.nom}</span>

                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={12} />
                          {formatDate(bon.dateReception)}
                        </span>

                        <span>{bon.fournisseur.telephone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:min-w-[320px]">
                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {quantite}
                      </p>
                      <p className="text-[11px] text-text-muted">Unités</p>
                    </div>

                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {formatPrice(montant)}
                      </p>
                      <p className="text-[11px] text-text-muted">Montant</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(bon)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                      title="Voir"
                    >
                      <Eye size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openDelete(bon)}
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
        <BonLivraisonFormModal
          onClose={() => setFormOpen(false)}
          onCreated={handleCreatedBon}
        />
      )}

      {detailOpen && selectedBon && (
        <BonLivraisonDetailModal
          bon={selectedBon}
          onClose={() => {
            setDetailOpen(false);
            setSelectedBon(null);
          }}
        />
      )}

      {deleteOpen && selectedBon && (
        <DeleteConfirmModal
          title="Supprimer le bon"
          description={`Êtes-vous sûr de vouloir supprimer le bon "${selectedBon.numeroBon}" ? Cette action peut impacter le stock.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedBon(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
}
