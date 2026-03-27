/**
 * Preferências do usuário sobre geolocalização no app (apenas cliente).
 * Namespace versionado evita colisão e permite migrações futuras.
 */
const STORAGE_KEY = "topocart.geolocation.v1";

export type GeolocationAppConsent = "granted" | "declined";

export type GeolocationStoredState = {
  v: 1;
  /** Consentimento explícito no diálogo do app (não confundir com PermissionState do navegador). */
  appConsent: GeolocationAppConsent | null;
  /** Usuário confirmou o aviso de funcionalidades limitadas (permissão negada / indisponível). */
  limitedFeaturesNoticeAck: boolean;
};

const defaultState = (): GeolocationStoredState => ({
  v: 1,
  appConsent: null,
  limitedFeaturesNoticeAck: false,
});

function parse(raw: string | null): GeolocationStoredState | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<GeolocationStoredState>;
    if (data.v !== 1) return null;
    return {
      v: 1,
      appConsent:
        data.appConsent === "granted" || data.appConsent === "declined"
          ? data.appConsent
          : null,
      limitedFeaturesNoticeAck: Boolean(data.limitedFeaturesNoticeAck),
    };
  } catch {
    return null;
  }
}

export function readGeolocationStoredState(): GeolocationStoredState {
  if (typeof window === "undefined") return defaultState();
  try {
    return parse(localStorage.getItem(STORAGE_KEY)) ?? defaultState();
  } catch {
    return defaultState();
  }
}

export function writeGeolocationStoredState(
  patch: Partial<
    Pick<GeolocationStoredState, "appConsent" | "limitedFeaturesNoticeAck">
  >
) {
  if (typeof window === "undefined") return;
  try {
    const prev = readGeolocationStoredState();
    const next: GeolocationStoredState = {
      ...prev,
      ...patch,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode / quota */
  }
}
