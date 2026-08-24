export type FournisseurProduit = {
  id: number;
  designation: string;
  stockActuel: number;
};

export type Fournisseur = {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  produits?: FournisseurProduit[];
};

export type CreateFournisseurDto = {
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
};

export type UpdateFournisseurDto = Partial<CreateFournisseurDto>;
