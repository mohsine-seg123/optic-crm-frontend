import {
  UserRound,
  Phone,
  ShieldCheck,
  FileText,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import type { RecentClient } from "../../../interfaces/Dashbord.types";

type Props = {
  clients: RecentClient[];
};

function getInitials(nom: string, prenom: string): string {
  return `${nom?.[0] ?? ""}${prenom?.[0] ?? ""}`.toUpperCase();
}

function formatDate(date: string | null): string {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentClientsWidget({
  clients,
}: Props): React.JSX.Element {
  const visibleClients = clients.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-bg">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-base font-semibold text-text-h">
            Derniers clients
          </h3>

          <p className="mt-1 text-xs text-text-muted">
            Clients récemment ajoutés
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
          <UserRound size={18} />
        </div>
      </div>

      {/* CONTENT */}
      {visibleClients.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center px-5 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-bg-subtle text-text-muted">
            <UserRound size={21} />
          </div>

          <p className="text-sm font-medium text-text-h">Aucun client récent</p>

          <p className="mt-1 text-xs text-text-muted">
            Les nouveaux clients apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {visibleClients.map((client) => (
            <div
              key={client.id}
              className="group flex items-center gap-3 px-5 py-3 transition hover:bg-bg-subtle"
            >
              {/* AVATAR */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-bg text-xs font-semibold text-primary">
                {getInitials(client.nom, client.prenom)}
              </div>

              {/* MAIN INFO */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-text-h">
                    {client.nom} {client.prenom}
                  </p>

                  {client.mutuelle ? (
                    <span className="hidden items-center gap-1 rounded-full bg-primary-bg px-2 py-0.5 text-[11px] font-medium text-primary sm:inline-flex">
                      <ShieldCheck size={11} />
                      {client.mutuelle.nom}
                    </span>
                  ) : (
                    <span className="hidden rounded-full bg-bg-subtle px-2 py-0.5 text-[11px] font-medium text-text-muted sm:inline-flex">
                      Sans mutuelle
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} />
                    {client.telephone}
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {client.adresse || "Adresse non définie"}
                  </span>
                </div>
              </div>

              {/* DOSSIER */}
              <div className="hidden min-w-[140px] text-right md:block">
                {client.dossier ? (
                  <>
                    <p className="inline-flex items-center justify-end gap-1 text-xs font-medium text-text-h">
                      <FileText size={13} className="text-primary" />
                      {client.dossier.numeroDossier}
                    </p>

                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {formatDate(client.dossier.dateCreation)}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-text-muted">Pas de dossier</p>
                )}
              </div>

              {/* ACTION */}
              <button
                type="button"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-subtle transition group-hover:bg-bg group-hover:text-primary"
                title="Voir client"
              >
                <ArrowUpRight size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      {clients.length > 5 && (
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            className="text-sm font-medium text-primary transition hover:text-primary-hover"
          >
            Voir tous les clients
          </button>
        </div>
      )}
    </div>
  );
}
