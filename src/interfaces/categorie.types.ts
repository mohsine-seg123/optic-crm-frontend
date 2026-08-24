export type ProduitCategorie = {
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

export type Categorie = {
  id: number;
  libelle: string;
  produits?: ProduitCategorie[];
};

export type CreateCategorieDto = {
  libelle: string;
};

export type UpdateCategorieDto = {
  libelle?: string;
};
