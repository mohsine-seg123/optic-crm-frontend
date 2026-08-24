import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  Package,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import { createDevis, updateDevis } from "../../../../services/devisService";
import { getAllClients } from "../../../../services/clientService";
import { getAllProduits } from "../../../../services/produitService";
import { UseAuth } from "../../../../context/AuthContext";

import type {
  CreateDevisDto,
  Devis,
  DevisClient,
  DevisProduit,
  DevisStatut,
} from "../../../../interfaces/devis.types";

type Props = {
  devis?: Devis | null;
  onClose: () => void;
  onSaved: (devis: Devis) => void;
};

type LigneForm = {
  produitId: string;
  quantite: string;
  prixUnitaire: string;
  remise: string;
};

type FormState = {
  dateDevis: string;
  clientId: string;
  statut: DevisStatut;
  lignes: LigneForm[];
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function toDateInputValue(date: string | null | undefined): string {
  if (!date) return getTodayDate();
  return date.includes("T") ? date.split("T")[0] : date;
}

function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR")} DH`;
}

const emptyLine: LigneForm = {
  produitId: "",
  quantite: "1",
  prixUnitaire: "",
  remise: "0",
};

function buildInitialForm(devis?: Devis | null): FormState {
  if (!devis) {
    return {
      dateDevis: getTodayDate(),
      clientId: "",
      statut: "en_attente",
      lignes: [{ ...emptyLine }],
    };
  }

  return {
    dateDevis: toDateInputValue(devis.dateDevis),
    clientId: String(devis.clientId ?? ""),
    statut: devis.statut ?? "en_attente",
    lignes:
      devis.lignes && devis.lignes.length > 0
        ? devis.lignes.map((ligne) => ({
            produitId: String(ligne.produitId),
            quantite: String(ligne.quantite),
            prixUnitaire: String(ligne.prixUnitaire),
            remise: String(ligne.remise ?? 0),
          }))
        : [{ ...emptyLine }],
  };
}

export default function DevisFormModal({
  devis,
  onClose,
  onSaved,
}: Props): React.JSX.Element {
  const { user } = UseAuth();

  const [form, setForm] = useState<FormState>(() => buildInitialForm(devis));
  const [clients, setClients] = useState<DevisClient[]>([]);
  const [produits, setProduits] = useState<DevisProduit[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(devis);

  const montantTotal = useMemo(() => {
    return form.lignes.reduce((sum, ligne) => {
      const quantite = Number(ligne.quantite || 0);
      const prixUnitaire = Number(ligne.prixUnitaire || 0);
      const remise = Number(ligne.remise || 0);

      return sum + quantite * prixUnitaire - remise;
    }, 0);
  }, [form.lignes]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        const [clientsResponse, produitsData] = await Promise.all([
          getAllClients(),
          getAllProduits(),
        ]);

        setClients(clientsResponse.data?.data?.clients ?? []);
        setProduits(produitsData);
      } catch (error) {
        console.error("Erreur chargement options devis:", error);
        setError("Impossible de charger les clients ou les produits.");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateLine = (index: number, field: keyof LigneForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      lignes: prev.lignes.map((ligne, lineIndex) =>
        lineIndex === index ? { ...ligne, [field]: value } : ligne,
      ),
    }));
  };

  const handleProductChange = (index: number, produitId: string) => {
    const produit = produits.find((item) => item.id === Number(produitId));

    setForm((prev) => ({
      ...prev,
      lignes: prev.lignes.map((ligne, lineIndex) => {
        if (lineIndex !== index) return ligne;

        return {
          ...ligne,
          produitId,
          prixUnitaire: produit
            ? String(produit.prixVente)
            : ligne.prixUnitaire,
        };
      }),
    }));
  };

  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      lignes: [...prev.lignes, { ...emptyLine }],
    }));
  };

  const removeLine = (index: number) => {
    if (form.lignes.length === 1) {
      setError("Le devis doit contenir au moins une ligne.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      lignes: prev.lignes.filter((_, lineIndex) => lineIndex !== index),
    }));
  };

  const validateForm = (): boolean => {
    if (!form.dateDevis) {
      setError("La date du devis est obligatoire.");
      return false;
    }

    if (!form.clientId) {
      setError("Le client est obligatoire.");
      return false;
    }

    if (!user?.id && !devis?.utilisateurId) {
      setError("Utilisateur connecté introuvable.");
      return false;
    }

    if (form.lignes.length === 0) {
      setError("Ajoutez au moins un produit au devis.");
      return false;
    }

    for (const [index, ligne] of form.lignes.entries()) {
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

      if (!ligne.prixUnitaire || Number(ligne.prixUnitaire) < 0) {
        setError(`Le prix unitaire de la ligne ${index + 1} est invalide.`);
        return false;
      }

      if (Number(ligne.remise || 0) < 0) {
        setError(`La remise de la ligne ${index + 1} est invalide.`);
        return false;
      }
    }

    if (montantTotal < 0) {
      setError("Le montant total ne peut pas être négatif.");
      return false;
    }

    return true;
  };

  const buildPayload = (): CreateDevisDto => {
    return {
      dateDevis: form.dateDevis,
      clientId: Number(form.clientId),
      utilisateurId: devis?.utilisateurId ?? Number(user?.id),
      statut: form.statut,
      montantTotal,
      lignes: form.lignes.map((ligne) => ({
        produitId: Number(ligne.produitId),
        quantite: Number(ligne.quantite),
        prixUnitaire: Number(ligne.prixUnitaire),
        remise: Number(ligne.remise || 0),
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

      const savedDevis = devis
        ? await updateDevis(devis.id, payload)
        : await createDevis(payload);

      onSaved(savedDevis);
      onClose();
    } catch (error) {
      console.error("Erreur sauvegarde devis:", error);
      setError("Impossible de sauvegarder ce devis.");
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
              {isEdit ? "Modifier le devis" : "Nouveau devis"}
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Préparez une proposition commerciale pour un client.
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
                Date du devis
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="date"
                  value={form.dateDevis}
                  onChange={(event) =>
                    updateField("dateDevis", event.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Client
              </label>

              <div className="relative">
                <UserRound
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <select
                  value={form.clientId}
                  onChange={(event) =>
                    updateField("clientId", event.target.value)
                  }
                  disabled={loadingOptions}
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                >
                  <option value="">Sélectionner un client</option>

                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom} {client.prenom} · {client.telephone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Statut
              </label>

              <select
                value={form.statut}
                onChange={(event) =>
                  updateField("statut", event.target.value as DevisStatut)
                }
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
              >
                <option value="en_attente">En attente</option>
                <option value="accepte">Accepté</option>
                <option value="refuse">Refusé</option>
                <option value="converti">Converti</option>
              </select>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h4 className="text-sm font-semibold text-text-h">
                  Produits du devis
                </h4>

                <p className="mt-0.5 text-xs text-text-muted">
                  Sélectionnez les produits, quantités, prix et remises.
                </p>
              </div>

              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-text-h transition hover:border-primary hover:text-primary"
              >
                <Plus size={15} />
                Ajouter
              </button>
            </div>

            <div className="divide-y divide-border">
              {form.lignes.map((ligne, index) => {
                const selectedProduit = produits.find(
                  (produit) => produit.id === Number(ligne.produitId),
                );

                const lineTotal =
                  Number(ligne.quantite || 0) *
                    Number(ligne.prixUnitaire || 0) -
                  Number(ligne.remise || 0);

                return (
                  <div
                    key={index}
                    className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1fr_110px_140px_120px_120px_44px]"
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
                              {produit.designation} · {produit.marque} · stock{" "}
                              {produit.stockActuel}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedProduit && (
                        <p className="mt-1 text-xs text-text-muted">
                          Code-barres : {selectedProduit.codeBarre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        Qté
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
                        Prix
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ligne.prixUnitaire}
                        onChange={(event) =>
                          updateLine(index, "prixUnitaire", event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        Remise
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ligne.remise}
                        onChange={(event) =>
                          updateLine(index, "remise", event.target.value)
                        }
                        className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-text-muted">
                        Total
                      </label>

                      <div className="rounded-xl bg-bg-subtle px-3 py-2.5 text-sm font-semibold text-text-h">
                        {formatPrice(Math.max(lineTotal, 0))}
                      </div>
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

          <div className="mt-5 rounded-2xl border border-border bg-bg-subtle px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                <p className="text-sm font-medium text-text-h">
                  Montant total du devis
                </p>
              </div>

              <p className="text-xl font-semibold text-text-h">
                {formatPrice(montantTotal)}
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
              {submitting
                ? "Sauvegarde..."
                : isEdit
                  ? "Modifier"
                  : "Créer le devis"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}