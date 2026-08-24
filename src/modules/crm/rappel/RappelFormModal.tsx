import { useState } from "react";
import { X, Bell, CalendarDays, Send, Loader2 } from "lucide-react";
import { createRappel } from "../../../services/rappelService";
import type { Rappel, RappelCanal, RappelType } from "../../../interfaces/rappel";



type Props = {
  clientId: number;
  clientName: string;
  onClose: () => void;
  onCreated?: (rappel: Rappel) => void;
};

type FormState = {
  typeRappel: RappelType;
  datePrevue: string;
  canal: RappelCanal;
};

const initialForm: FormState = {
  typeRappel: "controle_vue",
  datePrevue: "",
  canal: "sms",
};

export default function RappelFormModal({
  clientId,
  clientName,
  onClose,
  onCreated,
}: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>(initialForm);
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
      setError("La date du rappel est obligatoire.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const rappel = await createRappel({
        clientId,
        typeRappel: form.typeRappel,
        datePrevue: form.datePrevue,
        statut: "en_attente",
        canal: form.canal,
      });

      onCreated?.(rappel);
      onClose();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Impossible de créer le rappel.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-text-h">
              Nouveau rappel
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Créer un rappel pour {clientName}
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
                Type de rappel
              </label>

              <div className="relative">
                <Bell
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
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

            <div className="rounded-xl bg-bg-subtle p-4 text-sm text-text-muted">
              Le rappel sera créé avec le statut{" "}
              <span className="font-medium text-text-h">en attente</span>.
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
              {submitting ? "Création..." : "Créer le rappel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
