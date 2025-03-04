
import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepsProps {
  children: React.ReactNode;
  currentStep: number;
  className?: string;
}

interface StepProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Steps({ children, currentStep, className }: StepsProps) {
  const steps = React.Children.toArray(children) as React.ReactElement<StepProps>[];
  
  return (
    <div className={cn("space-y-8", className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  {
                    "border-primary bg-primary text-white": isCompleted || isCurrent,
                    "border-gray-300 text-gray-500": !isCompleted && !isCurrent,
                  }
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              <p
                className={cn("mt-2 text-xs font-medium", {
                  "text-primary": isCompleted || isCurrent,
                  "text-gray-500": !isCompleted && !isCurrent,
                })}
              >
                {step.props.title}
              </p>
              
              {/* Linha conectora entre os passos */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 h-0.5 -translate-y-1/2",
                    {
                      "bg-primary": index < currentStep,
                      "bg-gray-200": index >= currentStep,
                    }
                  )}
                  style={{
                    left: `calc(${(index + 0.5) * (100 / (steps.length - 1))}% - 40%)`,
                    width: `calc(${100 / (steps.length - 1)}% - 20%)`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {steps[currentStep]}
    </div>
  );
}

export function Step({ children, title, className }: StepProps) {
  return (
    <div className={cn("mt-6", className)}>
      {children}
    </div>
  );
}
