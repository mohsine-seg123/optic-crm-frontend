import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyRevenueItem } from "../../../services/DashbordService";

type Props = {
  data: MonthlyRevenueItem[];
};

export default function RevenueChart({ data }: Props): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border bg-bg p-5">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-text-h">
          Chiffre d'affaires mensuel
        </h3>

        <p className="mt-1 text-sm text-text-muted">
          Évolution du chiffre d'affaires par mois.
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis dataKey="month" tickLine={false} axisLine={false} />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value} DH`}
            />

            <Tooltip
              formatter={(value) => [
                typeof value === "number"
                  ? `${value.toLocaleString("fr-FR")} DH`
                  : "—",
                "CA",
              ]}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6d28d9"
              fill="#ede9fe"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
