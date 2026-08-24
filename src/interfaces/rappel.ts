export type RappelType =
  | "controle_vue"
  | "renouvellement_lunettes"
  | "recuperation_commande"
  | "paiement"
  | "autre";

export type RappelStatut = "en_attente" | "envoye" | "annule" | "termine";

export type RappelCanal = "sms" | "email" | "appel" | "whatsapp";

export type RappelClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  dateNaissance: string | null;
  mutuelleId: number | null;
};

export type Rappel = {
  id: number;
  typeRappel: RappelType;
  datePrevue: string;
  statut: RappelStatut;
  canal: RappelCanal;
  clientId: number;
  client?: RappelClient;
};

export type CreateRappelDto = {
  typeRappel: RappelType;
  datePrevue: string;
  statut: RappelStatut;
  canal: RappelCanal;
  clientId: number;
};

export type UpdateRappelDto = {
  typeRappel?: RappelType;
  datePrevue?: string;
  statut?: RappelStatut;
  canal?: RappelCanal;
  clientId?: number;
};
