"use client";

import { useMap } from "@/contexts/map-context";
import { readGeolocationStoredState, writeGeolocationStoredState } from "@/lib/geolocation-consent.storage";
import { getBrowserGeolocationGate } from "@/lib/geolocation-permission";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type FirstVisitUi = "hidden" | "limited" | "request";

export function GeolocationFirstVisitDialog() {
  const { showUserLocationAtWhenReady } = useMap();
  const [ui, setUi] = useState<FirstVisitUi>("hidden");
  const [phase, setPhase] = useState<"checking" | "ready">("checking");
  const [allowLoading, setAllowLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = readGeolocationStoredState();

      if (stored.appConsent === "granted" || stored.appConsent === "declined") {
        if (!cancelled) setPhase("ready");
        return;
      }

      const gate = await getBrowserGeolocationGate();
      if (cancelled) return;

      if (gate === "denied" || gate === "unsupported") {
        if (stored.limitedFeaturesNoticeAck) {
          setPhase("ready");
          return;
        }
        setUi("limited");
        setPhase("ready");
        return;
      }

      setUi("request");
      setPhase("ready");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function acknowledgeLimited() {
    writeGeolocationStoredState({ limitedFeaturesNoticeAck: true });
    setUi("hidden");
  }

  function declineInAppRequest() {
    writeGeolocationStoredState({ appConsent: "declined" });
    setUi("hidden");
  }


  function allowInAppRequest() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização.");
      declineInAppRequest();
      return;
    }

    setAllowLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;
        writeGeolocationStoredState({ appConsent: "granted" });
        setAllowLoading(false);
        setUi("hidden");
        showUserLocationAtWhenReady(lng, lat);
      },
      (err) => {
        setAllowLoading(false);
        const denied = err.code === 1;
        toast.error(
          denied
            ? "Permissão negada. Ative a localização nas configurações do navegador para usar “Onde estou”."
            : "Não foi possível obter sua localização."
        );
        if (denied) {
          writeGeolocationStoredState({
            limitedFeaturesNoticeAck: true,
            appConsent: "declined",
          });
        } else {
          writeGeolocationStoredState({ appConsent: "declined" });
        }
        setUi("hidden");
      },
      { enableHighAccuracy: false, timeout: 20_000, maximumAge: 0 }
    );
  }

  if (phase === "checking") return null;

  return (
    <>
      <Dialog
        open={ui === "limited"}
        onOpenChange={(open) => {
          if (!open) acknowledgeLimited();
        }}
      >
        <DialogContent showCloseButton={!allowLoading}>
          <DialogHeader>
            <DialogTitle>Localização indisponível neste site</DialogTitle>
            <DialogDescription>
              O navegador bloqueou geolocalização ou ela não está disponível.
              Recursos como <strong>“Onde estou”</strong> podem não funcionar
              até você permitir o acesso nas configurações do navegador.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent sm:justify-end">
            <Button type="button" onClick={acknowledgeLimited}>
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={ui === "request"}
        onOpenChange={(open) => {
          if (!open && !allowLoading) {
            const s = readGeolocationStoredState();
            if (s.appConsent === "granted") return;
            declineInAppRequest();
          }
        }}
      >
        <DialogContent
          showCloseButton={!allowLoading}
          onPointerDownOutside={(e) => {
            if (allowLoading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (allowLoading) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Usar sua localização?</DialogTitle>
            <DialogDescription>
              Com sua permissão, podemos centralizar o mapa na sua posição ao
              usar <strong>“Onde estou”</strong>. Nada é enviado a servidores
              externos: a localização fica apenas no seu dispositivo para essa
              funcionalidade.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 border-0 bg-transparent sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={allowLoading}
              onClick={declineInAppRequest}
            >
              Agora não
            </Button>
            <Button
              type="button"
              disabled={allowLoading}
              onClick={allowInAppRequest}
            >
              {allowLoading ? "Aguardando navegador…" : "Permitir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
