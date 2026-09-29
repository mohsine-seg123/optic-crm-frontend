import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CreditCard,
  Landmark,
  ShoppingCart,
  Wallet,
  X,
} from "lucide-react";

import type { Devis } from "../../../../interfaces/devis.types";

import { convertDevisToVente } from "../../../../services/venteService";

import type { ModePaiement, Vente } from "../../../../interfaces/vente.types";

type Props = {
  devis: Devis;
  onClose: () => void;
  onConverted: (vente: Vente) => void | Promise<void>;
};

type PaymentOption = {
  value: ModePaiement;
  label: string;
  icon: React.ReactNode;
};

const paymentOptions: PaymentOption[] = [
  {
    value: "cash",
    label: "Espèces",
    icon: <Banknote size={16} />,
  },
  {
    value: "carte",
    label: "Carte",
    icon: <CreditCard size={16} />,
  },
  {
    value: "virement",
    label: "Virement",
    icon: <Landmark size={16} />,
  },
  {
    value: "cheque",
    label: "Chèque",
    icon: <Wallet size={16} />,
  },
];

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function formatPrice(value: string | number): string {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

function formatClientName(devis: Devis): string {
  if (!devis.client) return `Client #${devis.clientId}`;

  return `${devis.client.nom} ${devis.client.prenom}`;
}

export default function ConvertDevisModal({
  devis,
  onClose,
  onConverted,
}: Props): React.JSX.Element {
  const [modePaiement, setModePaiement] = useState<ModePaiement>("cash");
  const [dateVente, setDateVente] = useState(getTodayDate());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lignes = useMemo(() => devis.lignes ?? [], [devis.lignes]);

  const stockInsuffisant = useMemo(() => {
    return lignes.filter((ligne) => {
      return ligne.produit && ligne.quantite > ligne.produit.stockActuel;
    });
  }, [lignes]);

  const canConvert =
    devis.statut !== "converti" &&
    devis.statut !== "refuse" &&
    lignes.length > 0 &&
    stockInsuffisant.length === 0;

  const handleConfirm = async () => {
    if (devis.statut === "converti") {
      setError("Ce devis est déjà converti en vente.");
      return;
    }

    if (devis.statut === "refuse") {
      setError("Impossible de convertir un devis refusé.");
      return;
    }

    if (!dateVente) {
      setError("La date de vente est obligatoire.");
      return;
    }

    if (lignes.length === 0) {
      setError("Ce devis ne contient aucun produit.");
      return;
    }

    if (stockInsuffisant.length > 0) {
      setError("Stock insuffisant pour un ou plusieurs produits.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const vente = await convertDevisToVente({
        devisId: devis.id,
        modePaiement,
        dateVente,
      });

      await onConverted(vente);
      onClose();
    } catch (error) {
      console.error("Erreur conversion devis en vente:", error);
      setError(
        "Impossible de convertir ce devis en vente. Vérifiez le stock ou l'état du devis.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              Convertir en vente
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Confirmez la vente à partir du devis #{devis.id}.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-bg-subtle hover:text-text-h disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          {stockInsuffisant.length > 0 && (
            <div className="mb-4 rounded-xl border border-warning/20 bg-warning-bg px-4 py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={17} className="mt-0.5 text-warning" />

                <div>
                  <p className="text-sm font-medium text-warning">
                    Stock insuffisant
                  </p>

                  <p className="mt-1 text-xs text-warning">
                    Certains produits du devis n’ont pas assez de stock pour
                    créer la vente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SUMMARY */}
          <div className="rounded-2xl border border-border bg-bg-subtle/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-text-muted">Client</p>
                <p className="mt-1 text-sm font-semibold text-text-h">
                  {formatClientName(devis)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-text-muted">Montant</p>
                <p className="mt-1 text-lg font-semibold text-text-h">
                  {formatPrice(devis.montantTotal)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-bg px-3 py-2">
                <p className="text-xs text-text-muted">Produits</p>
                <p className="mt-1 text-sm font-semibold text-text-h">
                  {lignes.length} ligne{lignes.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="rounded-xl bg-bg px-3 py-2">
                <p className="text-xs text-text-muted">Statut devis</p>
                <p className="mt-1 text-sm font-semibold text-text-h">
                  {devis.statut}
                </p>
              </div>
            </div>
          </div>

          {/* DATE */}
          <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-text-h">
              Date de vente
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                type="date"
                value={dateVente}
                onChange={(event) => setDateVente(event.target.value)}
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition focus:border-primary"
              />
            </div>
          </div>

          {/* PAYMENT */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-text-h">
              Mode de paiement
            </label>

            <div className="grid grid-cols-2 gap-3">
              {paymentOptions.map((option) => {
                const selected = modePaiement === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setModePaiement(option.value)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      selected
                        ? "border-primary bg-primary-bg text-primary"
                        : "border-border bg-bg-subtle text-text-muted hover:border-primary hover:text-primary"
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-bg-subtle hover:text-text-h disabled:cursor-not-allowed disabled:opacity-60"
            >
              Annuler
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || !canConvert}
              className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingCart size={16} />
              {submitting ? "Conversion..." : "Confirmer la vente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
