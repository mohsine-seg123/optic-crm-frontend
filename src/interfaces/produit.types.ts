export type ProduitCategorie = {
  id: number;
  libelle: string;
};

export type ProduitFournisseur = {
  id: number;
  nom: string;
};

export type Produit = {
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
  categorie?: ProduitCategorie;
  fournisseur?: ProduitFournisseur;
};

export type CreateProduitDto = {
  designation: string;
  marque: string;
  modele: string;
  couleur?: string | null;
  traitement?: string | null;
  indice?: number | null;
  codeBarre: string;
  prixAchat: number;
  prixVente: number;
  stockActuel: number;
  stockMinimum: number;
  imageUrl?: string | null;
  categorieId: number;
  fournisseurId: number;
};

export type UpdateProduitDto = Partial<CreateProduitDto>;
