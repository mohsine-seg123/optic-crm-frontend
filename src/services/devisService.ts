import axios from "../api/axios";

import type {
  CreateDevisDto,
  Devis,
  UpdateDevisDto,
} from "../interfaces/devis.types";


const normalizeDevisList = (data: any): Devis[] => {
  return data?.data?.devis || data?.devis || [];
};


const normalizeDevis = (data: any): Devis => {
  return (
    data?.data?.devis ||
    data?.data?.devisItem ||
    data?.devis ||
    data?.data ||
    data
  );
};


const getAllDevis = async (): Promise<Devis[]> => {
  const response = await axios.get("/devis");
  return normalizeDevisList(response.data);
};

const getDevisById = async (id: number): Promise<Devis> => {
  const response = await axios.get(`/devis/${id}`);
  return normalizeDevis(response.data);
};

const createDevis = async (devisData: CreateDevisDto): Promise<Devis> => {
  const response = await axios.post("/devis", devisData);
  return normalizeDevis(response.data);
};

const updateDevis = async (
  id: number,
  devisData: UpdateDevisDto,
): Promise<Devis> => {
  const response = await axios.put(`/devis/${id}`, devisData);
  return normalizeDevis(response.data);
};

const removeDevis = async (id: number): Promise<void> => {
  await axios.delete(`/devis/${id}`);
};

export { getAllDevis, getDevisById, createDevis, updateDevis, removeDevis };
