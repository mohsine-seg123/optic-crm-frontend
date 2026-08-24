export type ExamenClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string | null;
};

export type ExamenDossier = {
  id: number;
  numeroDossier: string;
  clientId: number;
  client?: ExamenClient;
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
  dossier?: ExamenDossier;
};

export type CreateExamenDto = {
  dateExamen: string;

  sphereOd: number;
  cylindreOd: number;
  axeOd: number;
  additionOd: number;

  sphereOg: number;
  cylindreOg: number;
  axeOg: number;
  additionOg: number;

  dossierId: number;
};

export type UpdateExamenDto = {
  dateExamen?: string;

  sphereOd?: number;
  cylindreOd?: number;
  axeOd?: number;
  additionOd?: number;

  sphereOg?: number;
  cylindreOg?: number;
  axeOg?: number;
  additionOg?: number;
};
