
import { useState, useEffect } from "react";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const useCalendarNavigation = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [monthView, setMonthView] = useState<Date>(new Date());
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  useEffect(() => {
    setMonthView(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [date]);

  const handleMonthChange = (month: number) => {
    const newDate = new Date(monthView);
    newDate.setMonth(month);
    setMonthView(newDate);
    setDate(new Date(newDate.getFullYear(), newDate.getMonth(), date.getDate()));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const yearValue = parseInt(event.target.value);
    if (!isNaN(yearValue) && yearValue >= 1900 && yearValue <= 2100) {
      const newDate = new Date(monthView);
      newDate.setFullYear(yearValue);
      setMonthView(newDate);
      setDate(new Date(newDate.getFullYear(), newDate.getMonth(), date.getDate()));
    }
  };

  const handlePreviousDay = () => {
    setDate(prevDate => addDays(prevDate, -1));
  };

  const handleNextDay = () => {
    setDate(prevDate => addDays(prevDate, 1));
  };

  const handlePreviousWeek = () => {
    setDate(prevDate => addDays(prevDate, -7));
  };

  const handleNextWeek = () => {
    setDate(prevDate => addDays(prevDate, 7));
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    setDate(newDate);
    setMonthView(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    setDate(newDate);
    setMonthView(newDate);
  };

  const monthNames = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2021, i, 1), "MMMM", { locale: ptBR })
  );

  return {
    date,
    setDate,
    monthView,
    setMonthView,
    isMonthPickerOpen,
    setIsMonthPickerOpen,
    handleMonthChange,
    handleYearChange,
    handlePreviousDay,
    handleNextDay,
    handlePreviousWeek,
    handleNextWeek,
    handlePreviousMonth,
    handleNextMonth,
    monthNames
  };
};
