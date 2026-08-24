import { useEffect, useState } from "react";
import {getClientById} from "../../../../services/clientService";
import type { ClientDetail } from "../client.types";

import {
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldCheck,
  CalendarDays,
  UserRound,
  Activity,
  Receipt,
  ClipboardList,
  CreditCard,
  Eye,
} from "lucide-react";
import RappelFormModal from "../../rappel/RappelFormModal";
import DossierFormModal from "../../../optique/dossier/DossierFormModal";
import ExamenFormModal from "../../../optique/examen/ExamenFormModal";
import OrdonnanceFormModal from "../../../optique/ordonnance/components/OrdonnanceFormModal";


type Props = {
  clientID: number | null;
  onClose: () => void;
};

function getInitials(nom: string, prenom: string): string {
  return `${nom?.[0] ?? ""}${prenom?.[0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ClientDetailModal({ clientID, onClose }: Props): React.JSX.Element {

    const [client, setClient] = useState<ClientDetail | null>(null);
    const [rappelOpen, setRappelOpen] = useState(false);
    const [dossierOpen, setDossierOpen] = useState(false);
    const [examenOpen, setExamenOpen] = useState(false);
    const [ordonnanceOpen, setOrdonnanceOpen] = useState(false);

    useEffect(() => {
       const fetchMutuelles = async () => {
         try {
           const  {data}= await getClientById(clientID as number);
           setClient(data?.data.client);
         } catch (error) {
           console.error(error);
           setClient(null);
         } 
       };
   
       fetchMutuelles();
     }, [clientID]);

     const totalVentes =
       client?.ventes?.reduce(
         (sum, vente) => sum + Number(vente.montantTotal || 0),
         0,
       ) ?? 0;

     const totalDevis = client?.devis?.length ?? 0;
     const totalVentesCount = client?.ventes?.length ?? 0;
     const totalRappels = client?.rappels?.length ?? 0;

     const lastExamen = client?.dossier?.examens?.[0];
     const ordonnances = client?.dossier?.ordonnances ?? [];
     const ventes = client?.ventes ?? [];
     const devis = client?.devis ?? [];

     const handleCreatedOrdonnance = async () => {
       setOrdonnanceOpen(false);
     };

  if (!client) {
    return <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
            Chargement...
        </div>
    </div>
  }

   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-16 backdrop-blur-sm">
       <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-bg shadow-xl">
         {/* HEADER */}
         <div className="flex items-start justify-between border-b border-border px-6 py-5">
           <div className="flex items-center gap-4">
             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-bg text-lg font-bold text-primary">
               {getInitials(client.nom, client.prenom)}
             </div>

             <div>
               <div className="flex items-center gap-2">
                 <h2 className="text-xl font-semibold text-text-h">
                   {client.nom} {client.prenom}
                 </h2>

                 {client.mutuelle ? (
                   <span className="rounded-full bg-primary-bg px-2.5 py-1 text-xs font-medium text-primary">
                     Avec mutuelle
                   </span>
                 ) : (
                   <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-xs font-medium text-text-muted">
                     Sans mutuelle
                   </span>
                 )}
               </div>

               <p className="mt-1 text-sm text-text-muted">
                 Fiche complète du client, dossier optique, ventes, devis et
                 mutuelle.
               </p>
             </div>
           </div>

           <button
             type="button"
             onClick={onClose}
             className="rounded-lg p-2 text-text-muted transition hover:bg-bg-subtle hover:text-text-h"
           >
             <X size={20} />
           </button>
         </div>

         {/* BODY */}
         <div className="max-h-[75vh] overflow-y-auto px-4 py-3">
           {/* STATS */}
           <div className="mb-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
             <div className="rounded-xl border border-border bg-bg-subtle p-2">
               <div className="flex items-center justify-between">
                 <p className="text-sm text-text-muted">Total ventes</p>
                 <CreditCard size={18} className="text-primary" />
               </div>
               <p className="mt-2 text-2xl font-semibold text-text-h">
                 {totalVentes.toLocaleString("fr-FR")} DH
               </p>
               <p className="mt-1 text-xs text-text-muted">
                 {totalVentesCount} vente{totalVentesCount > 1 ? "s" : ""}
               </p>
             </div>

             <div className="rounded-xl border border-border bg-bg-subtle p-2">
               <div className="flex items-center justify-between">
                 <p className="text-sm text-text-muted">Devis</p>
                 <ClipboardList size={18} className="text-primary" />
               </div>
               <p className="mt-2 text-2xl font-semibold text-text-h">
                 {totalDevis}
               </p>
               <p className="mt-1 text-xs text-text-muted">
                 Devis liés au client
               </p>
             </div>

             <div className="rounded-xl border border-border bg-bg-subtle p-2">
               <div className="flex items-center justify-between">
                 <p className="text-sm text-text-muted">Rappels</p>
                 <CalendarDays size={18} className="text-primary" />
               </div>
               <p className="mt-2 text-2xl font-semibold text-text-h">
                 {totalRappels}
               </p>
               <p className="mt-1 text-xs text-text-muted">
                 Rappels programmés
               </p>
             </div>

             <div className="rounded-xl border border-border bg-bg-subtle p-2">
               <div className="flex items-center justify-between">
                 <p className="text-sm text-text-muted">Dossier</p>
                 <FileText size={18} className="text-primary" />
               </div>
               <p className="mt-2 text-2xl font-semibold text-text-h">
                 {client.dossier ? "Oui" : "Non"}
               </p>
               <p className="mt-1 text-xs text-text-muted">
                 {client.dossier
                   ? client.dossier.numeroDossier
                   : "Aucun dossier"}
               </p>
             </div>
           </div>

           <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
             {/* LEFT */}
             <div className="space-y-5 lg:col-span-1">
               {/* INFORMATIONS CLIENT */}
               <div className="rounded-xl border border-border bg-bg p-4">
                 <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-h">
                   <UserRound size={16} />
                   Informations client
                 </h3>

                 <div className="space-y-3 text-sm">
                   <div className="flex items-center gap-2 text-text">
                     <Phone size={15} className="text-text-subtle" />
                     <span>{client.telephone}</span>
                   </div>

                   <div className="flex items-center gap-2 text-text">
                     <Mail size={15} className="text-text-subtle" />
                     <span>{client.email || "—"}</span>
                   </div>

                   <div className="flex items-start gap-2 text-text">
                     <MapPin size={15} className="mt-0.5 text-text-subtle" />
                     <span>{client.adresse || "—"}</span>
                   </div>

                   <div className="flex items-center gap-2 text-text">
                     <CalendarDays size={15} className="text-text-subtle" />
                     <span>
                       Date de naissance : {formatDate(client.dateNaissance)}
                     </span>
                   </div>
                 </div>
               </div>

               {/* MUTUELLE */}
               <div className="rounded-xl border border-border bg-bg p-4">
                 <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-h">
                   <ShieldCheck size={16} />
                   Mutuelle
                 </h3>

                 {client.mutuelle ? (
                   <div className="rounded-xl bg-primary-bg p-4">
                     <p className="font-medium text-text-h">
                       {client.mutuelle.nom}
                     </p>

                     <p className="mt-1 text-sm text-text-muted">
                       Taux de remboursement
                     </p>

                     <p className="mt-1 text-2xl font-semibold text-primary">
                       {client.mutuelle.tauxRemboursement}%
                     </p>
                   </div>
                 ) : (
                   <div className="rounded-xl bg-bg-subtle p-4 text-sm text-text-muted">
                     Ce client n'est lié à aucune mutuelle.
                   </div>
                 )}
               </div>
             </div>

             {/* RIGHT */}
             <div className="space-y-5 lg:col-span-2">
               {/* DOSSIER OPTIQUE */}

               <div className="rounded-xl border border-border bg-bg p-4">
                 <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-h">
                   <FileText size={16} />
                   Dossier optique
                 </h3>

                 {client.dossier ? (
                   <div className="space-y-4">
                     <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                       <div className="rounded-lg bg-bg-subtle p-3">
                         <p className="text-xs text-text-muted">N° dossier</p>
                         <p className="mt-1 font-medium text-text-h">
                           {client.dossier.numeroDossier}
                         </p>
                       </div>

                       <div className="rounded-lg bg-bg-subtle p-3">
                         <p className="text-xs text-text-muted">
                           Date création
                         </p>
                         <p className="mt-1 font-medium text-text-h">
                           {formatDate(client.dossier.dateCreation)}
                         </p>
                       </div>

                       <div className="rounded-lg bg-bg-subtle p-3">
                         <p className="text-xs text-text-muted">
                           Dernier examen
                         </p>
                         <p className="mt-1 font-medium text-text-h">
                           {formatDate(client.dossier.dateDernierExamen)}
                         </p>
                       </div>

                       <div className="rounded-lg bg-bg-subtle p-3">
                         <p className="text-xs text-text-muted">Observations</p>
                         <p className="mt-1 line-clamp-2 font-medium text-text-h">
                           {client.dossier.observations || "—"}
                         </p>
                       </div>
                     </div>

                     <div className="flex flex-wrap items-center gap-3">
                       <button
                         type="button"
                         onClick={() => setExamenOpen(true)}
                         className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
                       >
                         Ajouter examen
                       </button>

                       <button
                         type="button"
                         onClick={() => setOrdonnanceOpen(true)}
                         className="rounded-xl bg-text px-4 py-2.5 text-sm font-medium text-white transition hover:bg-text-muted"
                       >
                         Ajouter ordonnance
                       </button>
                     </div>

                     {/* DERNIER EXAMEN */}
                     {lastExamen && (
                       <div className="rounded-xl border border-border p-4">
                         <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-text-h">
                           <Activity size={15} />
                           Dernier examen de vue
                         </h4>

                         <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                           <div className="rounded-lg bg-bg-subtle p-3">
                             <p className="text-xs text-text-muted">
                               OD Sphere
                             </p>
                             <p className="font-medium text-text-h">
                               {lastExamen.sphereOd}
                             </p>
                           </div>

                           <div className="rounded-lg bg-bg-subtle p-3">
                             <p className="text-xs text-text-muted">
                               OD Cylindre
                             </p>
                             <p className="font-medium text-text-h">
                               {lastExamen.cylindreOd}
                             </p>
                           </div>

                           <div className="rounded-lg bg-bg-subtle p-3">
                             <p className="text-xs text-text-muted">
                               OG Sphere
                             </p>
                             <p className="font-medium text-text-h">
                               {lastExamen.sphereOg}
                             </p>
                           </div>

                           <div className="rounded-lg bg-bg-subtle p-3">
                             <p className="text-xs text-text-muted">
                               OG Cylindre
                             </p>
                             <p className="font-medium text-text-h">
                               {lastExamen.cylindreOg}
                             </p>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                 ) : (
                   <button
                     type="button"
                     onClick={() => setDossierOpen(true)}
                     className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
                   >
                     Créer dossier optique
                   </button>
                 )}
               </div>

               {/* ORDONNANCES */}
               <div className="rounded-xl border border-border bg-bg p-4">
                 <div className="mb-4 flex items-center justify-between">
                   <h3 className="flex items-center gap-2 text-sm font-semibold text-text-h">
                     <Receipt size={16} />
                     Ordonnances
                   </h3>

                   <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-xs text-text-muted">
                     {ordonnances.length}
                   </span>
                 </div>

                 {ordonnances.length > 0 ? (
                   <div className="space-y-3">
                     {ordonnances.slice(0, 3).map((ordonnance) => (
                       <div
                         key={ordonnance.id}
                         className="flex items-center justify-between rounded-xl border border-border p-3"
                       >
                         <div>
                           <p className="text-sm font-medium text-text-h">
                             {ordonnance.medecin}
                           </p>
                           <p className="text-xs text-text-muted">
                             {formatDate(ordonnance.dateOrdonnance)} · Expire le{" "}
                             {formatDate(ordonnance.dateExpiration)}
                           </p>
                         </div>

                         {ordonnance.scanUrl && (
                           <span className="flex items-center gap-1 rounded-lg bg-primary-bg px-2.5 py-1 text-xs font-medium text-primary">
                             <Eye size={13} />
                             Scan
                           </span>
                         )}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm text-text-muted">
                     Aucune ordonnance enregistrée.
                   </p>
                 )}
               </div>

               {/* VENTES ET DEVIS */}
               <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                 <div className="rounded-xl border border-border bg-bg p-4">
                   <div className="mb-4 flex items-center justify-between">
                     <h3 className="flex items-center gap-2 text-sm font-semibold text-text-h">
                       <CreditCard size={16} />
                       Dernières ventes
                     </h3>

                     <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-xs text-text-muted">
                       {ventes.length}
                     </span>
                   </div>

                   {ventes.length > 0 ? (
                     <div className="space-y-3">
                       {ventes.slice(0, 3).map((vente) => (
                         <div
                           key={vente.id}
                           className="rounded-xl border border-border p-3"
                         >
                           <div className="flex items-center justify-between">
                             <p className="text-sm font-medium text-text-h">
                               Vente #{vente.id}
                             </p>

                             <p className="text-sm font-semibold text-primary">
                               {Number(vente.montantTotal).toLocaleString(
                                 "fr-FR",
                               )}{" "}
                               DH
                             </p>
                           </div>

                           <p className="mt-1 text-xs text-text-muted">
                             {formatDate(vente.dateVente)} ·{" "}
                             {vente.modePaiement}
                           </p>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-text-muted">
                       Aucune vente pour ce client.
                     </p>
                   )}
                 </div>

                 <div className="rounded-xl border border-border bg-bg p-4">
                   <div className="mb-4 flex items-center justify-between">
                     <h3 className="flex items-center gap-2 text-sm font-semibold text-text-h">
                       <ClipboardList size={16} />
                       Devis
                     </h3>

                     <span className="rounded-full bg-bg-subtle px-2.5 py-1 text-xs text-text-muted">
                       {devis.length}
                     </span>
                   </div>

                   {devis.length > 0 ? (
                     <div className="space-y-3">
                       {devis.slice(0, 3).map((item) => (
                         <div
                           key={item.id}
                           className="rounded-xl border border-border p-3"
                         >
                           <div className="flex items-center justify-between">
                             <p className="text-sm font-medium text-text-h">
                               Devis #{item.id}
                             </p>

                             <span className="rounded-full bg-warning-bg px-2.5 py-1 text-xs font-medium text-warning">
                               {item.statut}
                             </span>
                           </div>

                           <p className="mt-1 text-xs text-text-muted">
                             {formatDate(item.dateDevis)} ·{" "}
                             {Number(item.montantTotal).toLocaleString("fr-FR")}{" "}
                             DH
                           </p>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-text-muted">
                       Aucun devis pour ce client.
                     </p>
                   )}
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* FOOTER */}
         <div className="flex items-center justify-between border-t border-border bg-bg-subtle px-6 py-4">
           <p className="text-xs text-text-muted">Client ID : #{client.id}</p>

           <div className="flex items-center gap-3">
             <button
               type="button"
               onClick={() => setRappelOpen(true)}
               className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
             >
               Ajouter rappel
             </button>

             <button
               type="button"
               onClick={onClose}
               className="rounded-xl bg-bg px-4 py-2.5 text-sm font-medium text-text transition hover:bg-border"
             >
               Fermer
             </button>
           </div>
         </div>
       </div>

       {rappelOpen && (
         <RappelFormModal
           clientId={client.id}
           clientName={`${client.nom} ${client.prenom}`}
           onClose={() => setRappelOpen(false)}
           onCreated={(rappel) => {
             setClient((prev) => {
               if (!prev) return prev;

               return {
                 ...prev,
                 rappels: [rappel, ...(prev.rappels ?? [])],
               };
             });
           }}
         />
       )}


       {dossierOpen && (
         <DossierFormModal
           clientId={client.id}
           clientName={`${client.nom} ${client.prenom}`}
           onClose={() => setDossierOpen(false)}
           onCreated={(dossier) => {
             setClient((prev) => {
               if (!prev) return prev;

               const newDossier: NonNullable<ClientDetail["dossier"]> = {
                 id: dossier.id,
                 numeroDossier: dossier.numeroDossier,
                 dateCreation: dossier.dateCreation,
                 dateDernierExamen: dossier.dateDernierExamen,
                 observations: dossier.observations,
                 clientId: dossier.clientId,
                 examens: [],
                 ordonnances: [],
               };

               return {
                 ...prev,
                 dossier: newDossier,
               };
             });
           }}
         />
       )}


        {ordonnanceOpen && client.dossier && (
          <OrdonnanceFormModal
               onClose={() => setOrdonnanceOpen(false)}
                onCreated={() => {
                void handleCreatedOrdonnance();
                    }}
                  />
        )}


       {examenOpen && client.dossier && (
         <ExamenFormModal
           dossierId={client.dossier.id}
           dossierNumero={client.dossier.numeroDossier}
           clientName={`${client.nom} ${client.prenom}`}
           onClose={() => setExamenOpen(false)}
           onCreated={(examen) => {
             setClient((prev) => {
               if (!prev?.dossier) return prev;

               const newExamen: NonNullable<
                 NonNullable<ClientDetail["dossier"]>["examens"]
               >[number] = {
                 id: examen.id,
                 dateExamen: examen.dateExamen,
                 sphereOd: examen.sphereOd,
                 cylindreOd: examen.cylindreOd,
                 axeOd: examen.axeOd,
                 additionOd: examen.additionOd,
                 sphereOg: examen.sphereOg,
                 cylindreOg: examen.cylindreOg,
                 axeOg: examen.axeOg,
                 additionOg: examen.additionOg,
                 dossierId: examen.dossierId,
               };

               return {
                 ...prev,
                 dossier: {
                   ...prev.dossier,
                   dateDernierExamen: examen.dateExamen,
                   examens: [newExamen, ...(prev.dossier.examens ?? [])],
                 },
               };
             });
           }}
         />
       )}
     </div>
   );
}
