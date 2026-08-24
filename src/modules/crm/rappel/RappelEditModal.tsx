import { useState } from "react";
import { Bell, CalendarDays, Loader2, Send, X } from "lucide-react";

import { updateRappel } from "../../../services/rappelService";
import type {
  Rappel,
  RappelCanal,
  RappelStatut,
  RappelType,
} from "../../../interfaces/rappel";

type Props = {
  rappel: Rappel;
  onClose: () => void;
  onUpdated: (rappel: Rappel) => void;
};

type FormState = {
  typeRappel: RappelType;
  datePrevue: string;
  statut: RappelStatut;
  canal: RappelCanal;
};

function toDateInputValue(value: string): string {
  if (!value) return "";
  return value.includes("T") ? value.split("T")[0] : value;
}

export default function RappelEditModal({
  rappel,
  onClose,
  onUpdated,
}: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>({
    typeRappel: rappel.typeRappel,
    datePrevue: toDateInputValue(rappel.datePrevue),
    statut: rappel.statut,
    canal: rappel.canal,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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

    if (!form.datePrevue) {
      setError("La date prévue est obligatoire.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const updatedRappel = await updateRappel(rappel.id, {
        typeRappel: form.typeRappel,
        datePrevue: form.datePrevue,
        statut: form.statut,
        canal: form.canal,
      });

      onUpdated(updatedRappel);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Impossible de modifier ce rappel.",
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
              Modifier le rappel
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Modifier le type, la date, le canal ou le statut du rappel.
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

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {error && (
              <div className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Type de rappel
              </label>

              <div className="relative">
                <Bell
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />

                <select
                  name="typeRappel"
                  value={form.typeRappel}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                >
                  <option value="controle_vue">Contrôle de vue</option>
                  <option value="renouvellement_lunettes">
                    Renouvellement lunettes
                  </option>
                  <option value="recuperation_commande">
                    Récupération commande
                  </option>
                  <option value="paiement">Paiement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Date prévue
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />

                <input
                  type="date"
                  name="datePrevue"
                  value={form.datePrevue}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Canal
              </label>

              <div className="relative">
                <Send
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                />

                <select
                  name="canal"
                  value={form.canal}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
                >
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="appel">Appel</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Statut
              </label>

              <select
                name="statut"
                value={form.statut}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg"
              >
                <option value="en_attente">En attente</option>
                <option value="envoye">Envoyé</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
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
