import { useState } from "react";
import { X } from "lucide-react";

import {
  createFournisseur,
  updateFournisseur,
} from "../../../../services/fournisseurService";

import type { Fournisseur, CreateFournisseurDto } from "../../../../interfaces/fournisseur.types";

type Props = {
  fournisseur?: Fournisseur | null;
  onClose: () => void;
  onSaved: (fournisseur: Fournisseur) => void;
};

type FormState = {
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
};

const initialForm: FormState = {
  nom: "",
  telephone: "",
  email: "",
  adresse: "",
};

function buildInitialForm(fournisseur?: Fournisseur | null): FormState {
  if (!fournisseur) return initialForm;

  return {
    nom: fournisseur.nom ?? "",
    telephone: fournisseur.telephone ?? "",
    email: fournisseur.email ?? "",
    adresse: fournisseur.adresse ?? "",
  };
}

export default function FournisseurFormModal({
  fournisseur,
  onClose,
  onSaved,
}: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(fournisseur),
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(fournisseur);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!form.nom.trim()) {
      setError("Le nom du fournisseur est obligatoire.");
      return false;
    }

    if (!form.telephone.trim()) {
      setError("Le téléphone est obligatoire.");
      return false;
    }

    if (!form.email.trim()) {
      setError("L'email est obligatoire.");
      return false;
    }

    if (!form.adresse.trim()) {
      setError("L'adresse est obligatoire.");
      return false;
    }

    return true;
  };

  const buildPayload = (): CreateFournisseurDto => {
    return {
      nom: form.nom.trim(),
      telephone: form.telephone.trim(),
      email: form.email.trim(),
      adresse: form.adresse.trim(),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = buildPayload();

      const savedFournisseur = fournisseur
        ? await updateFournisseur(fournisseur.id, payload)
        : await createFournisseur(payload);

      onSaved({
        ...savedFournisseur,
        produits: savedFournisseur.produits ?? fournisseur?.produits ?? [],
      });

      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde fournisseur:", error);
      setError("Impossible de sauvegarder ce fournisseur.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              {isEdit ? "Modifier le fournisseur" : "Nouveau fournisseur"}
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Renseignez les informations du fournisseur.
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

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-h">
              Nom du fournisseur
            </label>

            <input
              value={form.nom}
              onChange={(event) => updateField("nom", event.target.value)}
              placeholder="OptiVision Supplier"
              className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Téléphone
              </label>

              <input
                value={form.telephone}
                onChange={(event) =>
                  updateField("telephone", event.target.value)
                }
                placeholder="0600000001"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="contact@optivision.com"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-h">
              Adresse
            </label>

            <textarea
              value={form.adresse}
              onChange={(event) => updateField("adresse", event.target.value)}
              placeholder="Casablanca, Maroc"
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-bg-subtle hover:text-text-h"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sauvegarde..." : isEdit ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
