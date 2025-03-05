
import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ViewSelectorProps {
  view: "day" | "week" | "month";
  setView: (view: "day" | "week" | "month") => void;
}

export function ViewSelector({ view, setView }: ViewSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={view === "day" ? "default" : "outline"}
            onClick={() => setView("day")}
          >
            Dia
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualizar por dia</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={view === "week" ? "default" : "outline"}
            onClick={() => setView("week")}
          >
            Semana
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualizar por semana</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
          >
            Mês
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Visualizar por mês</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
