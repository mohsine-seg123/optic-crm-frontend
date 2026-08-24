import { useState } from "react";
import { Mail, ShieldCheck, UserRound, X } from "lucide-react";

import {
  createUtilisateur,
  updateUtilisateur,
} from "../../../services/utilisateurService";

import type {
  CreateUtilisateurDto,
  UserRole,
  Utilisateur,
} from "../../../interfaces/utilisateur.types";

type Props = {
  utilisateur?: Utilisateur | null;
  onClose: () => void;
  onSaved: (utilisateur: Utilisateur) => void;
};

type FormState = {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
};

function buildInitialForm(utilisateur?: Utilisateur | null): FormState {
  return {
    nom: utilisateur?.nom ?? "",
    prenom: utilisateur?.prenom ?? "",
    email: utilisateur?.email ?? "",
    motDePasse: "",
    role: utilisateur?.role ?? "vendeur",
  };
}

export default function UtilisateurFormModal({
  utilisateur,
  onClose,
  onSaved,
}: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialForm(utilisateur),
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(utilisateur);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!form.nom.trim()) {
      setError("Le nom est obligatoire.");
      return false;
    }

    if (!form.prenom.trim()) {
      setError("Le prénom est obligatoire.");
      return false;
    }

    if (!form.email.trim()) {
      setError("L'email est obligatoire.");
      return false;
    }

    if (!isEdit && !form.motDePasse.trim()) {
      setError("Le mot de passe est obligatoire.");
      return false;
    }

    if (!isEdit && form.motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }

    if (isEdit && form.motDePasse && form.motDePasse.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return false;
    }

    return true;
  };

  const buildPayload = (): CreateUtilisateurDto => {
    return {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim(),
      motDePasse: form.motDePasse.trim(),
      role: form.role,
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      if (utilisateur) {
        const payload = buildPayload();

        const updatedUtilisateur = await updateUtilisateur(utilisateur.id, {
          nom: payload.nom,
          prenom: payload.prenom,
          email: payload.email,
          role: payload.role,
          ...(payload.motDePasse ? { motDePasse: payload.motDePasse } : {}),
        });

        onSaved(updatedUtilisateur);
      } else {
        const createdUtilisateur = await createUtilisateur(buildPayload());
        onSaved(createdUtilisateur);
      }

      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde utilisateur:", error);
      setError(
        "Impossible de sauvegarder cet utilisateur. Vérifiez l'email ou les informations saisies.",
      );
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
              {isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Gérez les comptes admin et vendeur.
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

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Nom
              </label>

              <div className="relative">
                <UserRound
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  value={form.nom}
                  onChange={(event) => updateField("nom", event.target.value)}
                  placeholder="Benali"
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Prénom
              </label>

              <input
                value={form.prenom}
                onChange={(event) => updateField("prenom", event.target.value)}
                placeholder="Yassine"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-h">
              Email
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="yassine.benali@example.com"
                className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-h">
              {isEdit ? "Nouveau mot de passe" : "Mot de passe"}
            </label>

            <input
              type="password"
              value={form.motDePasse}
              onChange={(event) =>
                updateField("motDePasse", event.target.value)
              }
              placeholder={
                isEdit
                  ? "Laisser vide pour garder l'ancien mot de passe"
                  : "motdepasse123"
              }
              className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-h">
              Rôle
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateField("role", "admin")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  form.role === "admin"
                    ? "border-primary bg-primary-bg text-primary"
                    : "border-border bg-bg-subtle text-text-muted hover:border-primary hover:text-primary"
                }`}
              >
                <ShieldCheck size={16} />
                Admin
              </button>

              <button
                type="button"
                onClick={() => updateField("role", "vendeur")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  form.role === "vendeur"
                    ? "border-primary bg-primary-bg text-primary"
                    : "border-border bg-bg-subtle text-text-muted hover:border-primary hover:text-primary"
                }`}
              >
                <UserRound size={16} />
                Vendeur
              </button>
            </div>
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
              {submitting ? "Sauvegarde..." : isEdit ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
