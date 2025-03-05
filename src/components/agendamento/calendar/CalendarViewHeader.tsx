
import React from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CalendarViewHeaderProps {
  view: "day" | "week" | "month";
  date: Date;
  monthView: Date;
  isMonthPickerOpen: boolean;
  setIsMonthPickerOpen: (open: boolean) => void;
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  handlePreviousWeek: () => void;
  handleNextWeek: () => void;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
  handleMonthChange: (month: number) => void;
  handleYearChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  monthNames: string[];
}

export function CalendarViewHeader({
  view,
  date,
  monthView,
  isMonthPickerOpen,
  setIsMonthPickerOpen,
  handlePreviousDay,
  handleNextDay,
  handlePreviousWeek,
  handleNextWeek,
  handlePreviousMonth,
  handleNextMonth,
  handleMonthChange,
  handleYearChange,
  monthNames
}: CalendarViewHeaderProps) {
  return (
    <>
      {view === "day" && (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handlePreviousDay}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dia anterior</p>
            </TooltipContent>
          </Tooltip>
          <h2 className="text-lg font-semibold">{format(date, "dd 'de' MMMM", { locale: ptBR })}</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleNextDay}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próximo dia</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {view === "week" && (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Semana anterior</p>
            </TooltipContent>
          </Tooltip>
          <h2 className="text-lg font-semibold">
            {format(startOfWeek(date, { locale: ptBR }), "dd 'de' MMMM", { locale: ptBR })} -{" "}
            {format(endOfWeek(date, { locale: ptBR }), "dd 'de' MMMM", { locale: ptBR })}
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próxima semana</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {view === "month" && (
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mês anterior</p>
            </TooltipContent>
          </Tooltip>

          <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"ghost"}
                size="sm"
                className="font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>{format(monthView, "MMMM yyyy", { locale: ptBR })}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" side="bottom">
              <div className="grid grid-cols-4 gap-2 p-4">
                {monthNames.map((month, index) => (
                  <Button
                    key={month}
                    variant="ghost"
                    className={cn(
                      "h-9 w-full p-0 font-normal",
                      monthView.getMonth() === index ? "bg-accent text-accent-foreground" : ""
                    )}
                    onClick={() => {
                      handleMonthChange(index);
                      setIsMonthPickerOpen(false);
                    }}
                  >
                    {month}
                  </Button>
                ))}
              </div>
              <div className="flex items-center justify-between p-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsMonthPickerOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={monthView.getFullYear()}
                    onChange={handleYearChange}
                    className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setIsMonthPickerOpen(false)}
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próximo mês</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </>
  );
}
