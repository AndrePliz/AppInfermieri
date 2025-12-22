export interface Service {
  service_id: number;
  title: string;
  description?: string;
}

export interface ServiceRequest {
  request_id: number;
  service_request_id: number;
  service_id: number;
  patient_name: string;
  address: string;
  date_requested: string;
  notes?: string;
  status_request: number; // 1: Libera, 2: Presa in carico, 3: Bloccata temporaneamente, 4: Completata
  lat?: number;
  lon?: number;
  price?: number;
  expiry_at?: string;
  Service?: Service;
}

// QUESTA MANCAVA E SERVIVA ALLA TUA HOME:
export interface ShiftsResponse {
  available: ServiceRequest[];
  myShifts: ServiceRequest[];
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Main: undefined;
};