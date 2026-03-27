"use client";

import { GeoJsonApiError, deleteFeatureApi } from "@/lib/geojson-api";
import type { GeoJsonFeature, Position } from "@/types/geojson";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFeature } from "@/contexts/feature-context";
import { DeleteFeatureDialog } from "./delete-feature-dialog";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";

export function DrawerFeaturesList() {
  const {
    featureCollection,
    featuresDrawerOpen,
    setFeaturesDrawerOpen,
    focusFeatureOnMap,
    openSheetEdit,
    refreshFeatures,
    setHighlightedFeatureId,
  } = useFeature();

  const [pendingDelete, setPendingDelete] = useState<GeoJsonFeature | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteFeatureApi(pendingDelete.id);
      setHighlightedFeatureId((h) => (h === pendingDelete.id ? null : h));
      await refreshFeatures();
      setPendingDelete(null);
    } catch (e) {
      const msg =
        e instanceof GeoJsonApiError ? e.message : "Não foi possível excluir.";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }

  const features = featureCollection?.features ?? [];

  return (
    <>
      <Drawer
        open={featuresDrawerOpen}
        onOpenChange={setFeaturesDrawerOpen}
        direction="right"
      >
        <DrawerContent className="">
          <DrawerHeader className="text-left">
            <DrawerTitle>Features salvas</DrawerTitle>
            <DrawerDescription>
              Toque no item para centralizar no mapa. Edite ou exclua quando
              precisar.
            </DrawerDescription>
          </DrawerHeader>

          <div className="h-[min(60vh,480px)] overflow-y-auto px-4">
            <ul className="flex flex-col gap-2 pb-4">
              {features.length === 0 ? (
                <li className="text-sm text-muted-foreground">
                  Nenhuma feature ainda.
                </li>
              ) : (
                features
                  .filter((f) => f.geometry.type === "Point")
                  .map((f) => {
                    const [lng, lat] = f.geometry.coordinates as Position;
                    return (
                      <li
                        key={f.id}
                        className="rounded-lg border border-border bg-card/60 p-3 cursor-pointer"
                      >
                        <button
                          type="button"
                          className="flex w-full flex-col gap-1 text-left"
                          onClick={() => focusFeatureOnMap(f.id)}
                        >
                          <span className="font-medium text-foreground">
                            {f.properties.name}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0" />
                            {lat.toFixed(5)}, {lng.toFixed(5)}
                          </span>
                        </button>
                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setFeaturesDrawerOpen(false);
                              openSheetEdit(f);
                            }}
                          >
                            <Pencil className="size-3.5" />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                            onClick={() => setPendingDelete(f)}
                          >
                            <Trash2 className="size-3.5" />
                            Excluir
                          </Button>
                        </div>
                      </li>
                    );
                  })
              )}
            </ul>
          </div>

          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <DeleteFeatureDialog
        pendingDelete={pendingDelete}
        setPendingDelete={setPendingDelete}
        deleting={deleting}
        confirmDelete={confirmDelete}
      />
    </>
  );
}
