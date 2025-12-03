import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Brand, Model, Year, VehicleDetails, VehicleType } from '../models/fipe.model';

@Injectable({
  providedIn: 'root'
})
export class FipeService {
  // Fix: Explicitly type the injected HttpClient to resolve type inference issue.
  private readonly http: HttpClient = inject(HttpClient);
  private readonly API_BASE_URL = 'https://fipe.parallelum.com.br/api/v2';

  getBrands(vehicleType: VehicleType): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.API_BASE_URL}/${vehicleType}/brands`);
  }

  getModels(vehicleType: VehicleType, brandCode: string): Observable<Model[]> {
    return this.http.get<Model[]>(`${this.API_BASE_URL}/${vehicleType}/brands/${brandCode}/models`);
  }

  getYears(vehicleType: VehicleType, brandCode: string, modelCode: string): Observable<Year[]> {
    return this.http.get<Year[]>(`${this.API_BASE_URL}/${vehicleType}/brands/${brandCode}/models/${modelCode}/years`);
  }

  getVehicleDetails(vehicleType: VehicleType, brandCode: string, modelCode: string, yearCode: string): Observable<VehicleDetails> {
    return this.http.get<VehicleDetails>(`${this.API_BASE_URL}/${vehicleType}/brands/${brandCode}/models/${modelCode}/years/${yearCode}`);
  }
}
