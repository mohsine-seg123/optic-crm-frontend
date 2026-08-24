import axios from "../api/axios";

import type {
  ConvertDevisToVenteDto,
  CreateVenteDto,
  Vente,
} from "../interfaces/vente.types";

const normalizeVentes = (data: any): Vente[] => {
  return data?.data?.ventes || data?.ventes || [];
};

const normalizeVente = (data: any): Vente => {
  return data?.data?.vente || data?.vente || data?.data || data;
};

const getAllVentes = async (): Promise<Vente[]> => {
  const response = await axios.get("/ventes");
  return normalizeVentes(response.data);
};

const getVenteById = async (id: number): Promise<Vente> => {
  const response = await axios.get(`/ventes/${id}`);
  return normalizeVente(response.data);
};

const createVente = async (venteData: CreateVenteDto): Promise<Vente> => {
  const response = await axios.post("/ventes", venteData);
  return normalizeVente(response.data);
};

const removeVente = async (id: number): Promise<void> => {
  await axios.delete(`/ventes/${id}`);
};

const convertDevisToVente = async (
  data: ConvertDevisToVenteDto,
): Promise<Vente> => {
  const response = await axios.post("/ventes/from-devis", data);
  return normalizeVente(response.data);
};

export {
  getAllVentes,
  getVenteById,
  createVente,
  removeVente,
  convertDevisToVente,
};
