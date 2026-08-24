export type Client = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string | null;
  dateNaissance: string | null;

  mutuelle?: {
    id: number;
    nom: string;
    tauxRemboursement: number;
  } | null;

  dossier?: {
    id: number;
    numeroDossier: string;
    dateCreation: string;
  } | null;
};


export type FormState = {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  dateNaissance: string;
  mutuelleId: string;
};

export type Mutuelle = {
  id: number;
  nom: string;
  tauxRemboursement: number;
  telephone?: string | null;
  email?: string | null;
};

 
export type Examen = {
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
  scanUrl: string;
  dossierId: number;
};
 
export type Dossier = {
  id: number;
  numeroDossier: string;
  dateCreation: string;
  dateDernierExamen: string | null;
  observations: string | null;
  clientId: number;
  examens: Examen[];
  ordonnances: Ordonnance[];
};
 
export type Vente = {
  id: number;
  dateVente: string;
  montantTotal: string;
  modePaiement: string;
  clientId: number;
  utilisateurId: number;
  devisId: number | null;
};
 
export type Devis = {
  id: number;
  dateDevis: string;
  montantTotal: string;
  statut: "en_attente" | "accepte" | "refuse" | string;
  clientId: number;
  utilisateurId: number;
};
 

export type Rappel = {
  id: number;
  typeRappel: string;
  datePrevue: string;
  statut: string;
  canal: string;
  clientId: number;
};


export type ClientDetail = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string | null;
  dateNaissance: string | null;
  mutuelleId: number | null;
  mutuelle: Mutuelle | null;
  dossier: Dossier | null;
  ventes: Vente[];
  devis: Devis[];
  rappels: Rappel[];
};