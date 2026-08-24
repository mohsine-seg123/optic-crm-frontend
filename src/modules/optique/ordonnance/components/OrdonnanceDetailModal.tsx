import {
  CalendarDays,
  ExternalLink,
  FileText,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import type { Ordonnance } from "../../../../interfaces/ordonnance.types";

type Props = {
  ordonnance: Ordonnance;
  onClose: () => void;
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isExpired(dateExpiration: string): boolean {
  return new Date(dateExpiration) < new Date();
}

function getScanUrl(scanUrl: string | null): string | null {
  if (!scanUrl) return null;

  if (scanUrl.startsWith("http://") || scanUrl.startsWith("https://")) {
    return scanUrl;
  }

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const serverUrl = apiUrl.replace(/\/api\/?$/, "");

  return `${serverUrl}${scanUrl}`;
}

export default function OrdonnanceDetailModal({
  ordonnance,
  onClose,
}: Props): React.JSX.Element {
  const expired = isExpired(ordonnance.dateExpiration);
  const client = ordonnance.dossier?.client;
  const scanUrl = getScanUrl(ordonnance.scanUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-text-h">
                Ordonnance #{ordonnance.id}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  expired
                    ? "bg-danger-bg text-danger"
                    : "bg-success-bg text-success"
                }`}
              >
                {expired ? "Expirée" : "Valide"}
              </span>
            </div>

            <p className="mt-1 text-sm text-text-muted">
              Détail de la prescription médicale.
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

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <Stethoscope size={17} />
              </div>

              <p className="text-xs text-text-muted">Médecin</p>

              <p className="mt-1 text-sm font-semibold text-text-h">
                {ordonnance.medecin}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <CalendarDays size={17} />
              </div>

              <p className="text-xs text-text-muted">Date ordonnance</p>

              <p className="mt-1 text-sm font-semibold text-text-h">
                {formatDate(ordonnance.dateOrdonnance)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div
                className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${
                  expired
                    ? "bg-danger-bg text-danger"
                    : "bg-success-bg text-success"
                }`}
              >
                <CalendarDays size={17} />
              </div>

              <p className="text-xs text-text-muted">Expiration</p>

              <p className="mt-1 text-sm font-semibold text-text-h">
                {formatDate(ordonnance.dateExpiration)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <UserRound size={18} />
              </div>

              <div>
                <p className="text-sm font-semibold text-text-h">
                  {client
                    ? `${client.nom} ${client.prenom}`
                    : `Dossier #${ordonnance.dossierId}`}
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  Dossier :{" "}
                  {ordonnance.dossier?.numeroDossier ??
                    `#${ordonnance.dossierId}`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-subtle text-text-muted">
                  <FileText size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-text-h">
                    Scan ordonnance
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    {ordonnance.scanUrl || "Aucun scan enregistré"}
                  </p>
                </div>
              </div>

              {scanUrl && (
                <a
                  href={scanUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-text-muted transition hover:border-primary hover:text-primary"
                >
                  <ExternalLink size={15} />
                  Ouvrir
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
