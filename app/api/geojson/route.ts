import { geoJsonStore } from "@/lib/geojson.store";
import { generateId, toFeatureCollection } from "@/lib/geojson.utils";
import { validateGeoJsonFeature } from "@/lib/geojson.validators";
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

    const result = validateGeoJsonFeature(parsedBody.data);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          errors: result.error.format(),
        },
        { status: 400 }
      );
    }

    const data = result.data;

    const feature = {
      ...data,
      id: generateId(),
    };

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

    return NextResponse.json(toFeatureCollection(features), { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao listar features" },
      { status: 500 }
    );
  }
}
