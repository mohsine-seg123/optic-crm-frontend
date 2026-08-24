import React from 'react'
import { createContext ,useContext,useState,useEffect} from 'react';
import {logout,getMe} from "./../services/utilisateurService";
import { login as loginRequest } from "./../services/utilisateurService";



type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: "admin" | "vendeur";
};


type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const UseAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};


export default function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
    const [user,setUser] = useState<User | null>(null);
    const [loading,setLoading] = useState<boolean>(true);

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const { data } = await getMe();
          setUser(data);
        } catch (error) {
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }, []);


    const handleLogin = async (email: string, password: string) => {
        const { data } = await loginRequest(email, password);
       const loggedUser = data.utilisateur;

       setUser(loggedUser);

       return loggedUser;
    };


    const handleLogout = async () => {
        await logout();
        setUser(null);
    }



   
  return (
    <AuthContext.Provider value={{ user,login:handleLogin,logout:handleLogout, loading }}>
        {children}
    </AuthContext.Provider>
  )
};