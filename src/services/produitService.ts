import axios from "../api/axios";

import type {
  Produit,
  CreateProduitDto,
  UpdateProduitDto,
} from "../interfaces/produit.types";

const normalizeProduits = (data: any): Produit[] => {
  return data?.data?.produits || data?.produits || [];
};

const normalizeProduit = (data: any): Produit => {
  return data?.data?.produit || data?.produit || data?.data || data;
};

const getAllProduits = async (): Promise<Produit[]> => {
  const response = await axios.get("/produits");
  return normalizeProduits(response.data);
};

const getProduitById = async (id: number): Promise<Produit> => {
  const response = await axios.get(`/produits/${id}`);
  return normalizeProduit(response.data);
};

const createProduit = async (
  produitData: CreateProduitDto,
): Promise<Produit> => {
  const response = await axios.post("/produits", produitData);
  return normalizeProduit(response.data);
};

const updateProduit = async (
  id: number,
  produitData: UpdateProduitDto,
): Promise<Produit> => {
  const response = await axios.put(`/produits/${id}`, produitData);
  return normalizeProduit(response.data);
};

const removeProduit = async (id: number): Promise<void> => {
  await axios.delete(`/produits/${id}`);
};

export {
  getAllProduits,
  getProduitById,
  createProduit,
  updateProduit,
  removeProduit,
};
