export interface Client {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
}

export interface Mutuelle {
  id: number;
  nom: string;
  tauxRemboursement: string;
  telephone: string;
  email: string;
  client?: Client[];
}

export interface CreateMutuelleDto {
  nom: string;
  tauxRemboursement: string;
  telephone: string;
  email: string;
}

export type UpdateMutuelleDto = Partial<CreateMutuelleDto>;
