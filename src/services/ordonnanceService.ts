import axios from "../api/axios";

import type {CreateOrdonnanceDto,Ordonnance,} from "../interfaces/ordonnance.types";


const normalizeOrdonnances = (data: any): Ordonnance[] => {
  return data?.data?.ordonnances || data?.ordonnances || [];
};

const normalizeOrdonnance = (data: any): Ordonnance => {
  return data?.data?.ordonnance || data?.ordonnance || data?.data || data;
};

const getAllOrdonnances = async (): Promise<Ordonnance[]> => {
  const response = await axios.get("/ordonnances");
  return normalizeOrdonnances(response.data);
};

const getOrdonnanceById = async (id: number): Promise<Ordonnance> => {
  const response = await axios.get(`/ordonnances/${id}`);
  return normalizeOrdonnance(response.data);
};

const createOrdonnance = async ( ordonnanceData: CreateOrdonnanceDto,): Promise<Ordonnance> => {
  const response = await axios.post("/ordonnances", ordonnanceData);
  return normalizeOrdonnance(response.data);
};


const removeOrdonnance = async (id: number): Promise<void> => {
  await axios.delete(`/ordonnances/${id}`);
};


export {
  getAllOrdonnances,
  getOrdonnanceById,
  createOrdonnance,
  removeOrdonnance,
};
