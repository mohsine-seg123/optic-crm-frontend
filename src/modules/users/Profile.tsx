import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { UseAuth } from "../../context/AuthContext";
import { updateMe, changePassword } from "../../services/utilisateurService";

export default function Profile() {
  const { user } = UseAuth();

  // ==============================
  // Profile
  // ==============================

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // ==============================
  // Password
  // ==============================

  const [passwordForm, setPasswordForm] = useState({
    ancienMotDePasse: "",
    nouveauMotDePasse: "",
    confirmation: "",
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==============================
  // Initialiser les informations
  // ==============================

  useEffect(() => {
    if (user) {
      setForm({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      });
    }
  }, [user]);

  // ==============================
  // Modifier informations
  // ==============================

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setProfileSuccess("");
    setProfileError("");
    setProfileLoading(true);

    try {
      await updateMe({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
      });

      setProfileSuccess("Vos informations ont été mises à jour avec succès.");
    } catch (error: any) {
      console.error(error);

      setProfileError(
        error?.response?.data?.message ||
          "Impossible de modifier vos informations.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // ==============================
  // Modifier mot de passe
  // ==============================

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPasswordSuccess("");
    setPasswordError("");

    if (passwordForm.nouveauMotDePasse.length < 6) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 6 caractères.",
      );
      return;
    }

    if (passwordForm.nouveauMotDePasse !== passwordForm.confirmation) {
      setPasswordError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword({
        ancienMotDePasse: passwordForm.ancienMotDePasse,

        nouveauMotDePasse: passwordForm.nouveauMotDePasse,
      });

      setPasswordForm({
        ancienMotDePasse: "",
        nouveauMotDePasse: "",
        confirmation: "",
      });

      setPasswordSuccess("Votre mot de passe a été modifié avec succès.");
    } catch (error: any) {
      console.error(error);

      setPasswordError(
        error?.response?.data?.message ||
          "Impossible de modifier votre mot de passe.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==============================
  // Loading
  // ==============================

  if (!user) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-text-muted">Aucun utilisateur connecté.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-bg-subtle px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* =====================================
            HEADER
        ===================================== */}

        <div>
          <h1 className="text-2xl font-semibold text-text-h">Mon profil</h1>

          <p className="mt-1 text-sm text-text-muted">
            Consultez et gérez vos informations personnelles.
          </p>
        </div>

        {/* =====================================
            USER CARD
        ===================================== */}

        <div className="rounded-2xl border border-border bg-bg p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary-bg text-2xl font-semibold text-primary">
              {user.prenom.charAt(0).toUpperCase()}
              {user.nom.charAt(0).toUpperCase()}
            </div>

            {/* Informations */}

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-text-h">
                {user.prenom} {user.nom}
              </h2>

              <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
                <Mail size={15} />
                {user.email}
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-bg px-3 py-1.5 text-xs font-medium text-primary">
                <Shield size={14} />

                {user.role === "admin" ? "Administrateur" : "Vendeur"}
              </div>
            </div>
          </div>
        </div>

        {/* =====================================
            PERSONAL INFORMATION
        ===================================== */}

        <form
          onSubmit={handleProfileSubmit}
          className="overflow-hidden rounded-2xl border border-border bg-bg shadow-sm"
        >
          {/* Header */}

          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <User size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-text-h">
                  Informations personnelles
                </h2>

                <p className="mt-0.5 text-sm text-text-muted">
                  Modifiez les informations de votre compte.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* Nom */}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Nom
              </label>

              <input
                type="text"
                value={form.nom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nom: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text outline-none transition placeholder:text-text-subtle focus:border-primary focus:ring-4 focus:ring-primary/10"
                required
              />
            </div>

            {/* Prénom */}

            <div>
              <label className="mb-2 block text-sm font-medium text-text">
                Prénom
              </label>

              <input
                type="text"
                value={form.prenom}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prenom: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                required
              />
            </div>

            {/* Email */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-text">
                Adresse email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-11 pr-4 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Success */}

          {profileSuccess && (
            <div className="mx-6 mb-5 flex items-center gap-2 rounded-xl bg-success-bg px-4 py-3 text-sm text-success">
              <CheckCircle size={17} />
              {profileSuccess}
            </div>
          )}

          {/* Error */}

          {profileError && (
            <div className="mx-6 mb-5 flex items-center gap-2 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger">
              <AlertCircle size={17} />
              {profileError}
            </div>
          )}

          {/* Footer */}

          <div className="flex justify-end border-t border-border px-6 py-4">
            <button
              type="submit"
              disabled={profileLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />

              {profileLoading
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>
          </div>
        </form>

        {/* =====================================
            SECURITY
        ===================================== */}

        <form
          onSubmit={handlePasswordSubmit}
          className="overflow-hidden rounded-2xl border border-border bg-bg shadow-sm"
        >
          {/* Header */}

          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-bg text-primary">
                <Lock size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-text-h">Sécurité</h2>

                <p className="mt-0.5 text-sm text-text-muted">
                  Changez le mot de passe de votre compte.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            {/* Ancien mot de passe */}

            <PasswordField
              label="Ancien mot de passe"
              value={passwordForm.ancienMotDePasse}
              visible={showOldPassword}
              onToggle={() => setShowOldPassword(!showOldPassword)}
              onChange={(value) =>
                setPasswordForm({
                  ...passwordForm,
                  ancienMotDePasse: value,
                })
              }
            />

            {/* Nouveau mot de passe */}

            <PasswordField
              label="Nouveau mot de passe"
              value={passwordForm.nouveauMotDePasse}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
              onChange={(value) =>
                setPasswordForm({
                  ...passwordForm,
                  nouveauMotDePasse: value,
                })
              }
            />

            {/* Confirmation */}

            <PasswordField
              label="Confirmer le nouveau mot de passe"
              value={passwordForm.confirmation}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              onChange={(value) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmation: value,
                })
              }
            />

            <p className="text-xs text-text-muted">
              Le mot de passe doit contenir au minimum 6 caractères.
            </p>
          </div>

          {/* Success */}

          {passwordSuccess && (
            <div className="mx-6 mb-5 flex items-center gap-2 rounded-xl bg-success-bg px-4 py-3 text-sm text-success">
              <CheckCircle size={17} />
              {passwordSuccess}
            </div>
          )}

          {/* Error */}

          {passwordError && (
            <div className="mx-6 mb-5 flex items-center gap-2 rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger">
              <AlertCircle size={17} />
              {passwordError}
            </div>
          )}

          {/* Footer */}

          <div className="flex justify-end border-t border-border px-6 py-4">
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock size={17} />

              {passwordLoading ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// Password Field
// =====================================================

type PasswordFieldProps = {
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
};

function PasswordField({
  label,
  value,
  visible,
  onToggle,
  onChange,
}: PasswordFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">
        {label}
      </label>

      <div className="relative">
        <Lock
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />

        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg py-3 pl-11 pr-12 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          required
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-text-muted transition hover:bg-bg-subtle hover:text-text"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
