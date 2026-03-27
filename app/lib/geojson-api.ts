import type { FeatureCollection, GeoJsonFeature } from "@/types/geojson";

const BASE_URL = "/api/geojson";

export class GeoJsonApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "GeoJsonApiError";
    this.status = status;
    this.details = details;
  }
}

async function readErrorPayload(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function messageFromPayload(payload: unknown, fallback: string): string {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof (payload as { message: unknown }).message === "string"
  ) {
    return (payload as { message: string }).message;
  }
  return fallback;
}

export async function fetchFeatureCollection(): Promise<FeatureCollection> {
  const res = await fetch(BASE_URL);

  if (!res.ok) {
    const payload = await readErrorPayload(res);
    throw new GeoJsonApiError(
      messageFromPayload(payload, "Erro ao buscar features"),
      res.status,
      payload
    );
  }

  return res.json() as Promise<FeatureCollection>;
}

export async function createFeatureApi(
  feature: Omit<GeoJsonFeature, "id">
): Promise<GeoJsonFeature> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feature),
  });

  if (!res.ok) {
    const payload = await readErrorPayload(res);
    throw new GeoJsonApiError(
      messageFromPayload(payload, "Erro ao criar feature"),
      res.status,
      payload
    );
  }

  return res.json() as Promise<GeoJsonFeature>;
}

export async function updateFeatureApi(
  id: string,
  feature: Omit<GeoJsonFeature, "id">
): Promise<GeoJsonFeature> {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...feature, id }),
  });

  if (!res.ok) {
    const payload = await readErrorPayload(res);
    throw new GeoJsonApiError(
      messageFromPayload(payload, "Erro ao atualizar feature"),
      res.status,
      payload
    );
  }

  return res.json() as Promise<GeoJsonFeature>;
}

export async function deleteFeatureApi(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const payload = await readErrorPayload(res);
    throw new GeoJsonApiError(
      messageFromPayload(payload, "Erro ao excluir feature"),
      res.status,
      payload
    );
  }
}
