import { Barcode, CalendarDays, Package, Phone, Truck, X } from "lucide-react";

import type { BonLivraison } from "../../../interfaces/bonLivraison.types";

type Props = {
  bon: BonLivraison;
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

export default function BonLivraisonDetailModal({
  bon,
  onClose,
}: Props): React.JSX.Element {
  const totalQuantite = bon.lignes.reduce((sum, ligne) => {
    return sum + ligne.quantite;
  }, 0);

  const totalAchat = bon.lignes.reduce((sum, ligne) => {
    return sum + ligne.quantite * Number(ligne.prixAchat || 0);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              Bon de livraison {bon.numeroBon}
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Détail des produits réceptionnés.
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <CalendarDays size={17} />
              </div>

              <p className="text-xs text-text-muted">Date réception</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {formatDate(bon.dateReception)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <Truck size={17} />
              </div>

              <p className="text-xs text-text-muted">Fournisseur</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {bon.fournisseur.nom}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <Phone size={17} />
              </div>

              <p className="text-xs text-text-muted">Téléphone</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {bon.fournisseur.telephone}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h4 className="text-sm font-semibold text-text-h">
                  Produits reçus
                </h4>

                <p className="mt-0.5 text-xs text-text-muted">
                  {bon.lignes.length} ligne{bon.lignes.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {bon.lignes.map((ligne) => (
                <div
                  key={`${ligne.bonId}-${ligne.produitId}`}
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

                  <div className="grid grid-cols-3 gap-3 md:min-w-[360px]">
                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {ligne.quantite}
                      </p>
                      <p className="text-[11px] text-text-muted">Quantité</p>
                    </div>

                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {formatPrice(ligne.prixAchat)}
                      </p>
                      <p className="text-[11px] text-text-muted">Prix achat</p>
                    </div>

                    <div className="rounded-xl bg-bg-subtle px-3 py-2 text-center">
                      <p className="text-sm font-semibold text-text-h">
                        {formatPrice(
                          ligne.quantite * Number(ligne.prixAchat || 0),
                        )}
                      </p>
                      <p className="text-[11px] text-text-muted">Total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-bg-subtle px-4 py-3">
              <p className="text-xs text-text-muted">Quantité totale reçue</p>
              <p className="mt-1 text-lg font-semibold text-text-h">
                {totalQuantite} unité{totalQuantite > 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-xl bg-bg-subtle px-4 py-3">
              <p className="text-xs text-text-muted">Montant total achat</p>
              <p className="mt-1 text-lg font-semibold text-text-h">
                {formatPrice(totalAchat)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
