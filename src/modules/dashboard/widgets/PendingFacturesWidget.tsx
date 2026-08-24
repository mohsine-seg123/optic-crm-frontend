import {
  ReceiptText,
  UserRound,
  ShieldCheck,
  CalendarDays,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";

import type { PendingFacture } from "../../../interfaces/Dashbord.types";

type Props = {
  factures: PendingFacture[];
};

function formatPrice(value: string | number): string {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function PendingFacturesWidget({
  factures,
}: Props): React.JSX.Element {
  const visibleFactures = factures.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-bg">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-text-h">
            Factures en attente
          </h3>

          <p className="mt-1 text-xs text-text-muted">
            Remboursements mutuelle non traités
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-bg text-warning">
          <ReceiptText size={18} />
        </div>
      </div>

      {visibleFactures.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center px-5 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-success">
            <ReceiptText size={21} />
          </div>

          <p className="text-sm font-medium text-text-h">
            Aucune facture en attente
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Toutes les factures sont traitées.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleFactures.map((facture) => (
            <div
              key={facture.id}
              className="group flex items-center gap-3 px-5 py-3 transition hover:bg-bg-subtle"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-bg text-warning">
                <AlertCircle size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-text-h">
                    {facture.numeroFacture}
                  </p>

                  <span className="hidden rounded-full bg-warning-bg px-2 py-0.5 text-[11px] font-medium text-warning sm:inline-flex">
                    En attente
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <UserRound size={12} />
                    {facture.vente.client.nom} {facture.vente.client.prenom}
                  </span>

                  {facture.mutuelle && (
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck size={12} />
                      {facture.mutuelle.nom}
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={12} />
                    {formatDate(facture.dateFacture)}
                  </span>
                </div>
              </div>

              <div className="hidden min-w-[140px] text-right md:block">
                <p className="text-sm font-semibold text-text-h">
                  {formatPrice(facture.montantTotal)}
                </p>

                <p className="mt-0.5 text-[11px] text-text-muted">
                  Mutuelle : {formatPrice(facture.partMutuelle)}
                </p>
              </div>

              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-subtle transition group-hover:bg-bg group-hover:text-primary"
                title="Voir facture"
              >
                <ArrowUpRight size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {factures.length > 5 && (
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            className="text-sm font-medium text-primary transition hover:text-primary-hover"
          >
            Voir toutes les factures
          </button>
        </div>
      )}
    </div>
  );
}
