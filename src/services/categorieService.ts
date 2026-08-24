import axios from "../api/axios";

import type {
  Categorie,
  CreateCategorieDto,
  UpdateCategorieDto,
} from "../interfaces/categorie.types";

const normalizeCategories = (data: any): Categorie[] => {
  return data?.data?.categories || data?.categories || [];
};

const normalizeCategorie = (data: any): Categorie => {
  return data?.data?.categorie || data?.categorie || data?.data || data;
};

const getAllCategories = async (): Promise<Categorie[]> => {
  const response = await axios.get("/categories");
  return normalizeCategories(response.data);
};

const getCategorieById = async (id: number): Promise<Categorie> => {
  const response = await axios.get(`/categories/${id}`);
  return normalizeCategorie(response.data);
};

const createCategorie = async (
  categorieData: CreateCategorieDto,
): Promise<Categorie> => {
  const response = await axios.post("/categories", categorieData);
  return normalizeCategorie(response.data);
};

const updateCategorie = async (
  id: number,
  categorieData: UpdateCategorieDto,
): Promise<Categorie> => {
  const response = await axios.put(`/categories/${id}`, categorieData);
  return normalizeCategorie(response.data);
};

const removeCategorie = async (id: number): Promise<void> => {
  await axios.delete(`/categories/${id}`);
};

export {
  getAllCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  removeCategorie,
};
