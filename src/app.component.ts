import { Component, ChangeDetectionStrategy, signal, inject, effect, computed, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FipeService } from './services/fipe.service';
import { GeminiService } from './services/gemini.service';
import { Brand, Model, VehicleDetails, VehicleType, Year } from './models/fipe.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  }
})
export class AppComponent {
  private readonly fipeService = inject(FipeService);
  private readonly geminiService = inject(GeminiService);
  private readonly elementRef = inject(ElementRef);

  // State Signals
  vehicleType = signal<VehicleType>('cars');
  brands = signal<Brand[]>([]);
  models = signal<Model[]>([]);
  years = signal<Year[]>([]);
  vehicleDetails = signal<VehicleDetails | null>(null);
  vehicleImageUrl = signal<string | null>(null);

  selectedBrandCode = signal<string>('');
  selectedModelCode = signal<string>('');
  selectedYearCode = signal<string>('');

  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  loadingMessage = signal<string>('');
  errorMessage = signal<string | null>(null);
  
  isFormComplete = signal(false);

  // State for listings
  listings = signal<any[]>([]);
  listingsStatus = signal<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Search terms for dropdowns
  brandSearchTerm = signal<string>('');
  modelSearchTerm = signal<string>('');
  yearSearchTerm = signal<string>('');

  // Dropdown visibility
  isBrandDropdownOpen = signal(false);
  isModelDropdownOpen = signal(false);
  isYearDropdownOpen = signal(false);

  // Filtered lists for dropdowns
  filteredBrands = computed(() => {
    const term = this.brandSearchTerm().toLowerCase();
    if (!term) return this.brands();
    return this.brands().filter(brand => brand.name.toLowerCase().includes(term));
  });

  filteredModels = computed(() => {
    const term = this.modelSearchTerm().toLowerCase();
    if (!term) return this.models();
    return this.models().filter(model => model.name.toLowerCase().includes(term));
  });

  filteredYears = computed(() => {
    const term = this.yearSearchTerm().toLowerCase();
    if (!term) return this.years();
    return this.years().filter(year => year.name.toLowerCase().includes(term));
  });

  constructor() {
    this.loadBrands();
    effect(() => {
        this.isFormComplete.set(
            !!this.selectedBrandCode() && !!this.selectedModelCode() && !!this.selectedYearCode()
        );
    });
  }
  
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.querySelector('#brand-dropdown-wrapper')?.contains(event.target)) {
        this.isBrandDropdownOpen.set(false);
    }
    if (!this.elementRef.nativeElement.querySelector('#model-dropdown-wrapper')?.contains(event.target)) {
        this.isModelDropdownOpen.set(false);
    }
    if (!this.elementRef.nativeElement.querySelector('#year-dropdown-wrapper')?.contains(event.target)) {
        this.isYearDropdownOpen.set(false);
    }
  }

  handleVehicleTypeChange(type: VehicleType): void {
    if (this.vehicleType() === type) return;
    this.vehicleType.set(type);
    this.resetSelections(true, true, true);
    this.loadBrands();
  }

  async loadBrands(): Promise<void> {
    this.status.set('loading');
    this.loadingMessage.set('Carregando marcas...');
    this.errorMessage.set(null);
    this.brands.set([]);
    try {
      const brands = await firstValueFrom(this.fipeService.getBrands(this.vehicleType()));
      this.brands.set(brands);
      this.status.set('idle');
    } catch (error) {
      this.handleError('Não foi possível carregar as marcas.');
    }
  }

  async loadModels(brandCode: string): Promise<void> {
    if (!brandCode) return;
    this.status.set('loading');
    this.loadingMessage.set('Carregando modelos...');
    this.errorMessage.set(null);
    try {
      const models = await firstValueFrom(this.fipeService.getModels(this.vehicleType(), brandCode));
      this.models.set(models);
      this.status.set('idle');
    } catch (error) {
      this.handleError('Não foi possível carregar os modelos.');
    }
  }

  async loadYears(brandCode: string, modelCode: string): Promise<void> {
    if (!brandCode || !modelCode) return;
    this.status.set('loading');
    this.loadingMessage.set('Carregando anos...');
    this.errorMessage.set(null);
    try {
        const years = await firstValueFrom(this.fipeService.getYears(this.vehicleType(), brandCode, modelCode));
        this.years.set(years);
        this.status.set('idle');
    } catch (error) {
        this.handleError('Não foi possível carregar os anos.');
    }
  }

  // Event handlers for search inputs
  onBrandSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.brandSearchTerm.set(term);
    if (this.selectedBrandCode() !== '') {
        this.selectedBrandCode.set('');
        this.resetSelections(false, true, true);
    }
  }

  onModelSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.modelSearchTerm.set(term);
    if (this.selectedModelCode() !== '') {
        this.selectedModelCode.set('');
        this.resetSelections(false, false, true);
    }
  }

  onYearSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.yearSearchTerm.set(term);
    if (this.selectedYearCode() !== '') {
        this.selectedYearCode.set('');
    }
  }

  // Select handlers for custom dropdowns
  selectBrand(brand: Brand): void {
    this.selectedBrandCode.set(brand.code);
    this.brandSearchTerm.set(brand.name);
    this.isBrandDropdownOpen.set(false);
    this.resetSelections(false, true, true);
    this.loadModels(brand.code);
  }

  selectModel(model: Model): void {
    this.selectedModelCode.set(model.code);
    this.modelSearchTerm.set(model.name);
    this.isModelDropdownOpen.set(false);
    this.resetSelections(false, false, true);
    this.loadYears(this.selectedBrandCode(), model.code);
  }
  
  selectYear(year: Year): void {
    this.selectedYearCode.set(year.code);
    this.yearSearchTerm.set(year.name);
    this.isYearDropdownOpen.set(false);
  }

  async getVehicleInfo(): Promise<void> {
    if (!this.isFormComplete()) return;

    this.status.set('loading');
    this.loadingMessage.set('Consultando valor FIPE...');
    this.errorMessage.set(null);
    this.vehicleDetails.set(null);
    this.vehicleImageUrl.set(null);
    this.listings.set([]);
    this.listingsStatus.set('idle');

    try {
      const details = await firstValueFrom(this.fipeService.getVehicleDetails(
        this.vehicleType(),
        this.selectedBrandCode(),
        this.selectedModelCode(),
        this.selectedYearCode()
      ));
      this.vehicleDetails.set(details);
      this.status.set('success');

      // Non-blocking calls for image and listings
      this.generateImage(details);
      this.findListings(details);
      
    } catch (error) {
       this.handleError('Não foi possível obter os detalhes do veículo.');
    }
  }

  private async generateImage(details: VehicleDetails): Promise<void> {
    try {
       this.loadingMessage.set('Gerando imagem com IA...');
       const imageUrl = await this.geminiService.generateVehicleImage(details);
       this.vehicleImageUrl.set(imageUrl);
    } catch(e) {
      console.error('Image generation failed', e);
      // Optionally set a placeholder or error image
      this.vehicleImageUrl.set(null);
    }
  }

  private async findListings(vehicle: VehicleDetails): Promise<void> {
    this.listingsStatus.set('loading');
    this.listings.set([]);
    try {
        const listingsData = await this.geminiService.searchForVehicleListings(vehicle);
        this.listings.set(listingsData || []);
        this.listingsStatus.set('success');
    } catch (error) {
        console.error('Error finding vehicle listings:', error);
        this.listingsStatus.set('error');
    }
  }
  
  getDomain(url: string): string {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
    } catch (e) {
        return '';
    }
  }

  private resetSelections(brand: boolean, model: boolean, year: boolean): void {
    if (brand) {
        this.selectedBrandCode.set('');
        this.brandSearchTerm.set('');
    }
    if (model) {
      this.selectedModelCode.set('');
      this.models.set([]);
      this.modelSearchTerm.set('');
    }
    if (year) {
      this.selectedYearCode.set('');
      this.years.set([]);
      this.yearSearchTerm.set('');
    }
    
    this.vehicleDetails.set(null);
    this.vehicleImageUrl.set(null);
    this.status.set('idle');
    this.listings.set([]);
    this.listingsStatus.set('idle');
  }

  private handleError(message: string): void {
    console.error(message);
    this.errorMessage.set(message);
    this.status.set('error');
  }
}