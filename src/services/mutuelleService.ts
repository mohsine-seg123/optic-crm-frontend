import axios from "../api/axios";
import type {
  Mutuelle,
  CreateMutuelleDto,
  UpdateMutuelleDto,
} from "../interfaces/Mutuelle";

const getAllMutuelles = async (): Promise<Mutuelle[]> => {
  const response = await axios.get("/mutuelles");
  return response.data.data.mutuelles;
};

const getMutuelleById = async (id: number): Promise<Mutuelle> => {
  const response = await axios.get(`/mutuelles/${id}`);
  return response.data.data.mutuelle;
};

const createMutuelle = async (data: CreateMutuelleDto): Promise<Mutuelle> => {
  const response = await axios.post("/mutuelles", data);
  return response.data.data.mutuelle;
};

const updateMutuelle = async (
  id: number,
  data: UpdateMutuelleDto,
): Promise<Mutuelle> => {
  const response = await axios.put(`/mutuelles/${id}`, data);
  return response.data.data.mutuelle;
};

const removeMutuelle = async (id: number): Promise<void> => {
  await axios.delete(`/mutuelles/${id}`);
};

export default {
  getAllMutuelles,
  getMutuelleById,
  createMutuelle,
  updateMutuelle,
  removeMutuelle,
};
