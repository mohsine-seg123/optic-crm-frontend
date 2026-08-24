export type FactureStatutRemboursement =
  | "en_attente"
  | "rembourse"
  | "refuse"
  | "partiel";

export type FactureMutuelle = {
  id: number;
  nom: string;
  tauxRemboursement: string | number;
  telephone: string | null;
  email: string | null;
};

export type FactureClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
  adresse?: string | null;
};

export type FactureVente = {
  id: number;
  dateVente: string;
  montantTotal: string | number;
  modePaiement: string;
  clientId: number;
  utilisateurId: number;
  devisId: number | null;
  client?: FactureClient;
};

export type Facture = {
  id: number;
  numeroFacture: string;
  dateFacture: string;
  montantTotal: string | number;
  partPatient: string | number;
  partMutuelle: string | number;
  statutRemboursement: FactureStatutRemboursement;
  venteId: number;
  mutuelleId: number | null;
  vente: FactureVente;
  mutuelle: FactureMutuelle | null;
};

export type CreateFactureDto = {
  numeroFacture: string;
  dateFacture: string;
  venteId: number;
  mutuelleId: number | null;
  statutRemboursement: FactureStatutRemboursement;
};

export type UpdateFactureDto = {
  numeroFacture?: string;
  dateFacture?: string;
  mutuelleId?: number | null;
  statutRemboursement?: FactureStatutRemboursement;
};
