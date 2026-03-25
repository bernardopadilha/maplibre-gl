import { GeoJsonFeature } from "@/types/geojson";

class GeoJsonStore {
  private features = new Map<string, GeoJsonFeature>()

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