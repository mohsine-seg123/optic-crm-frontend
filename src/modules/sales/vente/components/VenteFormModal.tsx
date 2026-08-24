import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  CreditCard,
  Landmark,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { createVente } from "../../../../services/venteService";
import { getAllClients } from "../../../../services/clientService";
import { getAllProduits } from "../../../../services/produitService";
import { UseAuth } from "../../../../context/AuthContext";

import type {
  CreateVenteDto,
  ModePaiement,
  Vente,
  VenteClient,
  VenteProduit,
} from "../../../../interfaces/vente.types";

type Props = {
  onClose: () => void;
  onCreated: (vente: Vente) => void;
};

type LigneForm = {
  produitId: string;
  quantite: string;
  prixUnitaire: string;
  remise: string;
};

const emptyLine: LigneForm = {
  produitId: "",
  quantite: "1",
  prixUnitaire: "",
  remise: "0",
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function formatPrice(value: number): string {
  return `${value.toLocaleString("fr-FR")} DH`;
}

export default function VenteFormModal({
  onClose,
  onCreated,
}: Props): React.JSX.Element {
  const { user } = UseAuth();

  const [dateVente, setDateVente] = useState(getTodayDate());
  const [clientId, setClientId] = useState("");
  const [modePaiement, setModePaiement] = useState<ModePaiement>("cash");
  const [lignes, setLignes] = useState<LigneForm[]>([{ ...emptyLine }]);

  const [clients, setClients] = useState<VenteClient[]>([]);
  const [produits, setProduits] = useState<VenteProduit[]>([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const montantTotal = useMemo(() => {
    return lignes.reduce((sum, ligne) => {
      const quantite = Number(ligne.quantite || 0);
      const prix = Number(ligne.prixUnitaire || 0);
      const remise = Number(ligne.remise || 0);

      return sum + quantite * prix - remise;
    }, 0);
  }, [lignes]);

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
        console.error("Erreur chargement options vente:", error);
        setError("Impossible de charger les clients ou les produits.");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleProductChange = (index: number, produitId: string) => {
    const produit = produits.find((item) => item.id === Number(produitId));

    setLignes((prev) =>
      prev.map((ligne, lineIndex) => {
        if (lineIndex !== index) return ligne;

        return {
          ...ligne,
          produitId,
          prixUnitaire: produit
            ? String(produit.prixVente)
            : ligne.prixUnitaire,
        };
      }),
    );
  };

  const updateLine = (index: number, field: keyof LigneForm, value: string) => {
    setLignes((prev) =>
      prev.map((ligne, lineIndex) =>
        lineIndex === index ? { ...ligne, [field]: value } : ligne,
      ),
    );
  };

  const addLine = () => {
    setLignes((prev) => [...prev, { ...emptyLine }]);
  };

  const removeLine = (index: number) => {
    if (lignes.length === 1) {
      setError("La vente doit contenir au moins une ligne.");
      return;
    }

    setLignes((prev) => prev.filter((_, lineIndex) => lineIndex !== index));
  };

  const validateForm = (): boolean => {
    if (!dateVente) {
      setError("La date de vente est obligatoire.");
      return false;
    }

    if (!clientId) {
      setError("Le client est obligatoire.");
      return false;
    }

    if (!user?.id) {
      setError("Utilisateur connecté introuvable.");
      return false;
    }

    if (lignes.length === 0) {
      setError("Ajoutez au moins un produit à la vente.");
      return false;
    }

    for (const [index, ligne] of lignes.entries()) {
      const produit = produits.find(
        (item) => item.id === Number(ligne.produitId),
      );

      if (!ligne.produitId || !produit) {
        setError(
          `Veuillez sélectionner un produit dans la ligne ${index + 1}.`,
        );
        return false;
      }

      if (!ligne.quantite || Number(ligne.quantite) <= 0) {
        setError(`La quantité de la ligne ${index + 1} est invalide.`);
        return false;
      }

      if (Number(ligne.quantite) > produit.stockActuel) {
        setError(
          `Stock insuffisant pour "${produit.designation}". Stock disponible : ${produit.stockActuel}.`,
        );
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

    if (montantTotal <= 0) {
      setError("Le montant total doit être supérieur à 0.");
      return false;
    }

    return true;
  };

  const buildPayload = (): CreateVenteDto => {
    return {
      dateVente,
      clientId: Number(clientId),
      utilisateurId: Number(user?.id),
      modePaiement,
      montantTotal,
      devisId: null,
      lignes: lignes.map((ligne) => ({
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

      const createdVente = await createVente(buildPayload());

      onCreated(createdVente);
      onClose();
    } catch (error) {
      console.error("Erreur création vente:", error);
      setError(
        "Impossible de créer cette vente. Vérifiez le stock ou les informations saisies.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const paymentOptions: {
    value: ModePaiement;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "cash", label: "Espèces", icon: <Banknote size={16} /> },
    { value: "carte", label: "Carte", icon: <CreditCard size={16} /> },
    { value: "virement", label: "Virement", icon: <Landmark size={16} /> },
    { value: "cheque", label: "Chèque", icon: <Wallet size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              Nouvelle vente
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Enregistrez une vente directe et mettez à jour le stock.
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

        <form
          onSubmit={handleSubmit}
          className="max-h-[78vh] overflow-y-auto p-5"
        >
          {error && (
            <div className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Date de vente
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="date"
                  value={dateVente}
                  onChange={(event) => setDateVente(event.target.value)}
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
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
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
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-text-h">
              Mode de paiement
            </label>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {paymentOptions.map((option) => {
                const selected = modePaiement === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setModePaiement(option.value)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition ${
                      selected
                        ? "border-primary bg-primary-bg text-primary"
                        : "border-border bg-bg-subtle text-text-muted hover:border-primary hover:text-primary"
                    }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h4 className="text-sm font-semibold text-text-h">
                  Produits vendus
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
              {lignes.map((ligne, index) => {
                const selectedProduit = produits.find(
                  (produit) => produit.id === Number(ligne.produitId),
                );

                const lineTotal =
                  Number(ligne.quantite || 0) *
                    Number(ligne.prixUnitaire || 0) -
                  Number(ligne.remise || 0);

                const stockWarning =
                  selectedProduit &&
                  Number(ligne.quantite || 0) > selectedProduit.stockActuel;

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
                        <p
                          className={`mt-1 flex items-center gap-1 text-xs ${
                            stockWarning ? "text-danger" : "text-text-muted"
                          }`}
                        >
                          {stockWarning && <AlertTriangle size={12} />}
                          Stock disponible : {selectedProduit.stockActuel}
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
                <ShoppingCart size={18} className="text-primary" />
                <p className="text-sm font-medium text-text-h">
                  Montant total de la vente
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
              disabled={submitting}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-muted transition hover:bg-bg-subtle disabled:opacity-60"
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={submitting || loadingOptions}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Enregistrement..." : "Créer la vente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
