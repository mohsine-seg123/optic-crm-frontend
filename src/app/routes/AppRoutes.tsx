import { type JSX } from 'react'
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ClientPage from '../../modules/crm/client/ClientPage';
import LoginPage from '../../modules/auth/LoginPage';
import DashboardPage from '../../modules/dashboard/DashboardPage';
import AuthGuard from '../guards/AuthGuard';
import MutuellePage from '../../modules/crm/mutuelles/mutuellePage';
import RappelPage from '../../modules/crm/rappel/RappelPage';
import DossierPage from '../../modules/optique/dossier/DossierPage';
import ExamenPage from '../../modules/optique/examen/ExamenPage';
import CategoriePage from '../../modules/stock/categorie/CategoriePage';
import ProduitPage from '../../modules/stock/produit/ProduitPage';
import FournisseurPage from '../../modules/stock/fournisseur/FournisseurPage';
import BonLivraisonPage from '../../modules/stock/bon-livraison/BonLivraisonPage';
import DevisPage from '../../modules/sales/devis/DevisPage';
import VentePage from '../../modules/sales/vente/VentePage';
import FacturePage from '../../modules/sales/facture/FacturePage';
import UtilisateurPage from '../../modules/users/UtilisateurPage';
import OrdonnancePage from '../../modules/optique/ordonnance/OrdonnancePage';
import Profile from '../../modules/users/Profile';



function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        
        <Route index element={<DashboardPage />} />
        <Route path="crm/clients" element={<ClientPage />} />
        <Route path="crm/mutuelles" element={<MutuellePage />} />
        <Route path="crm/rappels" element={<RappelPage />} />
        <Route path="optique/dossiers" element={<DossierPage />} />
        <Route path="optique/examens" element={<ExamenPage />} />
        <Route path="stock/categories" element={<CategoriePage />} />
        <Route path="stock/produits" element={<ProduitPage />} />
        <Route path="stock/fournisseurs" element={<FournisseurPage />} />
        <Route path="stock/livraisons" element={<BonLivraisonPage />} />
        <Route path="sales/devis" element={<DevisPage />} />
        <Route path="sales/ventes" element={<VentePage />} />
        <Route path="sales/factures" element={<FacturePage />} />
        <Route path="users" element={ <UtilisateurPage />}/>
        <Route path="optique/ordonnances" element={<OrdonnancePage />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes