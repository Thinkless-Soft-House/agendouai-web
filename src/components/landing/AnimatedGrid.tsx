
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGridProps {
  className?: string;
}

export function AnimatedGrid({ className }: AnimatedGridProps) {
  const [activeCell, setActiveCell] = useState<number | null>(4);
  const [hoverCell, setHoverCell] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  
  const colors = [
    "bg-primary/20",
    "bg-blue-500/20",
    "bg-green-500/20",
    "bg-amber-500/20",
    "bg-purple-500/20",
    "bg-pink-500/20"
  ];
  
  const statuses = [
    "Disponível",
    "Reservado",
    "Confirmado",
    "Em andamento",
    "Concluído",
    "Cancelado"
  ];

  useEffect(() => {
    // Animação automática
    intervalRef.current = window.setInterval(() => {
      setActiveCell(prev => {
        const newIndex = Math.floor(Math.random() * 6);
        return newIndex;
      });
    }, 2000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getCellStyle = (index: number) => {
    if (index === activeCell) {
      return `${colors[index]} scale-110 shadow-lg z-10 transition-all duration-500 ease-in-out`;
    }
    if (index === hoverCell) {
      return `${colors[index]} scale-105 shadow-md transition-all duration-300 ease-in-out`;
    }
    return `bg-gray-100 transition-all duration-300 ease-in-out hover:scale-105`;
  };

  return (
    <div className={cn("relative", className)}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full">
        <div className="w-full h-4 bg-gray-100 rounded-full mb-4 animate-pulse"></div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-md cursor-pointer flex items-center justify-center overflow-hidden transition-all duration-300",
                getCellStyle(index)
              )}
              onMouseEnter={() => setHoverCell(index)}
              onMouseLeave={() => setHoverCell(null)}
              onClick={() => setActiveCell(index)}
            >
              {index === activeCell && (
                <div className="text-xs font-medium text-center p-1 animate-fade-in">
                  {statuses[index]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -top-4 -right-4 bg-white p-3 rounded-lg shadow-lg animate-bounce delay-700">
        <div className="h-8 w-8 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-lg shadow-lg animate-pulse">
        <div className="h-8 w-8 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
