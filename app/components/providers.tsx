"use client";

import { Toaster } from "@/components/ui/sonner";
import { FeatureProvider } from "@/contexts/feature-context";
import { MapProvider } from "@/contexts/map-context";
import { GeolocationFirstVisitDialog } from "./geolocation-first-visit-dialog";
import { TooltipProvider } from "./ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MapProvider>
      <FeatureProvider>
        <GeolocationFirstVisitDialog />
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </FeatureProvider>
    </MapProvider>
  );
}