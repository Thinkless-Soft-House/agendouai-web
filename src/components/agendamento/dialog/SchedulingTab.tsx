
import React from "react";
import {
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { TimeSlotSelector } from "@/components/agendamento/TimeSlotSelector";
import { UseFormReturn } from "react-hook-form";
import { Particao } from "@/pages/Particoes";
import { z } from "zod";
import { agendamentoSchema } from "./schema";

type AgendamentoFormValues = z.infer<typeof agendamentoSchema>;

interface SchedulingTabProps {
  form: UseFormReturn<AgendamentoFormValues>;
  particoes: Particao[];
  handleTimeSlotSelect: (horarioInicio: string, horarioFim: string) => void;
}

export function SchedulingTab({
  form,
  particoes,
  handleTimeSlotSelect,
}: SchedulingTabProps) {
  return (
    <FormField
      control={form.control}
      name="data"
      render={({ field }) => (
        <FormItem>
          <TimeSlotSelector
            date={field.value}
            onDateChange={(newDate) => form.setValue("data", newDate)}
            selectedParticaoId={form.getValues("particaoId")}
            particoes={particoes}
            selectedHorarioInicio={form.getValues("horarioInicio")}
            selectedHorarioFim={form.getValues("horarioFim")}
            onTimeSlotSelect={handleTimeSlotSelect}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
