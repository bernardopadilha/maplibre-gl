import { geoJsonStore } from "@/lib/geojson.store";
import { generateId, toFeatureCollection } from "@/lib/geojson.utils";
import {
  formatZodErrorBody,
  validateFeatureCollectionOutput,
  validatePointFeatureInput,
} from "@/lib/geojson.validators";
import { pointFeatureOutputSchema } from "@/lib/geojson.schema";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const parsedBody = await parseJsonBody(req);
    if (!parsedBody.ok) {
      return NextResponse.json(
        { message: "Corpo da requisição não é JSON válido" },
        { status: 400 }
      );
    }

    const result = validatePointFeatureInput(parsedBody.data);

    if (!result.success) {
      return NextResponse.json(formatZodErrorBody(result.error), {
        status: 400,
      });
    }

    const feature = pointFeatureOutputSchema.parse({
      type: result.data.type,
      geometry: result.data.geometry,
      properties: result.data.properties,
      id: generateId(),
    });

    geoJsonStore.create(feature);

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao criar feature" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const features = geoJsonStore.getAll();
    const collection = toFeatureCollection(features);

    const result = validateFeatureCollectionOutput(collection);

    if (!result.success) {
      console.error("Coleção inconsistente com Zod:", result.error.format());
      return NextResponse.json(
        {
          message: "Dados internos inconsistentes",
          errors: result.error.format(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao listar features" },
      { status: 500 }
    );
  }
}
