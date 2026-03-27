import { geoJsonStore } from "@/lib/geojson.store";
import { validateGeoJsonFeature } from "@/lib/geojson.validators";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  context: RouteContext<"/api/geojson/[id]">
) {
  const { id } = await context.params;

  try {
    const feature = geoJsonStore.getById(id);

    if (!feature) {
      return NextResponse.json(
        { message: "Feature não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao buscar feature" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: RouteContext<"/api/geojson/[id]">
) {
  const { id } = await context.params;

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

    const existing = geoJsonStore.getById(id);

    if (!existing) {
      return NextResponse.json(
        { message: "Feature não encontrada" },
        { status: 404 }
      );
    }

    const updatedFeature = {
      ...result.data,
      id,
    };

    geoJsonStore.update(id, updatedFeature);

    return NextResponse.json(updatedFeature, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erro ao atualizar feature" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const deleted = geoJsonStore.delete(id);

  if (!deleted) {
    return NextResponse.json(
      { message: "Feature não encontrada" },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}