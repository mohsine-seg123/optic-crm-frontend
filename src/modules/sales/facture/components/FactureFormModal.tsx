import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  ReceiptText,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { createFacture } from "../../../../services/factureService";
import mutuelleService from "../../../../services/mutuelleService";

import type {
  Facture,
  FactureMutuelle,
  FactureStatutRemboursement,
} from "../../../../interfaces/facture.types";

type VenteForFacture = {
  id: number;
  dateVente: string;
  montantTotal: string | number;
  modePaiement: string;
  clientId: number;
  devisId: number | null;
  client?: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
  };
  facture?: {
    id: number;
    numeroFacture: string;
  } | null;
};

type Props = {
  vente: VenteForFacture;
  onClose: () => void;
  onCreated: (facture: Facture) => void | Promise<void>;
};

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function generateNumeroFacture(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100 + Math.random() * 900);

  return `FAC-${year}-${random}`;
}

function formatPrice(value: string | number): string {
  return `${Number(value || 0).toLocaleString("fr-FR")} DH`;
}

function getClientName(vente: VenteForFacture): string {
  if (!vente.client) return `Client #${vente.clientId}`;

  return `${vente.client.nom} ${vente.client.prenom}`;
}

function normalizeMutuelles(data: any): FactureMutuelle[] {
  if (Array.isArray(data)) return data;

  return (
    data?.data?.mutuelles ||
    data?.data?.data?.mutuelles ||
    data?.mutuelles ||
    []
  );
}

export default function FactureFormModal({
  vente,
  onClose,
  onCreated,
}: Props): React.JSX.Element {
  const [numeroFacture, setNumeroFacture] = useState(generateNumeroFacture());
  const [dateFacture, setDateFacture] = useState(getTodayDate());
  const [mutuelleId, setMutuelleId] = useState("");
  const [statutRemboursement, setStatutRemboursement] =
    useState<FactureStatutRemboursement>("en_attente");

  const [mutuelles, setMutuelles] = useState<FactureMutuelle[]>([]);
  const [loadingMutuelles, setLoadingMutuelles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedMutuelle = useMemo(() => {
    return mutuelles.find((mutuelle) => mutuelle.id === Number(mutuelleId));
  }, [mutuelles, mutuelleId]);

  const montantVente = Number(vente.montantTotal || 0);

  const preview = useMemo(() => {
    const taux = Number(selectedMutuelle?.tauxRemboursement || 0);
    const partMutuelle = selectedMutuelle ? (montantVente * taux) / 100 : 0;
    const partPatient = montantVente - partMutuelle;

    return {
      taux,
      partMutuelle,
      partPatient,
    };
  }, [selectedMutuelle, montantVente]);

  useEffect(() => {
    const fetchMutuelles = async () => {
      try {
        setLoadingMutuelles(true);

        const data = await mutuelleService.getAllMutuelles();
        setMutuelles(normalizeMutuelles(data));
      } catch (error) {
        console.error("Erreur chargement mutuelles:", error);
        setMutuelles([]);
      } finally {
        setLoadingMutuelles(false);
      }
    };

    fetchMutuelles();
  }, []);

  const validateForm = (): boolean => {
    if (!numeroFacture.trim()) {
      setError("Le numéro de facture est obligatoire.");
      return false;
    }

    if (!dateFacture) {
      setError("La date de facture est obligatoire.");
      return false;
    }

    if (!vente.id) {
      setError("Vente introuvable.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const createdFacture = await createFacture({
        numeroFacture: numeroFacture.trim(),
        dateFacture,
        venteId: vente.id,
        mutuelleId: mutuelleId ? Number(mutuelleId) : null,
        statutRemboursement,
      });

      await onCreated(createdFacture);
      onClose();
    } catch (error) {
      console.error("Erreur création facture:", error);
      setError(
        "Impossible de créer cette facture. Vérifiez si cette vente n’a pas déjà une facture.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-bg shadow-xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-text-h">
              Générer une facture
            </h3>

            <p className="mt-1 text-sm text-text-muted">
              Créez une facture liée à la vente #{vente.id}.
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

        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="mb-4 rounded-xl bg-danger-bg px-4 py-3 text-sm font-medium text-danger">
              {error}
            </div>
          )}

          <div className="mb-5 rounded-2xl border border-border bg-bg-subtle/40 p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                  <UserRound size={17} />
                </div>

                <p className="text-xs text-text-muted">Client</p>
                <p className="mt-1 text-sm font-semibold text-text-h">
                  {getClientName(vente)}
                </p>
              </div>

              <div>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-success-bg text-success">
                  <ReceiptText size={17} />
                </div>

                <p className="text-xs text-text-muted">Montant vente</p>
                <p className="mt-1 text-sm font-semibold text-text-h">
                  {formatPrice(vente.montantTotal)}
                </p>
              </div>

              <div>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-bg text-primary">
                  <FileText size={17} />
                </div>

                <p className="text-xs text-text-muted">Origine</p>
                <p className="mt-1 text-sm font-semibold text-text-h">
                  {vente.devisId ? `Devis #${vente.devisId}` : "Vente directe"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Numéro facture
              </label>

              <input
                value={numeroFacture}
                onChange={(event) => setNumeroFacture(event.target.value)}
                placeholder="FAC-003"
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition placeholder:text-text-muted focus:border-primary"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Date facture
              </label>

              <div className="relative">
                <CalendarDays
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  type="date"
                  value={dateFacture}
                  onChange={(event) => setDateFacture(event.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Mutuelle
              </label>

              <div className="relative">
                <ShieldCheck
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <select
                  value={mutuelleId}
                  onChange={(event) => setMutuelleId(event.target.value)}
                  disabled={loadingMutuelles}
                  className="w-full rounded-xl border border-border bg-bg-subtle py-2.5 pl-9 pr-3 text-sm text-text-h outline-none transition focus:border-primary"
                >
                  <option value="">Sans mutuelle</option>

                  {mutuelles.map((mutuelle) => (
                    <option key={mutuelle.id} value={mutuelle.id}>
                      {mutuelle.nom} · {mutuelle.tauxRemboursement}%
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-h">
                Statut remboursement
              </label>

              <select
                value={statutRemboursement}
                onChange={(event) =>
                  setStatutRemboursement(
                    event.target.value as FactureStatutRemboursement,
                  )
                }
                className="w-full rounded-xl border border-border bg-bg-subtle px-3 py-2.5 text-sm text-text-h outline-none transition focus:border-primary"
              >
                <option value="en_attente">En attente</option>
                <option value="rembourse">Remboursé</option>
                <option value="partiel">Partiel</option>
                <option value="refuse">Refusé</option>
              </select>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-bg-subtle px-4 py-3">
              <p className="text-xs text-text-muted">Taux mutuelle</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {selectedMutuelle ? `${preview.taux}%` : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-bg-subtle px-4 py-3">
              <p className="text-xs text-text-muted">Part patient estimée</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {formatPrice(preview.partPatient)}
              </p>
            </div>

            <div className="rounded-xl bg-bg-subtle px-4 py-3">
              <p className="text-xs text-text-muted">Part mutuelle estimée</p>
              <p className="mt-1 text-sm font-semibold text-text-h">
                {formatPrice(preview.partMutuelle)}
              </p>
            </div>
          </div>

          <p className="mt-2 text-xs text-text-muted">
            Le calcul officiel est effectué côté backend lors de la création.
          </p>

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
              disabled={submitting}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Création..." : "Créer la facture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
