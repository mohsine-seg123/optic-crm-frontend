import {
  CalendarDays,
  CreditCard,
  FileText,
  ReceiptText,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import type { Facture, FactureStatutRemboursement } from "../../../../interfaces/facture.types";

type Props = {
  facture: Facture;
  onClose: () => void;
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

function getStatusLabel(status: FactureStatutRemboursement): string {
  const labels: Record<FactureStatutRemboursement, string> = {
    en_attente: "En attente",
    rembourse: "Remboursé",
    partiel: "Partiel",
    refuse: "Refusé",
  };

  return labels[status] || status;
}

function getStatusClass(status: FactureStatutRemboursement): string {
  const classes: Record<FactureStatutRemboursement, string> = {
    en_attente: "bg-warning-bg text-warning",
    rembourse: "bg-success-bg text-success",
    partiel: "bg-primary-bg text-primary",
    refuse: "bg-danger-bg text-danger",
  };

  return classes[status] || "bg-bg-subtle text-text-muted";
}

export default function FactureDetailModal({
  facture,
  onClose,
}: Props): React.JSX.Element {
  const client = facture.vente?.client;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-text-h">
                Facture {facture.numeroFacture}
              </h3>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                  facture.statutRemboursement,
                )}`}
              >
                {getStatusLabel(facture.statutRemboursement)}
              </span>
            </div>

            <p className="mt-1 text-sm text-text-muted">
              Détail de la facture et du remboursement.
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

              <p className="text-xs text-text-muted">Date facture</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {formatDate(facture.dateFacture)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <UserRound size={17} />
              </div>

              <p className="text-xs text-text-muted">Client</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {client
                  ? `${client.nom} ${client.prenom}`
                  : `Client #${facture.vente?.clientId}`}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle/40 p-4">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-success-bg text-success">
                <CreditCard size={17} />
              </div>

              <p className="text-xs text-text-muted">Vente liée</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                Vente #{facture.venteId}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border">
            <div className="border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold text-text-h">
                Répartition du montant
              </h4>
            </div>

            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
              <div className="rounded-xl bg-bg-subtle px-4 py-3">
                <p className="text-xs text-text-muted">Montant total</p>
                <p className="mt-1 text-lg font-semibold text-text-h">
                  {formatPrice(facture.montantTotal)}
                </p>
              </div>

              <div className="rounded-xl bg-bg-subtle px-4 py-3">
                <p className="text-xs text-text-muted">Part patient</p>
                <p className="mt-1 text-lg font-semibold text-text-h">
                  {formatPrice(facture.partPatient)}
                </p>
              </div>

              <div className="rounded-xl bg-bg-subtle px-4 py-3">
                <p className="text-xs text-text-muted">Part mutuelle</p>
                <p className="mt-1 text-lg font-semibold text-text-h">
                  {formatPrice(facture.partMutuelle)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border">
            <div className="border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold text-text-h">Mutuelle</h4>
            </div>

            <div className="p-4">
              {facture.mutuelle ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-bg text-primary">
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-text-h">
                      {facture.mutuelle.nom}
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      Taux remboursement : {facture.mutuelle.tauxRemboursement}%
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      {facture.mutuelle.telephone ?? "Téléphone non défini"} ·{" "}
                      {facture.mutuelle.email ?? "Email non défini"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <FileText size={16} />
                  Facture sans mutuelle.
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-bg-subtle px-4 py-4">
            <div className="flex items-center gap-2">
              <ReceiptText size={18} className="text-primary" />
              <p className="text-sm font-medium text-text-h">
                Document généré à partir de la vente #{facture.venteId}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
