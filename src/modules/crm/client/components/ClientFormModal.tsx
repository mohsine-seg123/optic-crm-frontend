import { useEffect, useMemo, useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { createClient } from "../../../../services/clientService";
import mutuelleService from "../../../../services/mutuelleService";
import type { Client,FormState,Mutuelle } from "../client.types";

type Props = {
  onClose: () => void;
  onCreated: (client: Client) => void;
};



const initialForm: FormState = {
  nom: "",
  prenom: "",
  telephone: "",
  email: "",
  adresse: "",
  dateNaissance: "",
  mutuelleId: "",
};

function normalizeMutuelles(data: any): Mutuelle[] {
  return data?.data?.mutuelles || data?.mutuelles || data?.data || data || [];
}

function normalizeCreatedClient(data: any): Client {
  return data?.data?.client || data?.client || data?.data || data;
}

export default function ClientFormModal({
  onClose,
  onCreated,
}: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>(initialForm);
  const [mutuelles, setMutuelles] = useState<Mutuelle[]>([]);
  const [loadingMutuelles, setLoadingMutuelles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMutuelles = async () => {
      try {
        const mutuelles = await mutuelleService.getAllMutuelles();
        setMutuelles(normalizeMutuelles(mutuelles));
      } catch (error) {
        console.error(error);
        setMutuelles([]);
      } finally {
        setLoadingMutuelles(false);
      }
    };

    fetchMutuelles();
  }, []);

  const selectedMutuelle = useMemo(() => {
    if (!form.mutuelleId) return null;

    return mutuelles.find(
      (mutuelle) => mutuelle.id === Number(form.mutuelleId),
    );
  }, [form.mutuelleId, mutuelles]);



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


  const validateForm = (): boolean => {
    if (!form.nom.trim()) {
      setError("Le nom du client est obligatoire.");
      return false;
    }

    if (!form.prenom.trim()) {
      setError("Le prénom du client est obligatoire.");
      return false;
    }

    if (!form.telephone.trim()) {
      setError("Le téléphone du client est obligatoire.");
      return false;
    }

    if (!form.email.trim()) {
      setError("L'email du client est obligatoire.");
      return false;
    }

    if (!form.dateNaissance) {
      setError("La date de naissance est obligatoire.");
      return false;
    }

    return true;
  };


  function toDateInputValue(value: string | null | undefined): string {
    if (!value) return "";

    return value.includes("T") ? value.split("T")[0] : value;
  }




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim(),
        email: form.email.trim(),
        adresse: form.adresse.trim(),
        dateNaissance: form.dateNaissance,
        mutuelleId: form.mutuelleId ? Number(form.mutuelleId) : null,
      };

      const { data } = await createClient(payload);

      const createdClient = normalizeCreatedClient(data);

      onCreated(createdClient);
      onClose();
    } catch (error: unknown) {
      console.error(error);

      setError(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Impossible de créer le client. Vérifiez les informations.",
      );
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">

          <div>
            <h2 className="text-xl font-semibold text-text-h">
              Nouveau client
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Ajouter un client et lier sa mutuelle si elle existe.
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

        {/* BODY */}
        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
            {error && (
              <div className="mb-5 rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
                {error}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              {/* NOM */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Nom
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                  />

                  <input
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    placeholder="Benali"
                    className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-text-subtle focus:border-primary focus:ring-4 focus:ring-primary-bg"
                  />
                </div>
              </div>

              {/* PRENOM */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Prénom
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                  />

                  <input
                    name="prenom"
                    value={form.prenom}
                    onChange={handleChange}
                    placeholder="Ahmed"
                    className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-text-subtle focus:border-primary focus:ring-4 focus:ring-primary-bg"
                  />
                </div>
              </div>

              {/* TELEPHONE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Téléphone
                </label>

                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                  />

                  <input
                    name="telephone"
                    value={form.telephone}
                    onChange={handleChange}
                    placeholder="0612345678"
                    className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-text-subtle focus:border-primary focus:ring-4 focus:ring-primary-bg"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                  />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="client@email.com"
                    className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-text-subtle focus:border-primary focus:ring-4 focus:ring-primary-bg"
                  />
                </div>
              </div>

              {/* DATE NAISSANCE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Date de naissance
                </label>

                <input
                  type="date"
                  name="dateNaissance"
                  value={toDateInputValue(form.dateNaissance)}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className=" w-full rounded-xl border border-border bg-bg px-4  py-3 text-sm  text-text outline-none transition focus:border-primary focus:ring-4  focus:ring-primary-bg "
                />

                <p className="mt-1 text-xs text-text-muted">
                  Format accepté : jour / mois / année.
                </p>
              </div>

              {/* MUTUELLE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Mutuelle
                </label>

                <div className="relative">
                  <ShieldCheck
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle"
                  />

                  <select
                    name="mutuelleId"
                    value={form.mutuelleId}
                    onChange={handleChange}
                    disabled={loadingMutuelles}
                    className="w-full appearance-none rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-bg disabled:cursor-not-allowed disabled:bg-bg-subtle"
                  >
                    <option value="">
                      {loadingMutuelles
                        ? "Chargement des mutuelles..."
                        : "Aucune mutuelle"}
                    </option>

                    {mutuelles.map((mutuelle) => (
                      <option key={mutuelle.id} value={mutuelle.id}>
                        {mutuelle.nom} - {mutuelle.tauxRemboursement}%
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ADRESSE */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">
                  Adresse
                </label>

                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-3 top-3.5 text-text-subtle"
                  />

                  <input
                    name="adresse"
                    value={form.adresse}
                    onChange={handleChange}
                    placeholder="Fès, Maroc"
                    className="w-full rounded-xl border border-border bg-bg py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-text-subtle focus:border-primary focus:ring-4 focus:ring-primary-bg"
                  />
                </div>
              </div>
            </div>

            {/* MUTUELLE PREVIEW */}
            {selectedMutuelle && (
              <div className="mt-5 rounded-xl border border-primary/20 bg-primary-bg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg text-primary">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-text-h">
                      {selectedMutuelle.nom}
                    </p>

                    <p className="mt-1 text-sm text-text-muted">
                      Taux de remboursement :{" "}
                      <span className="font-medium text-primary">
                        {selectedMutuelle.tauxRemboursement}%
                      </span>
                    </p>

                    {(selectedMutuelle.telephone || selectedMutuelle.email) && (
                      <p className="mt-1 text-xs text-text-muted">
                        {selectedMutuelle.telephone || "—"} ·{" "}
                        {selectedMutuelle.email || "—"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 size={17} className="animate-spin" />}
              {submitting ? "Création..." : "Créer le client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
