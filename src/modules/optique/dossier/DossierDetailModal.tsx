import { useEffect, useState } from "react";
import {
  X,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  Activity,
  ClipboardList,
  Eye,
} from "lucide-react";

import { getDossierById } from "../../../services/dossierService";
import type { DossierOptique } from "../../../interfaces/dossier.types";

type Props = {
  dossierId: number;
  onClose: () => void;
};

function formatDate(date: string | null | undefined): string {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DossierDetailModal({
  dossierId,
  onClose,
}: Props): React.JSX.Element {
  const [dossier, setDossier] = useState<DossierOptique | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        const data = await getDossierById(dossierId);
        setDossier(data);
      } catch (error) {
        console.error(error);
        setDossier(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDossier();
  }, [dossierId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
        <div className="rounded-xl bg-bg px-6 py-4 text-sm text-text">
          Chargement du dossier...
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
        <div className="rounded-xl bg-bg px-6 py-4 text-sm text-danger">
          Impossible de charger le dossier.
        </div>
      </div>
    );
  }

  const lastExamen = dossier.examens?.[0];
  const examens = dossier.examens ?? [];
  const ordonnances = dossier.ordonnances ?? [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl">
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-bg text-primary">
              <FileText size={24} />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-text-h">
                {dossier.numeroDossier}
              </h2>

              <p className="mt-1 text-sm text-text-muted">
                Dossier optique complet du client.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted transition hover:bg-bg-subtle hover:text-text-h"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
          {/* STATS */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-bg-subtle p-4">
              <p className="text-sm text-text-muted">Date création</p>
              <p className="mt-2 text-lg font-semibold text-text-h">
                {formatDate(dossier.dateCreation)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle p-4">
              <p className="text-sm text-text-muted">Examens</p>
              <p className="mt-2 text-lg font-semibold text-text-h">
                {examens.length}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-bg-subtle p-4">
              <p className="text-sm text-text-muted">Ordonnances</p>
              <p className="mt-2 text-lg font-semibold text-text-h">
                {ordonnances.length}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* LEFT */}
            <div className="space-y-5">
              {/* CLIENT */}
              <div className="rounded-xl border border-border bg-bg p-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-h">
                  <User size={16} />
                  Client
                </h3>

                {dossier.client ? (
                  <div className="space-y-3 text-sm">
                    <p className="font-medium text-text-h">
                      {dossier.client.nom} {dossier.client.prenom}
                    </p>

                    <p className="flex items-center gap-2 text-text">
                      <Phone size={15} className="text-text-subtle" />
                      {dossier.client.telephone}
                    </p>

                    <p className="flex items-center gap-2 text-text">
                      <Mail size={15} className="text-text-subtle" />
                      {dossier.client.email || "—"}
                    </p>

                    <p className="flex items-start gap-2 text-text">
                      <MapPin size={15} className="mt-0.5 text-text-subtle" />
                      {dossier.client.adresse || "—"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Client non chargé.</p>
                )}
              </div>

              {/* INFOS DOSSIER */}
              <div className="rounded-xl border border-border bg-bg p-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-h">
                  <CalendarDays size={16} />
                  Informations dossier
                </h3>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-text-muted">Dernier examen</p>
                    <p className="font-medium text-text-h">
                      {formatDate(dossier.dateDernierExamen)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-muted">Observations</p>
                    <p className="mt-1 text-text">
                      {dossier.observations || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-5 lg:col-span-2">
              {/* DERNIER EXAMEN */}
              <div className="rounded-xl border border-border bg-bg p-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-h">
                  <Activity size={16} />
                  Dernier examen de vue
                </h3>

                {lastExamen ? (
                  <div>
                    <p className="mb-3 text-sm text-text-muted">
                      Date : {formatDate(lastExamen.dateExamen)}
                    </p>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="rounded-lg bg-bg-subtle p-3">
                        <p className="text-xs text-text-muted">OD Sphere</p>
                        <p className="font-semibold text-text-h">
                          {lastExamen.sphereOd}
                        </p>
                      </div>

                      <div className="rounded-lg bg-bg-subtle p-3">
                        <p className="text-xs text-text-muted">OD Cylindre</p>
                        <p className="font-semibold text-text-h">
                          {lastExamen.cylindreOd}
                        </p>
                      </div>

                      <div className="rounded-lg bg-bg-subtle p-3">
                        <p className="text-xs text-text-muted">OG Sphere</p>
                        <p className="font-semibold text-text-h">
                          {lastExamen.sphereOg}
                        </p>
                      </div>

                      <div className="rounded-lg bg-bg-subtle p-3">
                        <p className="text-xs text-text-muted">OG Cylindre</p>
                        <p className="font-semibold text-text-h">
                          {lastExamen.cylindreOg}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">
                    Aucun examen de vue enregistré.
                  </p>
                )}
              </div>

              {/* ORDONNANCES */}
              <div className="rounded-xl border border-border bg-bg p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-text-h">
                    <ClipboardList size={16} />
                    Ordonnances
                  </h3>

                  <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-xs text-text-muted">
                    {ordonnances.length}
                  </span>
                </div>

                {ordonnances.length > 0 ? (
                  <div className="space-y-3">
                    {ordonnances.map((ordonnance) => (
                      <div
                        key={ordonnance.id}
                        className="flex items-center justify-between rounded-xl border border-border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-h">
                            {ordonnance.medecin}
                          </p>

                          <p className="text-xs text-text-muted">
                            {formatDate(ordonnance.dateOrdonnance)} · expire le{" "}
                            {formatDate(ordonnance.dateExpiration)}
                          </p>
                        </div>

                        {ordonnance.scanUrl && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-primary-bg px-2.5 py-1 text-xs font-medium text-primary">
                            <Eye size={13} />
                            Scan
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">
                    Aucune ordonnance enregistrée.
                  </p>
                )}
              </div>

              {/* HISTORIQUE EXAMENS */}
              <div className="rounded-xl border border-border bg-bg p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-text-h">
                    <Activity size={16} />
                    Historique examens
                  </h3>

                  <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-xs text-text-muted">
                    {examens.length}
                  </span>
                </div>

                {examens.length > 0 ? (
                  <div className="space-y-3">
                    {examens.map((examen) => (
                      <div
                        key={examen.id}
                        className="rounded-xl border border-border p-3"
                      >
                        <p className="mb-2 text-sm font-medium text-text-h">
                          Examen du {formatDate(examen.dateExamen)}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
                          <span>OD Sphère : {examen.sphereOd}</span>
                          <span>OD Cyl. : {examen.cylindreOd}</span>
                          <span>OG Sphère : {examen.sphereOg}</span>
                          <span>OG Cyl. : {examen.cylindreOg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">
                    Aucun historique d’examens.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end border-t border-border bg-bg-subtle px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-bg px-4 py-2.5 text-sm font-medium text-text transition hover:bg-border"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
