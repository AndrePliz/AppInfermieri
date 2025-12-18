// FILE: mobile/src/types.ts

export interface Service {
  service_description: string;
  service_description_detailed?: string;
}

export interface ServiceRequest {
  service_request_id: number;
  date_time: string; // ISO String dal server
  nurse_price: string; // Arriva come stringa decimale dal DB
  city: string;
  notes?: string;
  
  // Campi presenti solo se la prestazione è privata/bloccata
  address?: string;
  name?: string; // Nome paziente
  phone?: string;
  user_assigned?: string;
  status_request?: number; // 1=Libera, 2=Assegnata, 3=In Visione, 5=Eseguita

  // Relazioni
  Service?: Service;
}

export interface ShiftsResponse {
  available: ServiceRequest[];
  myShifts: ServiceRequest[];
}

export type RootStackParamList = {
  Onboarding: undefined; // Se creerai questa schermata
  Login: undefined;
  Main: undefined;       // Contiene i tab Home/Profilo
};