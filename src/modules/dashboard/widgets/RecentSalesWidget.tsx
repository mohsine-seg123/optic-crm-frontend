import {
  Receipt,
  Phone,
  CreditCard,
  Banknote,
  Landmark,
  Wallet,
  UserRound,
  ArrowUpRight,
} from "lucide-react";

import type { RecentSale } from "../../../interfaces/Dashbord.types";

type Props = {
  ventes: RecentSale[];
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

function formatModePaiement(mode: string): string {
  const modes: Record<string, string> = {
    cash: "Espèces",
    carte: "Carte",
    virement: "Virement",
    cheque: "Chèque",
    mutuelle: "Mutuelle",
  };

  return modes[mode] || mode;
}

function getPaymentIcon(mode: string) {
  switch (mode) {
    case "cash":
      return <Banknote size={14} />;
    case "carte":
      return <CreditCard size={14} />;
    case "virement":
      return <Landmark size={14} />;
    case "cheque":
      return <Wallet size={14} />;
    default:
      return <CreditCard size={14} />;
  }
}

function getPaymentBadgeClass(mode: string): string {
  switch (mode) {
    case "cash":
      return "bg-success-bg text-success";
    case "carte":
      return "bg-primary-bg text-primary";
    case "virement":
      return "bg-info-bg text-info";
    case "cheque":
      return "bg-warning-bg text-warning";
    case "mutuelle":
      return "bg-accent-bg text-accent";
    default:
      return "bg-bg-subtle text-text-muted";
  }
}

export default function RecentSalesWidget({
  ventes,
}: Props): React.JSX.Element {
  const visibleVentes = ventes.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-bg">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-text-h">
            Dernières ventes
          </h3>

          <p className="mt-1 text-xs text-text-muted">
            Les ventes récentes du magasin
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
          <Receipt size={18} />
        </div>
      </div>

      {/* EMPTY */}
      {visibleVentes.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center px-5 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
            <Receipt size={21} />
          </div>

          <p className="text-sm font-medium text-text-h">
            Aucune vente récente
          </p>

          <p className="mt-1 text-xs text-text-muted">
            Les dernières ventes apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleVentes.map((vente) => (
            <div
              key={vente.id}
              className="group flex items-center gap-3 px-5 py-3 transition hover:bg-bg-subtle"
            >
              {/* ICON */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-bg text-primary">
                <Receipt size={17} />
              </div>

              {/* MAIN INFO */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-text-h">
                    Vente #{vente.id}
                  </p>

                  <span
                    className={`hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline-flex ${getPaymentBadgeClass(
                      vente.modePaiement,
                    )}`}
                  >
                    {getPaymentIcon(vente.modePaiement)}
                    {formatModePaiement(vente.modePaiement)}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <UserRound size={12} />
                    {vente.client.nom} {vente.client.prenom}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} />
                    {vente.client.telephone}
                  </span>
                </div>
              </div>

              {/* RIGHT INFO */}
              <div className="hidden min-w-[140px] text-right md:block">
                <p className="text-sm font-semibold text-text-h">
                  {formatPrice(vente.montantTotal)}
                </p>

                <p className="mt-0.5 text-[11px] text-text-muted">
                  {formatDate(vente.dateVente)}
                </p>
              </div>

              {/* ACTION */}
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-subtle transition group-hover:bg-bg group-hover:text-primary"
                title="Voir vente"
              >
                <ArrowUpRight size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      {ventes.length > 5 && (
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            className="text-sm font-medium text-primary transition hover:text-primary-hover"
          >
            Voir toutes les ventes
          </button>
        </div>
      )}
    </div>
  );
}
