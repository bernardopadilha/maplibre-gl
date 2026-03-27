import { GeoJsonFeature } from "@/types/geojson";
import { generateId } from "./geojson.utils";

class GeoJsonStore {
  private features = new Map<string, GeoJsonFeature>()

  constructor() {
    this.seed()
  }

  private seed() {
    const defaultFeatures: GeoJsonFeature = {
      id: generateId(),
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-49.356602, -28.6803484]
      },
      properties: {
        name: "eTopocart",
        description: "A Topocart é especialista em soluções inteligentes para as áreas de planejamento territorial, projetos de engenharia e urbanismo"
      }
    }

    this.features.set(defaultFeatures.id, defaultFeatures)
  }

  getAll(): GeoJsonFeature[] {
    return Array.from(this.features.values())
  }

  getById(id: string): GeoJsonFeature | null {
    return this.features.get(id) ?? null
  }

  create(feature: GeoJsonFeature): GeoJsonFeature {
    this.features.set(feature.id, feature)

    return feature
  }

  update(id: string, feature: GeoJsonFeature): GeoJsonFeature | null {
    if (!this.features.has(id)) return null
    this.features.set(id, feature)
    return feature
  }

  delete(id: string): boolean {
    return this.features.delete(id)
  }
}

export const geoJsonStore = new GeoJsonStore()