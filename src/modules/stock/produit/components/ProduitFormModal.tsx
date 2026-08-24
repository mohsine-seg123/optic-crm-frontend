import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  createProduit,
  updateProduit,
} from "../../../../services/produitService";

import { getAllCategories } from "../../../../services/categorieService";
import { getAllFournisseurs } from "../../../../services/fournisseurService";

import type { Produit, CreateProduitDto } from "../../../../interfaces/produit.types";

type CategorieOption = {
  id: number;
  libelle: string;
};

type FournisseurOption = {
  id: number;
  nom: string;
};

type Props = {
  produit?: Produit | null;
  onClose: () => void;
  onSaved: (produit: Produit) => void;
};

type FormState = {
  designation: string;
  marque: string;
  modele: string;
  couleur: string;
  traitement: string;
  indice: string;
  codeBarre: string;
  prixAchat: string;
  prixVente: string;
  stockActuel: string;
  stockMinimum: string;
  imageUrl: string;
  categorieId: string;
  fournisseurId: string;
};

const initialForm: FormState = {
  designation: "",
  marque: "",
  modele: "",
  couleur: "",
  traitement: "",
  indice: "",
  codeBarre: "",
  prixAchat: "",
  prixVente: "",
  stockActuel: "",
  stockMinimum: "",
  imageUrl: "",
  categorieId: "",
  fournisseurId: "",
};

function buildInitialForm(produit?: Produit | null): FormState {
  if (!produit) return initialForm;

  return {
    designation: produit.designation ?? "",
    marque: produit.marque ?? "",
    modele: produit.modele ?? "",
    couleur: produit.couleur ?? "",
    traitement: produit.traitement ?? "",
    indice: produit.indice ? String(produit.indice) : "",
    codeBarre: produit.codeBarre ?? "",
    prixAchat: String(produit.prixAchat ?? ""),
    prixVente: String(produit.prixVente ?? ""),
    stockActuel: String(produit.stockActuel ?? ""),
    stockMinimum: String(produit.stockMinimum ?? ""),
    imageUrl: produit.imageUrl ?? "",
    categorieId: String(produit.categorieId ?? ""),
    fournisseurId: String(produit.fournisseurId ?? ""),
  };
}

export default function ProduitFormModal({
  produit,
  onClose,
  onSaved,
}: Props): React.JSX.Element {
  const [form, setForm] = useState<FormState>(() => buildInitialForm(produit));
  const [categories, setCategories] = useState<CategorieOption[]>([]);
  const [fournisseurs, setFournisseurs] = useState<FournisseurOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(produit);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        const [categoriesData, fournisseursData] = await Promise.all([
          getAllCategories(),
          getAllFournisseurs(),
        ]);

        setCategories(categoriesData);
        setFournisseurs(fournisseursData);
      } catch (error) {
        console.error("Erreur chargement options produit:", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!form.designation.trim()) {
      setError("La désignation est obligatoire.");
      return false;
    }

    if (!form.marque.trim()) {
      setError("La marque est obligatoire.");
      return false;
    }

    if (!form.modele.trim()) {
      setError("Le modèle est obligatoire.");
      return false;
    }

    if (!form.codeBarre.trim()) {
      setError("Le code-barres est obligatoire.");
      return false;
    }

    if (!form.prixAchat || Number(form.prixAchat) < 0) {
      setError("Le prix d'achat est invalide.");
      return false;
    }

    if (!form.prixVente || Number(form.prixVente) < 0) {
      setError("Le prix de vente est invalide.");
      return false;
    }

    if (!form.stockActuel || Number(form.stockActuel) < 0) {
      setError("Le stock actuel est invalide.");
      return false;
    }

    if (!form.stockMinimum || Number(form.stockMinimum) < 0) {
      setError("Le stock minimum est invalide.");
      return false;
    }

    if (!form.categorieId) {
      setError("La catégorie est obligatoire.");
      return false;
    }

    if (!form.fournisseurId) {
      setError("Le fournisseur est obligatoire.");
      return false;
    }

    return true;
  };

  const buildPayload = (): CreateProduitDto => {
    return {
      designation: form.designation.trim(),
      marque: form.marque.trim(),
      modele: form.modele.trim(),
      couleur: form.couleur.trim() || null,
      traitement: form.traitement.trim() || null,
      indice: form.indice ? Number(form.indice) : null,
      codeBarre: form.codeBarre.trim(),
      prixAchat: Number(form.prixAchat),
      prixVente: Number(form.prixVente),
      stockActuel: Number(form.stockActuel),
      stockMinimum: Number(form.stockMinimum),
      imageUrl: form.imageUrl.trim() || null,
      categorieId: Number(form.categorieId),
      fournisseurId: Number(form.fournisseurId),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = buildPayload();

      const savedProduit = produit
        ? await updateProduit(produit.id, payload)
        : await createProduit(payload);

      onSaved(savedProduit);
      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde produit:", error);
      setError(
        "Impossible de sauvegarder ce produit. Vérifiez le code-barres ou les données saisies.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              {isEdit ? "Modifier le produit" : "Nouveau produit"}
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Renseignez les informations du produit.
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

        <form
          onSubmit={handleSubmit}
          className="max-h-[75vh] overflow-y-auto p-5"
        >
          {error && (
            <div className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Désignation
              </label>
              <input
                value={form.designation}
                onChange={(e) => updateField("designation", e.target.value)}
                placeholder="RayBan Classic"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Marque
              </label>
              <input
                value={form.marque}
                onChange={(e) => updateField("marque", e.target.value)}
                placeholder="RayBan"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Modèle
              </label>
              <input
                value={form.modele}
                onChange={(e) => updateField("modele", e.target.value)}
                placeholder="RB3025"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Code-barres
              </label>
              <input
                value={form.codeBarre}
                onChange={(e) => updateField("codeBarre", e.target.value)}
                placeholder="123456789"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Couleur
              </label>
              <input
                value={form.couleur}
                onChange={(e) => updateField("couleur", e.target.value)}
                placeholder="Noir"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Traitement
              </label>
              <input
                value={form.traitement}
                onChange={(e) => updateField("traitement", e.target.value)}
                placeholder="Anti-reflet"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Indice
              </label>
              <input
                type="number"
                step="0.01"
                value={form.indice}
                onChange={(e) => updateField("indice", e.target.value)}
                placeholder="1.5"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Image URL
              </label>
              <input
                value={form.imageUrl}
                onChange={(e) => updateField("imageUrl", e.target.value)}
                placeholder="/uploads/produits/image.jpg"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Prix d'achat
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.prixAchat}
                onChange={(e) => updateField("prixAchat", e.target.value)}
                placeholder="500"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Prix de vente
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.prixVente}
                onChange={(e) => updateField("prixVente", e.target.value)}
                placeholder="900"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Stock actuel
              </label>
              <input
                type="number"
                min="0"
                value={form.stockActuel}
                onChange={(e) => updateField("stockActuel", e.target.value)}
                placeholder="10"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Stock minimum
              </label>
              <input
                type="number"
                min="0"
                value={form.stockMinimum}
                onChange={(e) => updateField("stockMinimum", e.target.value)}
                placeholder="2"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Catégorie
              </label>
              <select
                value={form.categorieId}
                onChange={(e) => updateField("categorieId", e.target.value)}
                disabled={loadingOptions}
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((categorie) => (
                  <option key={categorie.id} value={categorie.id}>
                    {categorie.libelle}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Fournisseur
              </label>
              <select
                value={form.fournisseurId}
                onChange={(e) => updateField("fournisseurId", e.target.value)}
                disabled={loadingOptions}
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="">Sélectionner un fournisseur</option>
                {fournisseurs.map((fournisseur) => (
                  <option key={fournisseur.id} value={fournisseur.id}>
                    {fournisseur.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-bg-subtle"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting ? "Sauvegarde..." : isEdit ? "Modifier" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
