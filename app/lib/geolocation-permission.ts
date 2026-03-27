export type BrowserGeolocationGate =
  | "granted"
  | "denied"
  | "prompt"
  | "unsupported";

/**
 * Estado da permissão de geolocalização no navegador (Permissions API quando existir).
 */
export async function getBrowserGeolocationGate(): Promise<BrowserGeolocationGate> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }
  try {
    const status = await navigator.permissions.query({
      name: "geolocation",
    });
    if (status.state === "granted") return "granted";
    if (status.state === "denied") return "denied";
    return "prompt";
  } catch {
    /**
     * Safari antigo ou APIs parciais: não sabemos o estado sem pedir posição.
     * Tratamos como "prompt" para exibir o fluxo de consentimento do app.
     */
    return "prompt";
  }
}
