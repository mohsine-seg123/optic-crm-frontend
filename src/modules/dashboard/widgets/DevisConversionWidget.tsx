import { CheckCircle2, FileText, TrendingUp } from "lucide-react";

import type { DevisConversion } from "../../../interfaces/Dashbord.types";

type Props = {
  conversion: DevisConversion | null;
};

function getConversionStatus(taux: number) {
  if (taux >= 75) {
    return {
      label: "Très bon",
      className: "bg-success-bg text-success",
    };
  }

  if (taux >= 50) {
    return {
      label: "Correct",
      className: "bg-primary-bg text-primary",
    };
  }

  return {
    label: "À améliorer",
    className: "bg-warning-bg text-warning",
  };
}

export default function DevisConversionWidget({
  conversion,
}: Props): React.JSX.Element {
  const devis = conversion?.devis ?? 0;
  const devisConvertis = conversion?.devisConvertis ?? 0;
  const tauxConversion = conversion?.tauxConversion ?? 0;

  const status = getConversionStatus(tauxConversion);

  return (
    <div className="rounded-2xl border border-border bg-bg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-text-h">
            Conversion des devis
          </h3>

          <p className="mt-1 text-xs text-text-muted">
            Suivi des devis transformés en ventes
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
          <TrendingUp size={18} />
        </div>
      </div>

      {/* Main content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-semibold tracking-tight text-text-h">
                {tauxConversion}%
              </p>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <p className="mt-1 text-sm text-text-muted">
              Taux de conversion global
            </p>
          </div>

          <div className="rounded-xl bg-bg-subtle px-4 py-3 text-right">
            <p className="text-xs text-text-muted">Convertis</p>

            <p className="mt-1 text-sm font-semibold text-text-h">
              {devisConvertis}/{devis}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-text-muted">Progression</span>
            <span className="font-medium text-text-h">
              {Math.min(tauxConversion, 100)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-bg-subtle">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min(tauxConversion, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary-bg text-primary">
              <FileText size={16} />
            </div>

            <p className="text-xl font-semibold text-text-h">{devis}</p>
            <p className="mt-1 text-xs text-text-muted">Devis créés</p>
          </div>

          <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-success-bg text-success">
              <CheckCircle2 size={16} />
            </div>

            <p className="text-xl font-semibold text-text-h">
              {devisConvertis}
            </p>
            <p className="mt-1 text-xs text-text-muted">Ventes générées</p>
          </div>
        </div>
      </div>
    </div>
  );
}
