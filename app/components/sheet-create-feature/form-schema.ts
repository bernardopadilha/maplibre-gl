import { z } from "zod";
import { isValidGeoPosition, parseCoordInput } from "./coord-utils";

export const sheetFeatureFormSchema = z
  .object({
    lngStr: z.string(),
    latStr: z.string(),
    name: z.string().min(1, "Informe um nome para a feature"),
    description: z.string(),
  })
  .superRefine((data, ctx) => {
    const lng = parseCoordInput(data.lngStr);
    const lat = parseCoordInput(data.latStr);
    if (lng === null || lat === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe longitude e latitude válidas.",
        path: ["lngStr"],
      });
      return;
    }
    if (!isValidGeoPosition(lng, lat)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Longitude (−180 a 180) ou latitude (−90 a 90) inválida.",
        path: ["lngStr"],
      });
    }
  });

export type SheetFeatureFormValues = z.infer<typeof sheetFeatureFormSchema>;
