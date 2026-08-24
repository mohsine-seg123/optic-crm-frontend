export type DossierClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
};

export type ExamenVue = {
  id: number;
  dateExamen: string;
  sphereOd: string;
  cylindreOd: string;
  axeOd: number;
  additionOd: string;
  sphereOg: string;
  cylindreOg: string;
  axeOg: number;
  additionOg: string;
  dossierId: number;
};

export type Ordonnance = {
  id: number;
  dateOrdonnance: string;
  medecin: string;
  dateExpiration: string;
  scanUrl: string | null;
  dossierId: number;
};

export type DossierOptique = {
  id: number;
  numeroDossier: string;
  dateCreation: string;
  dateDernierExamen: string | null;
  observations: string | null;
  clientId: number;

  client?: DossierClient;
  examens?: ExamenVue[];
  ordonnances?: Ordonnance[];
};

export type UpdateDossierDto = {
  numeroDossier?: string;
  dateCreation?: string;
  dateDernierExamen?: string | null;
  observations?: string | null;
};


export type CreateDossierDto = {
  numeroDossier: string;
  dateCreation: string;
  dateDernierExamen?: string | null;
  observations?: string | null;
  clientId: number;
};