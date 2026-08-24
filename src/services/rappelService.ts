import axios from "../api/axios";
import type {
  Rappel,
  CreateRappelDto,
  UpdateRappelDto,
} from "../interfaces/rappel";

const getAllRappels = async (): Promise<Rappel[]> => {
  const response = await axios.get("/rappels");
  return response.data.data.rappels;
};

const getRappelById = async (id: number): Promise<Rappel> => {
  const response = await axios.get(`/rappels/${id}`);
  return response.data.data.rappel;
};

const createRappel = async (rappelData: CreateRappelDto): Promise<Rappel> => {
  const response = await axios.post("/rappels", rappelData);
  return response.data.data.rappel;
};

const updateRappel = async (
  id: number,
  rappelData: UpdateRappelDto,
): Promise<Rappel> => {
  const response = await axios.put(`/rappels/${id}`, rappelData);
  return response.data.data.rappel;
};

const removeRappel = async (id: number): Promise<void> => {
  await axios.delete(`/rappels/${id}`);
};

export {
  getAllRappels,
  getRappelById,
  createRappel,
  updateRappel,
  removeRappel,
};
