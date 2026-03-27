import { z } from "zod";

export const positionSchema = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

export const pointGeometrySchema = z.object({
  type: z.literal("Point"),
  coordinates: positionSchema,
});

export const lineStringGeometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(positionSchema).min(2),
});

function ringClosed(ring: [number, number][]) {
  if (ring.length < 4) return false;
  const [lng0, lat0] = ring[0]!;
  const [lngN, latN] = ring[ring.length - 1]!;
  return lng0 === lngN && lat0 === latN;
}

export const polygonGeometrySchema = z
  .object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(positionSchema).min(4)),
  })
  .superRefine((val, ctx) => {
    val.coordinates.forEach((ring, ringIndex) => {
      if (!ringClosed(ring as [number, number][])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Cada anel de Polygon GeoJSON deve ser fechado (primeiro vértice = último).",
          path: ["coordinates", ringIndex],
        });
      }
    });
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

export const pointFeatureSchema = geoJsonFeatureSchema.extend({
  geometry: pointGeometrySchema,
});

export type PointFeatureInput = z.infer<typeof pointFeatureSchema>;