"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  GeoJsonApiError,
  createFeatureApi,
  updateFeatureApi,
} from "@/lib/geojson-api";
import type { GeoJsonFeature } from "@/types/geojson";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldErrors } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { buildSheetFeatureDefaultValues } from "../default-values";
import {
  isValidGeoPosition,
  parseCoordInput,
} from "../coord-utils";
import {
  sheetFeatureFormSchema,
  type SheetFeatureFormValues,
} from "../form-schema";
import type { PendingMapPoint, SheetFeatureMode } from "../types";

const LIVE_COORD_DEBOUNCE_MS = 400;

function firstErrorMessage(
  errors: FieldErrors<SheetFeatureFormValues>
): string {
  for (const err of Object.values(errors)) {
    if (!err) continue;
    if (typeof err === "object" && "message" in err && err.message) {
      return String(err.message);
    }
  }
  return "Verifique o formulário.";
}

interface UseSheetFeatureFormOptions {
  open: boolean;
  mode: SheetFeatureMode;
  initialPoint: PendingMapPoint | null;
  editingFeature: GeoJsonFeature | null;
  draftSessionId: number;
  onLiveCoordinates?: (lng: number, lat: number) => void;
  onSuccess: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
}

export function useSheetFeatureForm({
  open,
  mode,
  initialPoint,
  editingFeature,
  draftSessionId,
  onLiveCoordinates,
  onSuccess,
  onOpenChange,
}: UseSheetFeatureFormOptions) {
  const [submitting, setSubmitting] = useState(false);
  const lastSessionRef = useRef<number | undefined>(undefined);
  const liveCoordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const form = useForm<SheetFeatureFormValues>({
    resolver: zodResolver(sheetFeatureFormSchema),
    defaultValues: buildSheetFeatureDefaultValues(
      mode,
      initialPoint,
      editingFeature
    ),
    mode: "onChange",
  });

  const { reset, handleSubmit, watch, register, formState } = form;
  const lngStr = watch("lngStr");
  const latStr = watch("latStr");

  useEffect(() => {
    if (liveCoordTimerRef.current) {
      clearTimeout(liveCoordTimerRef.current);
      liveCoordTimerRef.current = null;
    }
  }, [draftSessionId]);

  useEffect(() => {
    if (!open) return;
    const isNewSession = lastSessionRef.current !== draftSessionId;
    if (!isNewSession) return;

    lastSessionRef.current = draftSessionId;
    reset(buildSheetFeatureDefaultValues(mode, initialPoint, editingFeature));
    setSubmitting(false);
  }, [open, mode, initialPoint, editingFeature, draftSessionId, reset]);

  useEffect(() => {
    if (!open || !onLiveCoordinates) return;

    liveCoordTimerRef.current = setTimeout(() => {
      const lng = parseCoordInput(lngStr);
      const lat = parseCoordInput(latStr);
      if (lng === null || lat === null) return;
      if (!isValidGeoPosition(lng, lat)) {
        toast.error(
          "Longitude (−180 a 180) ou latitude (−90 a 90) inválida."
        );
        return;
      }
      onLiveCoordinates(lng, lat);
    }, LIVE_COORD_DEBOUNCE_MS);

    return () => {
      if (liveCoordTimerRef.current) {
        clearTimeout(liveCoordTimerRef.current);
        liveCoordTimerRef.current = null;
      }
    };
  }, [open, lngStr, latStr, onLiveCoordinates]);

  const submitValid = useCallback(
    async (data: SheetFeatureFormValues) => {
      const lng = parseCoordInput(data.lngStr);
      const lat = parseCoordInput(data.latStr);
      if (lng === null || lat === null) {
        toast.error("Informe longitude e latitude válidas.");
        return;
      }

      const trimmedName = data.name.trim();
      const body: Omit<GeoJsonFeature, "id"> = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        properties: {
          name: trimmedName,
          ...(data.description.trim()
            ? { description: data.description.trim() }
            : {}),
        },
      };

      setSubmitting(true);
      try {
        if (mode === "edit" && editingFeature) {
          await updateFeatureApi(editingFeature.id, body);
          toast.success("Feature atualizada!");
        } else {
          await createFeatureApi(body);
          toast.success("Feature criada!");
        }
        await onSuccess();
        onOpenChange(false);
      } catch (e) {
        const msg =
          e instanceof GeoJsonApiError
            ? e.message
            : "Não foi possível salvar.";
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    [mode, editingFeature, onSuccess, onOpenChange]
  );

  const submitInvalid = useCallback(
    (errors: FieldErrors<SheetFeatureFormValues>) => {
      toast.error(firstErrorMessage(errors));
    },
    []
  );

  return {
    register,
    handleSubmit: handleSubmit(submitValid, submitInvalid),
    formState,
    submitting,
  };
}
