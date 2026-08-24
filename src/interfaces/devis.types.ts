export type DevisStatut = "en_attente" | "accepte" | "refuse" | "converti";

export type DevisClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
};

export type DevisUtilisateur = {
  id: number;
  nom: string;
  prenom: string;
  role: string;
};

export type DevisProduit = {
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

export type LigneDevis = {
  produitId: number;
  devisId: number;
  quantite: number;
  prixUnitaire: string | number;
  remise: string | number;
  produit: DevisProduit;
};

export type Devis = {
  id: number;
  dateDevis: string;
  montantTotal: string | number;
  statut: DevisStatut;
  clientId: number;
  utilisateurId: number;
  client?: DevisClient;
  utilisateur?: DevisUtilisateur;
  lignes?: LigneDevis[];
};

export type CreateLigneDevisDto = {
  produitId: number;
  quantite: number;
  prixUnitaire: number;
  remise: number;
};

export type CreateDevisDto = {
  dateDevis: string;
  montantTotal: number;
  statut: DevisStatut;
  clientId: number;
  utilisateurId: number;
  lignes: CreateLigneDevisDto[];
};

export type UpdateDevisDto = Partial<CreateDevisDto>;
