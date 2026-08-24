import { useEffect, useState } from "react";
import { CalendarDays, FileText, Stethoscope, Upload, X } from "lucide-react";

import { createOrdonnance } from "../../../../services/ordonnanceService";
import { getAllDossiers } from "../../../../services/dossierService";

import type {
  CreateOrdonnanceDto,
  Ordonnance,
  OrdonnanceDossier,
} from "../../../../interfaces/ordonnance.types";

type Props = {
  dossierId?: number;
  dossierNumero?: string;
  clientName?: string;
  onClose: () => void;
  onCreated: (ordonnance: Ordonnance) => void;
};

type FormState = {
  dateOrdonnance: string;
  medecin: string;
  dateExpiration: string;
  scanUrl: string;
  dossierId: string;
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getDefaultExpirationDate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split("T")[0];
}

export default function OrdonnanceFormModal({
  dossierId,
  dossierNumero,
  clientName,
  onClose,
  onCreated,
}: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>({
    dateOrdonnance: getTodayDate(),
    medecin: "",
    dateExpiration: getDefaultExpirationDate(),
    scanUrl: "",
    dossierId: dossierId ? String(dossierId) : "",
  });

  const [dossiers, setDossiers] = useState<OrdonnanceDossier[]>([]);
  const [loadingDossiers, setLoadingDossiers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fixedDossier = Boolean(dossierId);

  useEffect(() => {
    if (fixedDossier) return;

    const fetchDossiers = async () => {
      try {
        setLoadingDossiers(true);

        const data = await getAllDossiers();

        setDossiers(data as OrdonnanceDossier[]);
      } catch (error) {
        console.error("Erreur chargement dossiers:", error);
        setDossiers([]);
      } finally {
        setLoadingDossiers(false);
      }
    };

    fetchDossiers();
  }, [fixedDossier]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!form.dateOrdonnance) {
      setError("La date d'ordonnance est obligatoire.");
      return false;
    }

    if (!form.medecin.trim()) {
      setError("Le médecin est obligatoire.");
      return false;
    }

    if (!form.dateExpiration) {
      setError("La date d'expiration est obligatoire.");
      return false;
    }

    if (!form.dossierId) {
      setError("Le dossier optique est obligatoire.");
      return false;
    }

    if (new Date(form.dateExpiration) <= new Date(form.dateOrdonnance)) {
      setError("La date d'expiration doit être après la date d'ordonnance.");
      return false;
    }

    return true;
  };

  const buildPayload = (): CreateOrdonnanceDto => {
    return {
      dateOrdonnance: form.dateOrdonnance,
      medecin: form.medecin.trim(),
      dateExpiration: form.dateExpiration,
      scanUrl: form.scanUrl.trim() || null,
      dossierId: Number(form.dossierId),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const createdOrdonnance = await createOrdonnance(buildPayload());

      onCreated(createdOrdonnance);
      onClose();
    } catch (error) {
      console.error("Erreur création ordonnance:", error);
      setError("Impossible de créer cette ordonnance.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              Nouvelle ordonnance
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Enregistrez une prescription médicale liée à un dossier optique.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition hover:bg-bg-subtle hover:text-text-h disabled:opacity-60"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {error && (
            <div className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          {fixedDossier && (
            <div className="rounded-2xl border border-border bg-bg-subtle/50 p-4">
              <p className="text-xs text-text-muted">Dossier optique</p>

              <p className="mt-1 text-sm font-semibold text-text-h">
                {dossierNumero ?? `Dossier #${dossierId}`}
              </p>

              {clientName && (
                <p className="mt-1 text-xs text-text-muted">
                  Client : {clientName}
                </p>
              )}
            </div>
          )}

          {!fixedDossier && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Dossier optique
              </label>

              <div className="relative">
                <FileText
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <select
                  value={form.dossierId}
                  onChange={(event) =>
                    updateField("dossierId", event.target.value)
                  }
                  disabled={loadingDossiers}
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition focus:border-primary"
                >
                  <option value="">Sélectionner un dossier</option>

                  {dossiers.map((dossier) => (
                    <option key={dossier.id} value={dossier.id}>
                      {dossier.numeroDossier} ·{" "}
                      {dossier.client
                        ? `${dossier.client.nom} ${dossier.client.prenom}`
                        : `Client #${dossier.clientId}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-h">
              Médecin
            </label>

            <div className="relative">
              <Stethoscope
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                value={form.medecin}
                onChange={(event) => updateField("medecin", event.target.value)}
                placeholder="Dr. Tazi Mohamed"
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Date ordonnance
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="date"
                  value={form.dateOrdonnance}
                  onChange={(event) =>
                    updateField("dateOrdonnance", event.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Date expiration
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="date"
                  value={form.dateExpiration}
                  onChange={(event) =>
                    updateField("dateExpiration", event.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-h">
              URL du scan
            </label>

            <div className="relative">
              <Upload
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                value={form.scanUrl}
                onChange={(event) => updateField("scanUrl", event.target.value)}
                placeholder="/uploads/ordonnances/ord_0021.jpg"
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <p className="mt-1 text-xs text-text-muted">
              Pour l’instant, on stocke uniquement l’URL du scan.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-bg-subtle disabled:opacity-60"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Création..." : "Créer l'ordonnance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
