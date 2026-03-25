export async function GET() {
  const res = await fetch(
    `https://api.maptiler.com/maps/streets-v2/style.json?key=${process.env.MAPTILER_API_KEY}`
  );

  const data = await res.json();

  return Response.json(data);
}