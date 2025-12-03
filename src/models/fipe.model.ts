export type VehicleType = 'cars' | 'motorcycles';

export interface Brand {
  name: string;
  code: string;
}

export interface Model {
  name: string;
  code: string;
}

export interface Year {
  name: string;
  code: string;
}

export interface VehicleDetails {
  price: string;
  brand: string;
  model: string;
  modelYear: number;
  fuel: string;
  fipeCode: string;
  referenceMonth: string;
}
