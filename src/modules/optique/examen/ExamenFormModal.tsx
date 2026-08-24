import { useState } from "react";
import { X, CalendarDays, Activity, Loader2, FileText } from "lucide-react";

import { createExamen } from "../../../services/examenService";
import type { ExamenVue } from "../../../interfaces/examen.types";

type Props = {
  dossierId: number;
  dossierNumero: string;
  clientName: string;
  onClose: () => void;
  onCreated: (examen: ExamenVue) => void;
};

type FormState = {
  dateExamen: string;

  sphereOd: string;
  cylindreOd: string;
  axeOd: string;
  additionOd: string;

  sphereOg: string;
  cylindreOg: string;
  axeOg: string;
  additionOg: string;
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const initialForm: FormState = {
  dateExamen: getTodayDate(),

  sphereOd: "0",
  cylindreOd: "0",
  axeOd: "0",
  additionOd: "0",

  sphereOg: "0",
  cylindreOg: "0",
  axeOg: "0",
  additionOg: "0",
};

function toNumber(value: string): number {
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
}

export default function ExamenFormModal({
  dossierId,
  dossierNumero,
  clientName,
  onClose,
  onCreated,
}: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const validateForm = (): boolean => {
    if (!form.dateExamen) {
      setError("La date d'examen est obligatoire.");
      return false;
    }

    const axeOd = Number(form.axeOd);
    const axeOg = Number(form.axeOg);

    if (axeOd < 0 || axeOd > 180) {
      setError("L'axe OD doit être entre 0 et 180.");
      return false;
    }

    if (axeOg < 0 || axeOg > 180) {
      setError("L'axe OG doit être entre 0 et 180.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const examen = await createExamen({
        dossierId,
        dateExamen: form.dateExamen,

        sphereOd: toNumber(form.sphereOd),
        cylindreOd: toNumber(form.cylindreOd),
        axeOd: Number(form.axeOd),
        additionOd: toNumber(form.additionOd),

        sphereOg: toNumber(form.sphereOg),
        cylindreOg: toNumber(form.cylindreOg),
        axeOg: Number(form.axeOg),
        additionOg: toNumber(form.additionOg),
      });

      onCreated(examen);
      onClose();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
          "Impossible de créer l'examen de vue.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-text-h">
              Nouvel examen de vue
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Ajouter un examen pour{" "}
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
          <div className="max-h-[75vh] overflow-y-auto px-6 py-5">
            {error && (
              <div className="mb-5 rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            <div className="mb-5 rounded-xl border border-border bg-bg-subtle p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
                  <FileText size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-text-h">
                    {dossierNumero}
                  </p>
                  <p className="text-xs text-text-muted">
                    Dossier ID : #{dossierId}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-text">
                Date de l'examen
              </label>

              <div className="relative max-w-sm">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />

                <input
                  type="date"
                  name="dateExamen"
                  value={form.dateExamen}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* OD */}
              <div className="rounded-2xl border border-border bg-bg p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-h">
                  <Activity size={16} />
                  Œil droit — OD
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Sphère OD
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      name="sphereOd"
                      value={form.sphereOd}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Cylindre OD
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      name="cylindreOd"
                      value={form.cylindreOd}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Axe OD
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      name="axeOd"
                      value={form.axeOd}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Addition OD
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      name="additionOd"
                      value={form.additionOd}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                    />
                  </div>
                </div>
              </div>

              {/* OG */}
              <div className="rounded-2xl border border-border bg-bg p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-h">
                  <Activity size={16} />
                  Œil gauche — OG
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Sphère OG
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      name="sphereOg"
                      value={form.sphereOg}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Cylindre OG
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      name="cylindreOg"
                      value={form.cylindreOg}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Axe OG
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      name="axeOg"
                      value={form.axeOg}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">
                      Addition OG
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      name="additionOg"
                      value={form.additionOg}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              {submitting ? "Création..." : "Créer examen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
