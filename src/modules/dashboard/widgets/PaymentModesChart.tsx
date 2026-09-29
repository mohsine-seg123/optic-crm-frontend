import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import {
  CreditCard,
  Banknote,
  Landmark,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

import type { PaymentModeItem } from "../../../interfaces/Dashbord.types";


type Props = {
  data: PaymentModeItem[];
  totalAmount: number;
};

const COLORS = [
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#0891b2",
];

function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR")} DH`;
}

function formatModePaiement(mode: string): string {
  const modes: Record<string, string> = {
    cash: "Espèces",
    carte: "Carte bancaire",
    virement: "Virement",
    cheque: "Chèque",
    mutuelle: "Mutuelle",
  };

  return modes[mode] || mode;
}

function getPaymentIcon(mode: string) {
  switch (mode) {
    case "cash":
      return <Banknote size={16} />;
    case "carte":
      return <CreditCard size={16} />;
    case "virement":
      return <Landmark size={16} />;
    case "cheque":
      return <Wallet size={16} />;
    default:
      return <CircleDollarSign size={16} />;
  }
}

export default function PaymentModesChart({
  data,
  totalAmount,
}: Props): React.JSX.Element {
  const hasData = data.length > 0 && totalAmount > 0;

  return (
    <div className="rounded-2xl border border-border bg-bg p-5">
      {/* HEADER */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-h">
            Modes de paiement
          </h3>

          <p className="mt-1 text-sm text-text-muted">
            Répartition des ventes par mode de paiement.
          </p>
        </div>

        <div className="rounded-xl bg-primary-bg px-3 py-2 text-right">
          <p className="text-xs text-text-muted">Total</p>
          <p className="text-sm font-semibold text-primary">
            {formatPrice(totalAmount)}
          </p>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-xl bg-bg-subtle text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg text-text-muted">
            <CreditCard size={22} />
          </div>

          <p className="text-sm font-medium text-text-h">
            Aucun paiement trouvé
          </p>

          <p className="mt-1 text-sm text-text-muted">
            Les statistiques apparaîtront après les premières ventes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* CHART */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="montantTotal"
                  nameKey="modePaiement"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={100}
                  paddingAngle={4}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.modePaiement}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value, _name, props) => {
                    const numericValue = Number(value ?? 0);

                    return [
                      `${numericValue.toFixed(2)} DH`,
                      props?.payload?.name ?? "",
                    ];
                  }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* LIST */}
          <div className="space-y-4">
            {data.map((item, index) => {
              const color = COLORS[index % COLORS.length];

              return (
                <div key={item.modePaiement} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: color }}
                      >
                        {getPaymentIcon(item.modePaiement)}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-text-h">
                          {formatModePaiement(item.modePaiement)}
                        </p>

                        <p className="text-xs text-text-muted">
                          {item.ventesCount} vente
                          {item.ventesCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-text-h">
                        {formatPrice(item.montantTotal)}
                      </p>

                      <p className="text-xs text-text-muted">
                        {item.pourcentage}%
                      </p>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-bg-subtle">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.pourcentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
