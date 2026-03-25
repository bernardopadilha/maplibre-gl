export type Position = [number, number];

export type GeometryType = "Point" | "LineString" | "Polygon";

export interface PointGeometry {
  type: "Point";
  coordinates: Position;
}
export interface LineStringGeometry {
  type: "LineString";
  coordinates: Position[];
}
export interface PolygonGeometry {
  type: "Polygon";
  coordinates: Position[][];
}

export type Geometry = PointGeometry | LineStringGeometry | PolygonGeometry;

export interface GeoJsonProperties {
  name: string;
  description?: string;
  [key: string]: unknown;
}

export interface FeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
  type: "Feature";
  id: string;
  geometry: Geometry;
  properties: GeoJsonProperties;
}
