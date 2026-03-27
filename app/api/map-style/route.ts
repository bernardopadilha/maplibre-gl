import { NextResponse } from "next/server";

const MAPTILER_STREETS = (key: string) =>
  `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(key)}`;

const MAPLIBRE_DEMO_STYLE = "https://demotiles.maplibre.org/style.json";

async function fetchStyleJson(url: string): Promise<{ ok: true; data: unknown } | { ok: false; status: number }> {
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  try {
    return { ok: true, data: await res.json() };
  } catch {
    return { ok: false, status: 502 };
  }
}

export async function GET() {
  const key = process.env.MAPTILER_API_KEY?.trim();

  try {
    if (key) {
      const primary = await fetchStyleJson(MAPTILER_STREETS(key));
      if (primary.ok) {
        return NextResponse.json(primary.data);
      }
      console.warn(
        `[map-style] MapTiler indisponível (HTTP ${primary.status}), usando estilo demo MapLibre.`
      );
    }

    const fallback = await fetchStyleJson(MAPLIBRE_DEMO_STYLE);
    if (fallback.ok) {
      return NextResponse.json(fallback.data);
    }

    return NextResponse.json(
      { message: "Não foi possível carregar nenhum estilo de mapa." },
      { status: 502 }
    );
  } catch (e) {
    console.error("[map-style]", e);
    return NextResponse.json(
      { message: "Erro interno ao carregar o estilo do mapa." },
      { status: 500 }
    );
  }
}
