// payement modes
export type PaymentModeItem = {
  modePaiement: string;
  ventesCount: number;
  montantTotal: number;
  pourcentage: number;
};

export type PaymentModesResponse = {
  period: string;
  totalAmount: number;
  paymentModes: PaymentModeItem[];
};

// recent clients

export type RecentClient = {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  adresse: string | null;
  dateNaissance: string | null;
  mutuelleId: number | null;

  mutuelle: {
    id: number;
    nom: string;
    tauxRemboursement: string | number;
    telephone: string | null;
    email: string | null;
  } | null;

  dossier: {
    id: number;
    numeroDossier: string;
    dateCreation: string;
    dateDernierExamen: string | null;
    observations: string | null;
    clientId: number;
  } | null;
};

// recent sales

export type RecentSale = {
  id: number;
  dateVente: string;
  montantTotal: string | number;
  modePaiement: string;
  clientId: number;
  utilisateurId: number;
  devisId: number | null;

  client: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
  };

  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
  };
};

// overview

export type ProduitStockFaible = {
  id: number;
  designation: string;
  stockActuel: number;
  stockMinimum: number;
};

export type DashboardOverview = {
  ventesTodayCount: number;
  ventesMonthCount: number;
  clientsCount: number;
  devisCount: number;
  facturesPendingCount: number;
  rappelsTodayCount: number;

  todayRevenue: number;
  monthRevenue: number;

  produitsStockFaible: ProduitStockFaible[];
};

// best products

export type BestProduct = {
  produit: {
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

    categorie: {
      id: number;
      libelle: string;
    };

    fournisseur: {
      id: number;
      nom: string;
      telephone: string;
      email: string;
      adresse: string;
    };
  };

  quantiteVendue: number;
};

// pending factures

export type PendingFacture = {
  id: number;
  numeroFacture: string;
  dateFacture: string;
  montantTotal: string | number;
  partPatient: string | number;
  partMutuelle: string | number;
  statutRemboursement: string;
  venteId: number;
  mutuelleId: number | null;

  vente: {
    id: number;
    dateVente: string;
    montantTotal: string | number;
    modePaiement: string;
    client: {
      id: number;
      nom: string;
      prenom: string;
      telephone: string;
      email: string | null;
      adresse: string | null;
      dateNaissance: string | null;
      mutuelleId: number | null;
    };
  };

  mutuelle: {
    id: number;
    nom: string;
    tauxRemboursement: string | number;
    telephone: string | null;
    email: string | null;
  } | null;
};

// devis conversion

export type DevisConversion = {
  devis: number;
  devisConvertis: number;
  tauxConversion: number;
};