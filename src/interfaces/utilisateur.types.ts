export type UserRole = "admin" | "vendeur";

export type Utilisateur = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
};

export type CreateUtilisateurDto = {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  role: UserRole;
};

export type UpdateUtilisateurDto = {
  nom?: string;
  prenom?: string;
  email?: string;
  motDePasse?: string;
  role?: UserRole;
};
