import { geoJsonStore } from "@/lib/geojson.store";
import { pointFeatureOutputSchema } from "@/lib/geojson.schema";
import {
  formatZodErrorBody,
  parseRouteFeatureId,
  validatePointFeatureInput,
  validatePointFeatureOutput,
} from "@/lib/geojson.validators";
import { parseJsonBody } from "@/lib/http/parse-json-body";
import { NextResponse } from "next/server";

function invalidIdResponse() {
  return NextResponse.json({ message: "ID da feature deve ser um UUID válido" }, { status: 400 });
}

export async function GET(
  _: Request,
  context: RouteContext<"/api/geojson/[id]">
) {
  const { id } = await context.params;

  const idCheck = parseRouteFeatureId(id);
  if (!idCheck.success) {
    return invalidIdResponse();
  }

  try {
    const feature = geoJsonStore.getById(id);

    if (!feature) {
      return NextResponse.json(
        { message: "Feature não encontrada" },
        { status: 404 }
      );
    }

    const result = validatePointFeatureOutput(feature);
    if (!result.success) {
      console.error("Feature inválida no store:", result.error.format());
      return NextResponse.json(
        {
          message: "Dados internos inconsistentes",
          errors: result.error.format(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
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

  const idCheck = parseRouteFeatureId(id);
  if (!idCheck.success) {
    return invalidIdResponse();
  }

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

    const existing = geoJsonStore.getById(id);

    if (!existing) {
      return NextResponse.json(
        { message: "Feature não encontrada" },
        { status: 404 }
      );
    }

    const updatedFeature = pointFeatureOutputSchema.parse({
      type: result.data.type,
      geometry: result.data.geometry,
      properties: result.data.properties,
      id,
    });

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
  context: RouteContext<"/api/geojson/[id]">
) {
  const { id } = await context.params;

  const idCheck = parseRouteFeatureId(id);
  if (!idCheck.success) {
    return invalidIdResponse();
  }

  const deleted = geoJsonStore.delete(id);

  if (!deleted) {
    return NextResponse.json(
      { message: "Feature não encontrada" },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
