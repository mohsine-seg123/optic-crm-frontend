export type OrdonnanceClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  email?: string | null;
};

export type OrdonnanceDossier = {
  id: number;
  numeroDossier: string;
  dateCreation: string;
  dateDernierExamen: string | null;
  observations: string | null;
  clientId: number;
  client?: OrdonnanceClient;
};

export type Ordonnance = {
  id: number;
  dateOrdonnance: string;
  medecin: string;
  dateExpiration: string;
  scanUrl: string | null;
  dossierId: number;
  dossier?: OrdonnanceDossier;
};

export type CreateOrdonnanceDto = {
  dateOrdonnance: string;
  medecin: string;
  dateExpiration: string;
  scanUrl?: string | null;
  dossierId: number;
};
