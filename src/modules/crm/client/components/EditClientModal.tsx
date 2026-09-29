import { useEffect, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { updateClient } from "../../../../services/clientService";
import type { Client } from "../client.types";

type Props = {
  client: Client;
  onClose: () => void;
  onUpdated: (client: Client) => void;
};

export default function EditClientModal({
  client,
  onClose,
  onUpdated,
}: Props): React.JSX.Element {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
    dateNaissance: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm({
      nom: client.nom ?? "",
      prenom: client.prenom ?? "",
      telephone: client.telephone ?? "",
      email: client.email ?? "",
      adresse: client.adresse ?? "",
      dateNaissance: client.dateNaissance
        ? new Date(client.dateNaissance).toISOString().split("T")[0]
        : "",
    });
  }, [client]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (
      !form.nom.trim() ||
      !form.prenom.trim() ||
      !form.telephone.trim() ||
      !form.email.trim()
    ) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await updateClient(client.id, {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim(),
        adresse: form.adresse.trim(),
        dateNaissance: form.dateNaissance || undefined,
      });

      const updatedClient = data.data.client;

      onUpdated(updatedClient);
      onClose();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message || "Impossible de modifier le client.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-bg shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-h">
              Modifier le client
            </h2>

            <p className="mt-1 text-sm text-text-muted">
              Modifier les informations de {client.prenom} {client.nom}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-bg-subtle hover:text-text-h"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* NOM / PRENOM */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Nom *
              </label>

              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-bg"
                placeholder="Nom"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text">
                Prénom *
              </label>

              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-bg"
                placeholder="Prénom"
              />
            </div>
          </div>

          {/* TELEPHONE */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Téléphone *
            </label>

            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-bg"
              placeholder="06XXXXXXXX"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Email *
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-bg"
              placeholder="client@email.com"
            />
          </div>

          {/* ADRESSE */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Adresse
            </label>

            <input
              name="adresse"
              value={form.adresse}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-bg"
              placeholder="Adresse du client"
            />
          </div>

          {/* DATE NAISSANCE */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text">
              Date de naissance
            </label>

            <input
              type="date"
              name="dateNaissance"
              value={form.dateNaissance}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary-bg"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text hover:bg-bg-subtle disabled:opacity-50"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
