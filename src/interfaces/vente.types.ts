export type ModePaiement = "cash" | "carte" | "virement" | "cheque";

export type VenteClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
};

export type VenteUtilisateur = {
  id: number;
  nom: string;
  prenom: string;
  role: string;
};

export type VenteProduit = {
  id: number;
  designation: string;
  marque: string;
  modele: string;
  codeBarre: string;
  prixAchat: string | number;
  prixVente: string | number;
  stockActuel: number;
  stockMinimum: number;
};

export type LigneVente = {
  produitId: number;
  venteId: number;
  quantite: number;
  prixUnitaire: string | number;
  remise: string | number;
  produit: VenteProduit;
};

export type Vente = {
  id: number;
  dateVente: string;
  montantTotal: string | number;
  modePaiement: ModePaiement;
  clientId: number;
  utilisateurId: number;
  devisId: number | null;
  facture?: VenteFacture | null;
  client?: VenteClient;
  utilisateur?: VenteUtilisateur;
  lignes?: LigneVente[];
};


export type CreateLigneVenteDto = {
  produitId: number;
  quantite: number;
  prixUnitaire: number;
  remise: number;
};

export type CreateVenteDto = {
  dateVente: string;
  montantTotal: number;
  modePaiement: ModePaiement;
  clientId: number;
  utilisateurId: number;
  devisId?: number | null;
  lignes: CreateLigneVenteDto[];
};

export type ConvertDevisToVenteDto = {
  devisId: number;
  dateVente: string;
  modePaiement: ModePaiement;
};

export type VenteFacture = {
  id: number;
  numeroFacture: string;
  statutRemboursement: string;
};