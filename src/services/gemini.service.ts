import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { VehicleDetails } from '../models/fipe.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // This is the required way to initialize the API client.
    // The API key is sourced from a pre-configured environment variable.
    // Vercel requires the NEXT_PUBLIC_ prefix to expose the variable to the browser.
    if (!process.env.NEXT_PUBLIC_API_KEY) {
      console.error("NEXT_PUBLIC_API_KEY environment variable not set.");
      throw new Error("NEXT_PUBLIC_API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });
  }

  async generateVehicleImage(vehicle: VehicleDetails): Promise<string | null> {
    const prompt = `Uma foto de estúdio, de alta qualidade e realista de um ${vehicle.brand} ${vehicle.model} ano ${vehicle.modelYear}, cor Vermelha. Fundo neutro e limpo.`;

    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '16:9',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
      return null;
    } catch (error) {
      console.error('Error generating image with Gemini API:', error);
      throw new Error('Falha ao gerar a imagem do veículo.');
    }
  }

  async searchForVehicleListings(vehicle: VehicleDetails): Promise<any[]> {
    const prompt = `Encontre anúncios de venda recentes para um ${vehicle.brand} ${vehicle.model} ano ${vehicle.modelYear} no Brasil. Priorize sites como Webmotors, Mercado Livre e OLX.`;
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });

      return response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    } catch (error) {
      console.error('Error searching for vehicle listings:', error);
      throw new Error('Falha ao buscar anúncios de veículos.');
    }
  }
}