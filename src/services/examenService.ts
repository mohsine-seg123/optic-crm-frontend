import axios from "../api/axios";

import type {
  ExamenVue,
  CreateExamenDto,
  UpdateExamenDto,
} from "../interfaces/examen.types";

const normalizeExamens = (data: any): ExamenVue[] => {
  return data?.data?.examens || data?.examens || data?.data || data || [];
};

const normalizeExamen = (data: any): ExamenVue => {
  return data?.data?.examen || data?.examen || data?.data || data;
};

const getAllExamens = async (): Promise<ExamenVue[]> => {
  const response = await axios.get("/examens");
  return normalizeExamens(response.data);
};

const getExamenById = async (id: number): Promise<ExamenVue> => {
  const response = await axios.get(`/examens/${id}`);
  return normalizeExamen(response.data);
};

const createExamen = async (
  examenData: CreateExamenDto,
): Promise<ExamenVue> => {
  const response = await axios.post("/examens", examenData);
  return normalizeExamen(response.data);
};

const updateExamen = async (
  id: number,
  examenData: UpdateExamenDto,
): Promise<ExamenVue> => {
  const response = await axios.put(`/examens/${id}`, examenData);
  return normalizeExamen(response.data);
};

const removeExamen = async (id: number): Promise<void> => {
  await axios.delete(`/examens/${id}`);
};

export {
  getAllExamens,
  getExamenById,
  createExamen,
  updateExamen,
  removeExamen,
};
