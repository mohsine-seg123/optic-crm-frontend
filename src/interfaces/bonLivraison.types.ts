export type BonLivraisonFournisseur = {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
};

export type BonLivraisonProduit = {
  id: number;
  designation: string;
  marque: string;
  modele: string;
  couleur: string | null;
  traitement: string | null;
  indice: string | number | null;
  codeBarre: string;
  prixAchat: string | number;
  prixVente: string | number;
  stockActuel: number;
  stockMinimum: number;
  imageUrl: string | null;
  categorieId: number;
  fournisseurId: number;
};

export type LigneBonLivraison = {
  produitId: number;
  bonId: number;
  quantite: number;
  prixAchat: string | number;
  produit: BonLivraisonProduit;
};

export type BonLivraison = {
  id: number;
  numeroBon: string;
  dateReception: string;
  fournisseurId: number;
  fournisseur: BonLivraisonFournisseur;
  lignes: LigneBonLivraison[];
};

export type CreateBonLivraisonLineDto = {
  produitId: number;
  quantite: number;
  prixAchat: number;
};

export type CreateBonLivraisonDto = {
  numeroBon: string;
  dateReception: string;
  fournisseurId: number;
  lignes: CreateBonLivraisonLineDto[];
};
