import axios from "../api/axios";

import type {
  CreateFactureDto,
  Facture,
  UpdateFactureDto,
} from "../interfaces/facture.types";

const normalizeFactures = (data: any): Facture[] => {
  return data?.data?.factures || data?.factures || [];
};

const normalizeFacture = (data: any): Facture => {
  return data?.data?.facture || data?.facture || data?.data || data;
};

const getAllFactures = async (): Promise<Facture[]> => {
  const response = await axios.get("/factures");
  return normalizeFactures(response.data);
};

const getFactureById = async (id: number): Promise<Facture> => {
  const response = await axios.get(`/factures/${id}`);
  return normalizeFacture(response.data);
};

const createFacture = async (
  factureData: CreateFactureDto,
): Promise<Facture> => {
  const response = await axios.post("/factures", factureData);
  return normalizeFacture(response.data);
};

const updateFacture = async (
  id: number,
  factureData: UpdateFactureDto,
): Promise<Facture> => {
  const response = await axios.put(`/factures/${id}`, factureData);
  return normalizeFacture(response.data);
};

const removeFacture = async (id: number): Promise<void> => {
  await axios.delete(`/factures/${id}`);
};

const downloadFacturePdf = async (
  id: number,
  numeroFacture: string,
): Promise<void> => {
  const response = await axios.get(`/factures/${id}/pdf`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");

  link.href = url;
  link.download = `${numeroFacture}.pdf`;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};

export {
  getAllFactures,
  getFactureById,
  createFacture,
  updateFacture,
  removeFacture,
  downloadFacturePdf,
};
