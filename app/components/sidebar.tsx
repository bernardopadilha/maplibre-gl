"use client";

import { useFeatureMap } from "@/contexts/feature-context";
import { List, LocateFixed, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function Sidebar() {
  const {
    openSheetManualCreate,
    setFeaturesDrawerOpen,
    goToMyLocation,
  } = useFeatureMap();

  return (
    <aside
      className="pointer-events-auto fixed top-0 left-0 z-50 flex h-full w-20 flex-col items-center border-r border-border bg-card/95 py-4 text-card-foreground shadow-lg backdrop-blur-xs supports-backdrop-filter:bg-card/80"
      aria-label="Navegação lateral"
    >
      <Image
        src="/logo.svg"
        alt="Logo"
        width={42}
        height={41}
        priority
        className="h-10 w-auto"
      />

      <div className="mt-10 flex h-full w-full flex-col items-center justify-between px-4">
        <div className="flex w-full flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full py-4"
                type="button"
                onClick={() => openSheetManualCreate()}
              >
                <Plus className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-medium" side="right" sideOffset={14}>
              <p>Adicionar feature</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full py-4"
                type="button"
                onClick={() => setFeaturesDrawerOpen(true)}
              >
                <List className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-medium" side="right" sideOffset={14}>
              <p>Listar features</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="w-full">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full py-4"
                type="button"
                onClick={() => goToMyLocation()}
              >
                <LocateFixed className="size-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-medium" side="right" sideOffset={14}>
              <p>Onde estou (geolocalização)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
