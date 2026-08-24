import axios from "../api/axios";

import type {
  BonLivraison,
  CreateBonLivraisonDto,
} from "../interfaces/bonLivraison.types";

const normalizeBonsLivraison = (data: any): BonLivraison[] => {
  return data?.data?.bonsLivraison || data?.bonsLivraison || [];
};

const normalizeBonLivraison = (data: any): BonLivraison => {
  return (
    data?.data?.bonLivraison ||
    data?.data?.bon ||
    data?.bonLivraison ||
    data?.bon ||
    data?.data ||
    data
  );
};

const getAllBonsLivraison = async (): Promise<BonLivraison[]> => {
  const response = await axios.get("/bon-livraison");
  return normalizeBonsLivraison(response.data);
};

const getBonLivraisonById = async (id: number): Promise<BonLivraison> => {
  const response = await axios.get(`/bon-livraison/${id}`);
  return normalizeBonLivraison(response.data);
};

const createBonLivraison = async (
  bonData: CreateBonLivraisonDto,
): Promise<BonLivraison> => {
  const response = await axios.post("/bon-livraison", bonData);
  return normalizeBonLivraison(response.data);
};

const removeBonLivraison = async (id: number): Promise<void> => {
  await axios.delete(`/bon-livraison/${id}`);
};

export {
  getAllBonsLivraison,
  getBonLivraisonById,
  createBonLivraison,
  removeBonLivraison,
};
