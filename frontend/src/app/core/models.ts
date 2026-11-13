export interface Zone {
  id: number;
  code: string;
  nom: string;
  capacite: number;
}

export interface Poste {
  id: number;
  numero: string;
  occupied: boolean;
}

export interface Reservation {
  id: number;
  posteNumero: string;
  zoneNom: string;
  debut: string;
  fin: string;
  statut: 'CONFIRMEE' | 'ANNULEE';
}

export interface ZoneOccupancy {
  zoneId: number;
  zoneNom: string;
  occupied: number;
  capacity: number;
}

export interface DailyOccupancy {
  date: string;
  zoneNom: string;
  occupied: number;
  capacity: number;
}
