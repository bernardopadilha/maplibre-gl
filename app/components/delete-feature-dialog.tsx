import type { GeoJsonFeature } from "@/types/geojson";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";

interface DeleteFeatureDialogProps {
  pendingDelete: GeoJsonFeature | null;
  setPendingDelete: (pendingDelete: GeoJsonFeature | null) => void;
  deleting: boolean;
  confirmDelete: () => void;
}

export function DeleteFeatureDialog(
  {
    pendingDelete,
    setPendingDelete,
    deleting,
    confirmDelete,
  }: DeleteFeatureDialogProps
) {
  return (
    <AlertDialog
      open={pendingDelete !== null}
      onOpenChange={(open) => !open && setPendingDelete(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir feature?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar esta feature?
            {pendingDelete ? (
              <>
                {" "}
                <strong className="text-foreground">
                  {pendingDelete.properties.name}
                </strong>
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={deleting}
            onClick={() => void confirmDelete()}
          >
            {deleting ? "Excluindo…" : "Excluir"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
