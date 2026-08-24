import axios from "../api/axios";
import type { Utilisateur } from "../interfaces/Utilisateur";
import type { UpdateUtilisateurDto,CreateUtilisateurDto } from "../interfaces/utilisateur.types";



const login=(email:string,motDePasse:string)=>{
    return axios.post("/auth/login",{email,motDePasse})
}

const logout=()=>{
    return axios.post("/auth/logout")
}

const getMe=()=>{
    return axios.get("/auth/me")
}


const normalizeUsers = (data: any): Utilisateur[] => {
  return data?.data?.users || data?.data?.utilisateurs || data?.users || [];
};

const normalizeUser = (data: any): Utilisateur => {
  return (
    data?.data?.user ||
    data?.data?.utilisateur ||
    data?.user ||
    data?.utilisateur ||
    data?.data ||
    data
  );
};

const getAllUtilisateurs = async (): Promise<Utilisateur[]> => {
  const response = await axios.get("/utilisateurs");
  return normalizeUsers(response.data);
};

const getUtilisateurById = async (id: number): Promise<Utilisateur> => {
  const response = await axios.get(`/utilisateurs/${id}`);
  return normalizeUser(response.data);
};

const createUtilisateur = async (
  utilisateurData: CreateUtilisateurDto,
): Promise<Utilisateur> => {
  const response = await axios.post("/utilisateurs", utilisateurData);
  return normalizeUser(response.data);
};

const updateUtilisateur = async (
  id: number,
  utilisateurData: UpdateUtilisateurDto,
): Promise<Utilisateur> => {
  const response = await axios.put(`/utilisateurs/${id}`, utilisateurData);
  return normalizeUser(response.data);
};

const removeUtilisateur = async (id: number): Promise<void> => {
  await axios.delete(`/utilisateurs/${id}`);
};



export {login,logout,getMe,getAllUtilisateurs,getUtilisateurById,createUtilisateur,updateUtilisateur,removeUtilisateur}