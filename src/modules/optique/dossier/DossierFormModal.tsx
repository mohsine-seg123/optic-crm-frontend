import { useState } from "react";
import { X, FileText, CalendarDays, Loader2, User } from "lucide-react";

import { createDossier } from "../../../services/dossierService";
import type { DossierOptique } from "../../../interfaces/dossier.types";

type Props = {
  clientId: number;
  clientName: string;
  onClose: () => void;
  onCreated: (dossier: DossierOptique) => void;
};

type FormState = {
  numeroDossier: string;
  dateCreation: string;
  dateDernierExamen: string;
  observations: string;
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function generateNumeroDossier(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100 + Math.random() * 900);

  return `DOS-${year}-${random}`;
}

export default function DossierFormModal({
  clientId,
  clientName,
  onClose,
  onCreated,
}: Props): React.JSX.Element {

    
  const [form, setForm] = useState<FormState>({
    numeroDossier: generateNumeroDossier(),
    dateCreation: getTodayDate(),
    dateDernierExamen: "",
    observations: "",
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
      const dossier = await createDossier({
        clientId,
        numeroDossier: form.numeroDossier.trim(),
        dateCreation: form.dateCreation,
        dateDernierExamen: form.dateDernierExamen || null,
        observations: form.observations.trim() || null,
      });

      onCreated(dossier);
      onClose();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Impossible de créer le dossier optique.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-text-h">
              Créer dossier optique
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Créer un dossier optique pour{" "}
              <span className="font-medium text-text-h">{clientName}</span>.
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

            {/* CLIENT */}
            <div className="rounded-xl border border-border bg-bg-subtle p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
                  <User size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-text-h">
                    {clientName}
                  </p>
                  <p className="text-xs text-text-muted">
                    Client ID : #{clientId}
                  </p>
                </div>
              </div>
            </div>

            {/* NUMERO DOSSIER */}
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
                  placeholder="DOS-2026-003"
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                />
              </div>

              <p className="mt-1 text-xs text-text-muted">
                Le numéro doit être unique.
              </p>
            </div>

            {/* DATE CREATION */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Date de création
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

            {/* DATE DERNIER EXAMEN */}
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

              <p className="mt-1 text-xs text-text-muted">
                Optionnel. Tu peux le remplir après la création d’un examen.
              </p>
            </div>

            {/* OBSERVATIONS */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Observations
              </label>

              <textarea
                name="observations"
                value={form.observations}
                onChange={handleChange}
                rows={4}
                placeholder="Exemple : première visite, client porte des lentilles, sensibilité à la lumière..."
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
              {submitting ? "Création..." : "Créer dossier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
