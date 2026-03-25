import { z } from "zod";

export const positionSchema = z.tuple([
  z.number().min(-180).max(180), // longitude
  z.number().min(-90).max(90),   // latitude
]);

export const pointGeometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: positionSchema,
});

export const lineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(positionSchema).min(2),
});

export const polygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(positionSchema).min(4)),
});

export const geometrySchema = z.union([
  pointGeometrySchema,
  lineStringGeometrySchema,
  polygonGeometrySchema,
]);

export const propertiesSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
}).catchall(z.unknown());

export const geoJsonFeatureSchema = z.object({
  type: z.literal("Feature"),
  id: z.string().uuid().optional(),
  geometry: geometrySchema,
  properties: propertiesSchema,
});

export type GeoJsonFeatureInput = z.infer<typeof geoJsonFeatureSchema>;