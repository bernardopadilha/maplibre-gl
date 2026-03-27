import type { ZodError } from "zod";
import {
  featureCollectionOutputSchema,
  pointFeatureInputSchema,
  pointFeatureOutputSchema,
  routeFeatureIdSchema,
} from "./geojson.schema";

export function validatePointFeatureInput(data: unknown) {
  return pointFeatureInputSchema.safeParse(data);
}

export function validatePointFeatureOutput(data: unknown) {
  return pointFeatureOutputSchema.safeParse(data);
}

export function validateFeatureCollectionOutput(data: unknown) {
  return featureCollectionOutputSchema.safeParse(data);
}

export function parseRouteFeatureId(id: string) {
  return routeFeatureIdSchema.safeParse(id);
}

export function formatZodErrorBody(error: ZodError) {
  return {
    message: "Dados inválidos",
    errors: error.format(),
  };
}
