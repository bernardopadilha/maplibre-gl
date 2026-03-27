import { NextResponse } from "next/server";

const NOMINATIM = "https://nominatim.openstreetmap.org/reverse";

type CacheEntry = { at: number; body: unknown };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 10 * 60 * 1000;

function cacheKey(lat: number, lng: number) {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");

  const lat = latRaw !== null ? Number.parseFloat(latRaw) : NaN;
  const lng = lngRaw !== null ? Number.parseFloat(lngRaw) : NaN;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ message: "lat e lng obrigatórios" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ message: "Coordenadas inválidas" }, { status: 400 });
  }

  const key = cacheKey(lat, lng);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json(hit.body);
  }

  try {
    const url = new URL(NOMINATIM);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("zoom", "18");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "TopocartChallenge/1.0 (dev; contact: https://topocart.com.br)",
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Falha no geocoding" },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      address?: Record<string, string>;
    };

    const a = data.address ?? {};
    const body = {
      road: a.road ?? a.pedestrian ?? a.path ?? a.footway ?? null,
      suburb:
        a.suburb ??
        a.neighbourhood ??
        a.quarter ??
        a.city_district ??
        null,
      city: a.city ?? a.town ?? a.village ?? a.municipality ?? null,
    };

    cache.set(key, { at: Date.now(), body });
    return NextResponse.json(body);
  } catch (e) {
    console.error("[reverse-geocode]", e);
    return NextResponse.json(
      { message: "Erro ao buscar endereço" },
      { status: 500 }
    );
  }
}
