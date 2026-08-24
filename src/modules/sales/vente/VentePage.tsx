import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Eye,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  WalletCards,
  XCircle,
  FileText,
} from "lucide-react";

import { getAllVentes, removeVente } from "../../../services/venteService";

import DeleteConfirmModal from "../../../components/ui/DeleteConfirmModal";
import VenteFormModal from "./components/VenteFormModal";
import VenteDetailModal from "./components/VenteDetailModal";

import type { ModePaiement, Vente } from "../../../interfaces/vente.types";


import FactureFormModal from "../facture/components/FactureFormModal";
import type { Facture } from "../../../interfaces/facture.types";


function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(value: string | number): string {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

function getModePaiementLabel(mode: ModePaiement): string {
  const labels: Record<ModePaiement, string> = {
    cash: "Espèces",
    carte: "Carte",
    virement: "Virement",
    cheque: "Chèque",
  };

  return labels[mode] || mode;
}

function getPaymentClass(mode: ModePaiement): string {
  const classes: Record<ModePaiement, string> = {
    cash: "bg-success-bg text-success",
    carte: "bg-primary-bg text-primary",
    virement: "bg-info-bg text-info",
    cheque: "bg-warning-bg text-warning",
  };

  return classes[mode] || "bg-bg-subtle text-text-muted";
}




export default function VentePage(): React.JSX.Element {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | ModePaiement>("all");

  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);


  const [factureOpen, setFactureOpen] = useState(false);
  const [venteForFacture, setVenteForFacture] = useState<Vente | null>(null);



  

  const filteredVentes = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return ventes.filter((vente) => {
      const matchesSearch = !keyword
        ? true
        : `
          ${vente.id}
          ${vente.client?.nom ?? ""}
          ${vente.client?.prenom ?? ""}
          ${vente.client?.telephone ?? ""}
          ${vente.modePaiement}
          ${vente.devisId ?? ""}
          ${vente.lignes?.map((ligne) => ligne.produit.designation).join(" ") ?? ""}
        `
            .toLowerCase()
            .includes(keyword);

      const matchesMode =
        modeFilter === "all" ? true : vente.modePaiement === modeFilter;

      return matchesSearch && matchesMode;
    });
  }, [ventes, search, modeFilter]);

  const totalAmount = useMemo(() => {
    return ventes.reduce((sum, vente) => {
      return sum + Number(vente.montantTotal || 0);
    }, 0);
  }, [ventes]);

  const directSalesCount = useMemo(() => {
    return ventes.filter((vente) => !vente.devisId).length;
  }, [ventes]);

  const fromDevisCount = useMemo(() => {
    return ventes.filter((vente) => vente.devisId).length;
  }, [ventes]);

  const fetchVentes = async () => {
    try {
      setLoading(true);
      const data = await getAllVentes();
      setVentes(data);
    } catch (error) {
      console.error("Erreur chargement ventes:", error);
      setVentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentes();
  }, []);

  const openDetail = (vente: Vente) => {
    setSelectedVente(vente);
    setDetailOpen(true);
  };

  const openDelete = (vente: Vente) => {
    setSelectedVente(vente);
    setDeleteOpen(true);
  };

  const handleCreatedVente = async () => {
    setFormOpen(false);
    await fetchVentes();
  };

  const confirmDelete = async () => {
    if (!selectedVente) return;

    try {
      setDeleting(true);

      await removeVente(selectedVente.id);

      setVentes((prev) =>
        prev.filter((vente) => vente.id !== selectedVente.id),
      );

      setDeleteOpen(false);
      setSelectedVente(null);
    } catch (error) {
      console.error("Erreur suppression vente:", error);
      alert(
        "Impossible de supprimer cette vente. Elle est peut-être liée à une facture.",
      );
    } finally {
      setDeleting(false);
    }
  };



  const openFactureModal = (vente: Vente) => {
    if (vente.facture) {
      alert(
        `Cette vente possède déjà une facture : ${vente.facture.numeroFacture}`,
      );
      return;
    }

    setVenteForFacture(vente);
    setFactureOpen(true);
  };

  const handleFactureCreated = async (facture: Facture) => {
    setFactureOpen(false);
    setVenteForFacture(null);

    await fetchVentes();
  };

  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg px-5 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Commercial</p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text-h">
            Ventes
          </h1>

          <p className="mt-1 text-sm text-text-muted">
            Suivez les ventes directes et les ventes issues des devis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
        >
          <Plus size={17} />
          Nouvelle vente
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
            <ShoppingCart size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{ventes.length}</p>
          <p className="mt-1 text-sm text-text-muted">Total ventes</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-success-bg text-success">
            <WalletCards size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {formatPrice(totalAmount)}
          </p>
          <p className="mt-1 text-sm text-text-muted">Chiffre d’affaires</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-info-bg text-info">
            <ShoppingCart size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">
            {directSalesCount}
          </p>
          <p className="mt-1 text-sm text-text-muted">Ventes directes</p>
        </div>

        <div className="rounded-2xl border border-border bg-bg p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warning-bg text-warning">
            <CreditCard size={19} />
          </div>

          <p className="text-2xl font-semibold text-text-h">{fromDevisCount}</p>
          <p className="mt-1 text-sm text-text-muted">Depuis devis</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-h">
              Liste des ventes
            </h2>

            <p className="mt-1 text-xs text-text-muted">
              {filteredVentes.length} vente
              {filteredVentes.length > 1 ? "s" : ""} trouvée
              {filteredVentes.length > 1 ? "s" : ""}
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
                placeholder="Rechercher client, téléphone..."
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <select
              value={modeFilter}
              onChange={(event) =>
                setModeFilter(event.target.value as "all" | ModePaiement)
              }
              className="rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition focus:border-primary"
            >
              <option value="all">Tous les paiements</option>
              <option value="cash">Espèces</option>
              <option value="carte">Carte</option>
              <option value="virement">Virement</option>
              <option value="cheque">Chèque</option>
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
        ) : filteredVentes.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
              <XCircle size={22} />
            </div>

            <p className="text-sm font-medium text-text-h">
              Aucune vente trouvée
            </p>

            <p className="mt-1 text-sm text-text-muted">
              Créez une vente directe ou convertissez un devis.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredVentes.map((vente) => (
              <div
                key={vente.id}
                className="flex flex-col gap-4 px-5 py-4 transition hover:bg-bg-subtle xl:flex-row xl:items-center xl:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                    <ShoppingCart size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-text-h">
                        Vente #{vente.id}
                      </p>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getPaymentClass(
                          vente.modePaiement,
                        )}`}
                      >
                        {getModePaiementLabel(vente.modePaiement)}
                      </span>

                      {vente.devisId && (
                        <span className="rounded-full bg-primary-bg px-2 py-0.5 text-[11px] font-medium text-primary">
                          Devis #{vente.devisId}
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span>
                        {vente.client
                          ? `${vente.client.nom} ${vente.client.prenom}`
                          : `Client #${vente.clientId}`}
                      </span>

                      <span>{vente.client?.telephone ?? "—"}</span>
                      <span>{formatDate(vente.dateVente)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:min-w-[300px]">
                  <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-text-h">
                      {vente.lignes?.length ?? 0}
                    </p>
                    <p className="text-[11px] text-text-muted">Produits</p>
                  </div>

                  <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                    <p className="text-sm font-semibold text-text-h">
                      {formatPrice(vente.montantTotal)}
                    </p>
                    <p className="text-[11px] text-text-muted">Montant</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openDetail(vente)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-primary hover:text-primary"
                    title="Voir"
                  >
                    <Eye size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openFactureModal(vente)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-muted transition hover:border-success hover:text-success"
                    title={
                      vente.facture ? "Facture déjà générée" : "Générer facture"
                    }
                  >
                    <FileText size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openDelete(vente)}
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
        <VenteFormModal
          onClose={() => setFormOpen(false)}
          onCreated={() => {
            void handleCreatedVente();
          }}
        />
      )}

      {detailOpen && selectedVente && (
        <VenteDetailModal
          vente={selectedVente}
          onClose={() => {
            setDetailOpen(false);
            setSelectedVente(null);
          }}
        />
      )}

      {deleteOpen && selectedVente && (
        <DeleteConfirmModal
          title="Supprimer la vente"
          description={`Êtes-vous sûr de vouloir supprimer la vente #${selectedVente.id} ? Cette action peut impacter le stock et les factures liées.`}
          loading={deleting}
          onCancel={() => {
            setDeleteOpen(false);
            setSelectedVente(null);
          }}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}

      {factureOpen && venteForFacture && (
  <FactureFormModal
    vente={venteForFacture}
    onClose={() => {
      setFactureOpen(false);
      setVenteForFacture(null);
    }}
    onCreated={(facture) => {
      void handleFactureCreated(facture);
    }}
  />
)}
    </div>
  );
}
