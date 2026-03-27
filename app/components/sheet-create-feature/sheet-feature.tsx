"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { useSheetFeatureForm } from "./hooks/use-sheet-feature-form";
import type { SheetCreateFeatureProps } from "./types";

export type { PendingMapPoint, SheetFeatureMode, SheetCreateFeatureProps } from "./types";

export function SheetCreateFeature({
  open,
  onOpenChange,
  mode,
  initialPoint,
  editingFeature,
  draftSessionId,
  onLiveCoordinates,
  onSuccess,
}: SheetCreateFeatureProps) {
  const { register, handleSubmit, formState, submitting } = useSheetFeatureForm(
    {
      open,
      mode,
      initialPoint,
      editingFeature,
      draftSessionId,
      onLiveCoordinates,
      onSuccess,
      onOpenChange,
    }
  );

  const formReady = formState.isValid && !submitting;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            {mode === "edit" ? "Editar feature" : "Criar feature"}
          </SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? "Altere os dados e salve. O mapa acompanha as coordenadas ao digitar."
              : initialPoint
                ? "Ajuste as coordenadas se precisar — o mapa acompanha após você parar de digitar."
                : "Informe latitude e longitude ou clique no mapa. O marcador aparece com coordenadas válidas."}
          </SheetDescription>
        </SheetHeader>

        {open ? (
          <form
            id="create-feature-form"
            className="flex flex-1 flex-col gap-4 px-4"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="coord-lng"
              >
                Longitude
              </label>
              <Input
                id="coord-lng"
                inputMode="decimal"
                className="font-mono"
                autoComplete="off"
                aria-invalid={Boolean(formState.errors.lngStr)}
                {...register("lngStr")}
              />
            </div>
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="coord-lat"
              >
                Latitude
              </label>
              <Input
                id="coord-lat"
                inputMode="decimal"
                className="font-mono"
                autoComplete="off"
                aria-invalid={Boolean(formState.errors.latStr)}
                {...register("latStr")}
              />
            </div>
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="feature-name"
              >
                Nome <span className="text-destructive">*</span>
              </label>
              <Input
                id="feature-name"
                placeholder="Ex.: Marco de referência"
                autoComplete="off"
                aria-invalid={Boolean(formState.errors.name)}
                {...register("name")}
              />
            </div>
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-foreground"
                htmlFor="feature-description"
              >
                Descrição
              </label>
              <textarea
                id="feature-description"
                placeholder="Detalhes opcionais"
                rows={3}
                className={cn(
                  "min-h-0 resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-base outline-none transition-colors md:text-sm",
                  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                )}
                {...register("description")}
              />
            </div>
          </form>
        ) : null}

        <SheetFooter className="flex flex-row flex-wrap justify-end gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="create-feature-form"
            disabled={!formReady}
          >
            {submitting
              ? "Salvando…"
              : mode === "edit"
                ? "Salvar alterações"
                : "Criar feature"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
