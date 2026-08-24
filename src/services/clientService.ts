import axios from "../api/axios";

const getAllClients = () => {
  return axios.get("/clients");
};

const getClientById = (id: number) => {
  return axios.get(`/clients/${id}`);
};


const createClient = (clientData: {
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse: string;
  dateNaissance: string;
}) => {
  return axios.post("/clients", clientData);
};


const updateClient = (
  id: number,
  clientData: {
    nom?: string;
    prenom?: string;
    telephone?: string;
    email?: string;
    adresse?: string;
    dateNaissance?: string;
  },
) => {
  return axios.put(`/clients/${id}`, clientData);
};


const removeClient = (id: number) => {
  return axios.delete(`/clients/${id}`);
};


export {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  removeClient,
};
