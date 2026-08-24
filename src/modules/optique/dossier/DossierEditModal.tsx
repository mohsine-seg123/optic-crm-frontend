import { useState } from "react";
import { X, Loader2, FileText, CalendarDays } from "lucide-react";

import { updateDossier } from "../../../services/dossierService";

import type { DossierOptique, UpdateDossierDto } from "../../../interfaces/dossier.types";


type Props = {
  dossier: DossierOptique;
  onClose: () => void;
  onUpdated: (dossier: DossierOptique) => void;
};


type FormState = {
  numeroDossier: string;
  dateCreation: string;
  dateDernierExamen: string;
  observations: string;
};

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.includes("T") ? value.split("T")[0] : value;
}

export default function DossierEditModal({
  dossier,
  onClose,
  onUpdated,
}: Props): React.JSX.Element {

  const [form, setForm] = useState<FormState>({
    numeroDossier: dossier.numeroDossier,
    dateCreation: toDateInputValue(dossier.dateCreation),
    dateDernierExamen: toDateInputValue(dossier.dateDernierExamen),
    observations: dossier.observations || "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.numeroDossier.trim()) {
      setError("Le numéro de dossier est obligatoire.");
      return;
    }

    if (!form.dateCreation) {
      setError("La date de création est obligatoire.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload: UpdateDossierDto = {
        numeroDossier: form.numeroDossier.trim(),
        dateCreation: form.dateCreation,
        dateDernierExamen: form.dateDernierExamen || null,
        observations: form.observations.trim() || null,
      };

      const updatedDossier = await updateDossier(dossier.id, payload);

      onUpdated(updatedDossier);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Impossible de modifier le dossier.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-text-h">
              Modifier dossier optique
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Modifier les informations générales du dossier.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-2 text-text-muted transition hover:bg-bg-subtle hover:text-text-h disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {error && (
              <div className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Numéro dossier
              </label>

              <div className="relative">
                <FileText
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />

                <input
                  name="numeroDossier"
                  value={form.numeroDossier}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Date création
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />

                <input
                  type="date"
                  name="dateCreation"
                  value={form.dateCreation}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Date dernier examen
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />

                <input
                  type="date"
                  name="dateDernierExamen"
                  value={form.dateDernierExamen}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Observations
              </label>

              <textarea
                name="observations"
                value={form.observations}
                onChange={handleChange}
                rows={4}
                placeholder="Observations générales sur le dossier optique..."
                className="w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex items-center justify-end gap-3 border-t border-border bg-bg-subtle px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-text transition hover:bg-bg disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting && <Loader2 size={17} className="animate-spin" />}
              {submitting ? "Modification..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
