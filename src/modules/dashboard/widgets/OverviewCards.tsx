import {
  UsersRound,
  ReceiptText,
  FileText,
  AlertTriangle,
  BellRing,
  CalendarDays,
  WalletCards,
  TrendingUp,
} from "lucide-react";

import type { DashboardOverview } from "../../../interfaces/Dashbord.types";

type Props = {
  overview: DashboardOverview | null;
};

function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR")} DH`;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  tone = "default",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const toneClass = {
    default: "bg-primary-bg text-primary",
    success: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
    danger: "bg-danger-bg text-danger",
    info: "bg-info-bg text-info",
  };

  return (
    <div className="rounded-xl border border-border bg-bg p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">{title}</p>

          <p className="mt-2 text-2xl font-semibold text-text-h">{value}</p>

          <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneClass[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function OverviewCards({ overview }: Props): React.JSX.Element {
  if (!overview) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-border bg-bg-subtle"
          />
        ))}
      </div>
    );
  }

  const stockFaibleCount = overview.produitsStockFaible.length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="CA aujourd'hui"
        value={formatPrice(overview.todayRevenue)}
        subtitle={`${overview.ventesTodayCount} vente aujourd'hui`}
        icon={<WalletCards size={21} />}
        tone="success"
      />

      <KpiCard
        title="CA du mois"
        value={formatPrice(overview.monthRevenue)}
        subtitle={`${overview.ventesMonthCount} vente ce mois`}
        icon={<TrendingUp size={21} />}
        tone="info"
      />

      <KpiCard
        title="Clients"
        value={overview.clientsCount}
        subtitle="Clients enregistrés"
        icon={<UsersRound size={21} />}
        tone="default"
      />

      <KpiCard
        title="Devis"
        value={overview.devisCount}
        subtitle="Devis créés"
        icon={<FileText size={21} />}
        tone="info"
      />

      <KpiCard
        title="Factures en attente"
        value={overview.facturesPendingCount}
        subtitle="Remboursement non traité"
        icon={<ReceiptText size={21} />}
        tone={overview.facturesPendingCount > 0 ? "warning" : "success"}
      />

      <KpiCard
        title="Rappels aujourd'hui"
        value={overview.rappelsTodayCount}
        subtitle="Rappels à contacter"
        icon={<BellRing size={21} />}
        tone={overview.rappelsTodayCount > 0 ? "warning" : "default"}
      />

      <KpiCard
        title="Stock faible"
        value={stockFaibleCount}
        subtitle="Produits à réapprovisionner"
        icon={<AlertTriangle size={21} />}
        tone={stockFaibleCount > 0 ? "danger" : "success"}
      />

      <KpiCard
        title="Période"
        value="2026"
        subtitle="Vue générale annuelle"
        icon={<CalendarDays size={21} />}
        tone="default"
      />
    </div>
  );
}
