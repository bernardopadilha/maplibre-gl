export async function parseJsonBody(req: Request): Promise<
  { ok: true; data: unknown } | { ok: false }
> {
  try {
    const data = await req.json();
    return { ok: true, data };
  } catch {
    return { ok: false };
  }
}
