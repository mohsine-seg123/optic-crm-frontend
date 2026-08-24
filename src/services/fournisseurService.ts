import axios from "../api/axios";

import type {
  Fournisseur,
  CreateFournisseurDto,
  UpdateFournisseurDto,
} from "../interfaces/fournisseur.types";

const normalizeFournisseurs = (data: any): Fournisseur[] => {
  return data?.data?.fournisseurs || data?.fournisseurs || [];
};

const normalizeFournisseur = (data: any): Fournisseur => {
  return data?.data?.fournisseur || data?.fournisseur || data?.data || data;
};

const getAllFournisseurs = async (): Promise<Fournisseur[]> => {
  const response = await axios.get("/fournisseurs");
  return normalizeFournisseurs(response.data);
};

const getFournisseurById = async (id: number): Promise<Fournisseur> => {
  const response = await axios.get(`/fournisseurs/${id}`);
  return normalizeFournisseur(response.data);
};

const createFournisseur = async (
  fournisseurData: CreateFournisseurDto,
): Promise<Fournisseur> => {
  const response = await axios.post("/fournisseurs", fournisseurData);
  return normalizeFournisseur(response.data);
};

const updateFournisseur = async (
  id: number,
  fournisseurData: UpdateFournisseurDto,
): Promise<Fournisseur> => {
  const response = await axios.put(`/fournisseurs/${id}`, fournisseurData);
  return normalizeFournisseur(response.data);
};

const removeFournisseur = async (id: number): Promise<void> => {
  await axios.delete(`/fournisseurs/${id}`);
};

export {
  getAllFournisseurs,
  getFournisseurById,
  createFournisseur,
  updateFournisseur,
  removeFournisseur,
};
