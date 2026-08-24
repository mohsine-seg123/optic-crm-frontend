import {
  Barcode,
  CalendarDays,
  CreditCard,
  FileText,
  Package,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import type { ModePaiement, Vente } from "../../../../interfaces/vente.types";

type Props = {
  vente: Vente;
  onClose: () => void;
};

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

export default function VenteDetailModal({
  vente,
  onClose,
}: Props): React.JSX.Element {
  const lignes = vente.lignes ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              Vente #{vente.id}
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Détail de la vente et des produits vendus.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-bg-subtle hover:text-text-h"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[78vh] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <CalendarDays size={17} />
              </div>

              <p className="text-xs text-text-muted">Date vente</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {formatDate(vente.dateVente)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <UserRound size={17} />
              </div>

              <p className="text-xs text-text-muted">Client</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {vente.client
                  ? `${vente.client.nom} ${vente.client.prenom}`
                  : `Client #${vente.clientId}`}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <Phone size={17} />
              </div>

              <p className="text-xs text-text-muted">Téléphone</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {vente.client?.telephone ?? "—"}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-success-bg text-success">
                <CreditCard size={17} />
              </div>

              <p className="text-xs text-text-muted">Paiement</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {getModePaiementLabel(vente.modePaiement)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h4 className="text-sm font-semibold text-text-h">
                  Produits vendus
                </h4>

                <p className="mt-0.5 text-xs text-text-muted">
                  {lignes.length} ligne{lignes.length > 1 ? "s" : ""}
                </p>
              </div>

              {vente.devisId && (
                <span className="rounded-full bg-primary-bg px-2.5 py-1 text-xs font-medium text-primary">
                  Depuis devis #{vente.devisId}
                </span>
              )}
            </div>

            {lignes.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Package size={24} className="text-text-muted" />
                <p className="mt-2 text-sm text-text-muted">
                  Aucune ligne trouvée pour cette vente.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {lignes.map((ligne) => {
                  const total =
                    ligne.quantite * Number(ligne.prixUnitaire || 0) -
                    Number(ligne.remise || 0);

                  return (
                    <div
                      key={`${ligne.venteId}-${ligne.produitId}`}
                      className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                          <Package size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-h">
                            {ligne.produit.designation}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                            <span>
                              {ligne.produit.marque} · {ligne.produit.modele}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Barcode size={12} />
                              {ligne.produit.codeBarre}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 md:min-w-[460px]">
                        <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                          <p className="text-sm font-semibold text-text-h">
                            {ligne.quantite}
                          </p>
                          <p className="text-[11px] text-text-muted">Qté</p>
                        </div>

                        <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                          <p className="text-sm font-semibold text-text-h">
                            {formatPrice(ligne.prixUnitaire)}
                          </p>
                          <p className="text-[11px] text-text-muted">Prix</p>
                        </div>

                        <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                          <p className="text-sm font-semibold text-text-h">
                            {formatPrice(ligne.remise)}
                          </p>
                          <p className="text-[11px] text-text-muted">Remise</p>
                        </div>

                        <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                          <p className="text-sm font-semibold text-text-h">
                            {formatPrice(Math.max(total, 0))}
                          </p>
                          <p className="text-[11px] text-text-muted">Total</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-bg-subtle px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <p className="text-sm font-medium text-text-h">Montant total</p>
              </div>

              <p className="text-xl font-semibold text-text-h">
                {formatPrice(vente.montantTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
