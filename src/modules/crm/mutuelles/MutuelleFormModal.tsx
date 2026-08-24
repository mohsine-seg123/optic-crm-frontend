import { useState } from "react";
import { X } from "lucide-react";
import mutuelleService from "../../../services/mutuelleService";
import type { Mutuelle } from "../../../interfaces/Mutuelle";

type Props = {
  mutuelle: Mutuelle | null;
  onClose: () => void;
  onSaved: () => void;
};


export default function MutuelleFormModal({
  mutuelle,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!mutuelle;



  const [form, setForm] = useState({
    nom: mutuelle?.nom ?? "",
    tauxRemboursement: mutuelle?.tauxRemboursement ?? "",
    telephone: mutuelle?.telephone ?? "",
    email: mutuelle?.email ?? "",
  });


  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);



  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = "Le nom est obligatoire";
    const taux = Number(form.tauxRemboursement);
    if (!form.tauxRemboursement || isNaN(taux) || taux < 0 || taux > 100) {
      e.tauxRemboursement = "Taux invalide (0 à 100)";
    }
    if (!form.telephone.trim()) e.telephone = "Le téléphone est obligatoire";
    if (!form.email.trim()) e.email = "L'email est obligatoire";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit && mutuelle) {
        await mutuelleService.updateMutuelle(mutuelle.id, form);
      } else {
        await mutuelleService.createMutuelle(form);
      }
      onSaved();
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ?? "Une erreur est survenue, réessayez.",
      );
    } finally {
      setSaving(false);
    }
  };



  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg bg-bg border text-sm text-text outline-none transition-all ${
      errors[field]
        ? "border-danger focus:ring-4 focus:ring-danger-bg"
        : "border-border focus:border-primary-border focus:ring-4 focus:ring-primary-bg"
    }`;


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-bg rounded-xl shadow-xl ring-1 ring-black/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-h">
            {isEdit ? "Modifier la mutuelle" : "Nouvelle mutuelle"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-bg-subtle hover:text-text-h transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {apiError && (
            <div className="px-3.5 py-2.5 rounded-lg bg-danger-bg text-danger text-sm">
              {apiError}
            </div>
          )}
          

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Nom de la mutuelle
            </label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              placeholder="CNOPS, CNSS..."
              className={inputClass("nom")}
            />
            {errors.nom && (
              <p className="text-xs text-danger mt-1">{errors.nom}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Taux de remboursement (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.tauxRemboursement}
              onChange={(e) =>
                setForm({ ...form, tauxRemboursement: e.target.value })
              }
              placeholder="70"
              className={inputClass("tauxRemboursement")}
            />
            {errors.tauxRemboursement && (
              <p className="text-xs text-danger mt-1">
                {errors.tauxRemboursement}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Téléphone
            </label>
            <input
              type="text"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              placeholder="0535000000"
              className={inputClass("telephone")}
            />
            {errors.telephone && (
              <p className="text-xs text-danger mt-1">{errors.telephone}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contact@mutuelle.ma"
              className={inputClass("email")}
            />
            {errors.email && (
              <p className="text-xs text-danger mt-1">{errors.email}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-text hover:bg-bg-subtle transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
            >
              {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
