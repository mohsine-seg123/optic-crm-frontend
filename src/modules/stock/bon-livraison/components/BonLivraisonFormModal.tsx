import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Package, Plus, Trash2, Truck, X } from "lucide-react";

import { createBonLivraison } from "../../../../services/bonLivraisonService";
import { getAllFournisseurs } from "../../../../services/fournisseurService";
import { getAllProduits } from "../../../../services/produitService";


import type {
  BonLivraison,
  CreateBonLivraisonDto,
} from "../../../../interfaces/bonLivraison.types";


type FournisseurOption = {
  id: number;
  nom: string;
};

type ProduitOption = {
  id: number;
  designation: string;
  marque: string;
  modele: string;
  codeBarre: string;
  prixAchat: string | number;
  stockActuel: number;
};

type LigneForm = {
  produitId: string;
  quantite: string;
  prixAchat: string;
};

type Props = {
  onClose: () => void;
  onCreated: (bon: BonLivraison) => void;
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function generateNumeroBon(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100 + Math.random() * 900);
  return `BL-${year}-${random}`;
}

const emptyLine: LigneForm = {
  produitId: "",
  quantite: "1",
  prixAchat: "",
};

export default function BonLivraisonFormModal({
  onClose,
  onCreated,
}: Props): React.JSX.Element {
  const [numeroBon, setNumeroBon] = useState(generateNumeroBon());
  const [dateReception, setDateReception] = useState(getTodayDate());
  const [fournisseurId, setFournisseurId] = useState("");

  const [lignes, setLignes] = useState<LigneForm[]>([{ ...emptyLine }]);

  const [fournisseurs, setFournisseurs] = useState<FournisseurOption[]>([]);
  const [produits, setProduits] = useState<ProduitOption[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalQuantite = useMemo(() => {
    return lignes.reduce((sum, ligne) => sum + Number(ligne.quantite || 0), 0);
  }, [lignes]);

  const totalAchat = useMemo(() => {
    return lignes.reduce((sum, ligne) => {
      return sum + Number(ligne.quantite || 0) * Number(ligne.prixAchat || 0);
    }, 0);
  }, [lignes]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        const [fournisseursData, produitsData] = await Promise.all([
          getAllFournisseurs(),
          getAllProduits(),
        ]);

        setFournisseurs(fournisseursData);
        setProduits(produitsData);
      } catch (error) {
        console.error("Erreur chargement options bon livraison:", error);
        setError("Impossible de charger les fournisseurs ou les produits.");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const updateLine = (index: number, field: keyof LigneForm, value: string) => {
    setLignes((prev) =>
      prev.map((ligne, lineIndex) =>
        lineIndex === index ? { ...ligne, [field]: value } : ligne,
      ),
    );
  };

  const handleProductChange = (index: number, produitId: string) => {
    const produit = produits.find((item) => item.id === Number(produitId));

    setLignes((prev) =>
      prev.map((ligne, lineIndex) => {
        if (lineIndex !== index) return ligne;

        return {
          ...ligne,
          produitId,
          prixAchat: produit ? String(produit.prixAchat) : ligne.prixAchat,
        };
      }),
    );
  };

  const addLine = () => {
    setLignes((prev) => [...prev, { ...emptyLine }]);
  };

  const removeLine = (index: number) => {
    if (lignes.length === 1) {
      setError("Le bon doit contenir au moins une ligne.");
      return;
    }

    setLignes((prev) => prev.filter((_, lineIndex) => lineIndex !== index));
  };

  const validateForm = (): boolean => {
    if (!numeroBon.trim()) {
      setError("Le numéro du bon est obligatoire.");
      return false;
    }

    if (!dateReception) {
      setError("La date de réception est obligatoire.");
      return false;
    }

    if (!fournisseurId) {
      setError("Le fournisseur est obligatoire.");
      return false;
    }

    if (lignes.length === 0) {
      setError("Ajoutez au moins un produit au bon.");
      return false;
    }

    for (const [index, ligne] of lignes.entries()) {
      if (!ligne.produitId) {
        setError(
          `Veuillez sélectionner un produit dans la ligne ${index + 1}.`,
        );
        return false;
      }

      if (!ligne.quantite || Number(ligne.quantite) <= 0) {
        setError(`La quantité de la ligne ${index + 1} est invalide.`);
        return false;
      }

      if (!ligne.prixAchat || Number(ligne.prixAchat) < 0) {
        setError(`Le prix d'achat de la ligne ${index + 1} est invalide.`);
        return false;
      }
    }

    return true;
  };

  const buildPayload = (): CreateBonLivraisonDto => {
    return {
      numeroBon: numeroBon.trim(),
      dateReception,
      fournisseurId: Number(fournisseurId),
      lignes: lignes.map((ligne) => ({
        produitId: Number(ligne.produitId),
        quantite: Number(ligne.quantite),
        prixAchat: Number(ligne.prixAchat),
      })),
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = buildPayload();
      const createdBon = await createBonLivraison(payload);

      onCreated(createdBon);
      onClose();
    } catch (error) {
      console.error("Erreur création bon livraison:", error);
      setError(
        "Impossible de créer ce bon de livraison. Vérifiez le numéro du bon et les produits sélectionnés.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              Nouveau bon de livraison
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Enregistrez une réception de stock depuis un fournisseur.
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
          className="max-h-[78vh] overflow-y-auto p-5"
        >
          {error && (
            <div className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Numéro du bon
              </label>

              <input
                value={numeroBon}
                onChange={(event) => setNumeroBon(event.target.value)}
                placeholder="BL-001"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Date réception
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="date"
                  value={dateReception}
                  onChange={(event) => setDateReception(event.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Fournisseur
              </label>

              <div className="relative">
                <Truck
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <select
                  value={fournisseurId}
                  onChange={(event) => setFournisseurId(event.target.value)}
                  disabled={loadingOptions}
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
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
          </div>

          <div className="mt-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h4 className="text-sm font-semibold text-text-h">
                  Produits reçus
                </h4>

                <p className="mt-0.5 text-xs text-text-muted">
                  Ajoutez les produits, quantités et prix d’achat.
                </p>
              </div>

              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-text-h transition hover:border-primary hover:text-primary"
              >
                <Plus size={15} />
                Ajouter une ligne
              </button>
            </div>

            <div className="divide-y divide-border">
              {lignes.map((ligne, index) => {
                const selectedProduit = produits.find(
                  (produit) => produit.id === Number(ligne.produitId),
                );

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1fr_130px_150px_44px]"
                  >
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        Produit
                      </label>

                      <div className="relative">
                        <Package
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                        />

                        <select
                          value={ligne.produitId}
                          onChange={(event) =>
                            handleProductChange(index, event.target.value)
                          }
                          disabled={loadingOptions}
                          className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                        >
                          <option value="">Sélectionner un produit</option>
                          {produits.map((produit) => (
                            <option key={produit.id} value={produit.id}>
                              {produit.designation} · {produit.marque} ·{" "}
                              {produit.codeBarre}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedProduit && (
                        <p className="mt-1 text-xs text-text-muted">
                          Stock actuel : {selectedProduit.stockActuel}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        Quantité
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={ligne.quantite}
                        onChange={(event) =>
                          updateLine(index, "quantite", event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        Prix achat
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ligne.prixAchat}
                        onChange={(event) =>
                          updateLine(index, "prixAchat", event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-muted transition hover:border-danger hover:text-danger"
                        title="Supprimer la ligne"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-bg-subtle px-4 py-3">
              <p className="text-xs text-text-muted">Quantité totale</p>
              <p className="mt-1 text-lg font-semibold text-text-h">
                {totalQuantite} unité{totalQuantite > 1 ? "s" : ""}
              </p>
            </div>

            <div className="rounded-xl bg-bg-subtle px-4 py-3">
              <p className="text-xs text-text-muted">Montant achat total</p>
              <p className="mt-1 text-lg font-semibold text-text-h">
                {totalAchat.toLocaleString("fr-FR")} DH
              </p>
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
              disabled={submitting || loadingOptions}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enregistrement..." : "Enregistrer le bon"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
