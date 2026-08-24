import axios from "../api/axios";

import type {
    CreateDossierDto,
  DossierOptique,
  UpdateDossierDto,
} from "../interfaces/dossier.types";

const normalizeDossiers = (data: any): DossierOptique[] => {
  return data?.data?.dossiers || data?.dossiers || data?.data || data || [];
};

const normalizeDossier = (data: any): DossierOptique => {
  return data?.data?.dossier || data?.dossier || data?.data || data;
};

const getAllDossiers = async (): Promise<DossierOptique[]> => {
  const response = await axios.get("/dossiers");
  return normalizeDossiers(response.data);
};

const getDossierById = async (id: number): Promise<DossierOptique> => {
  const response = await axios.get(`/dossiers/${id}`);
  return normalizeDossier(response.data);
};


const createDossier = async (
  dossierData: CreateDossierDto,
): Promise<DossierOptique> => {
  const response = await axios.post("/dossiers", dossierData);

  return normalizeDossier(response.data);
};

const updateDossier = async (
  id: number,
  dossierData: UpdateDossierDto,
): Promise<DossierOptique> => {
  const response = await axios.put(`/dossiers/${id}`, dossierData);
  return normalizeDossier(response.data);
};

const removeDossier = async (id: number): Promise<void> => {
  await axios.delete(`/dossiers/${id}`);
};

export { getAllDossiers, getDossierById, createDossier, updateDossier, removeDossier };
