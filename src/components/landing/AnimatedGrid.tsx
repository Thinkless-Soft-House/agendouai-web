
import React, { useEffect, useState } from "react";

interface AnimatedGridProps {
  className?: string;
}

const AnimatedGrid: React.FC<AnimatedGridProps> = ({ className }) => {
  const [activeBlocks, setActiveBlocks] = useState<number[]>([]);
  const [hoverBlock, setHoverBlock] = useState<number | null>(null);
  
  const statuses = [
    "bg-green-500", // confirmado
    "bg-yellow-500", // pendente
    "bg-red-500", // cancelado
    "bg-blue-500", // concluído
    "bg-purple-500", // reagendado
    "bg-gray-500", // expirado
  ];
  
  const getRandomStatus = () => statuses[Math.floor(Math.random() * statuses.length)];
  
  // Animação automática
  useEffect(() => {
    const intervalId = setInterval(() => {
      const totalBlocks = 24; // 4x6 grid
      const newActiveBlock = Math.floor(Math.random() * totalBlocks);
      
      setActiveBlocks(prev => {
        // Adicionar novo bloco ativo
        const newBlocks = [...prev, newActiveBlock];
        
        // Manter apenas os últimos 8 blocos
        if (newBlocks.length > 8) {
          return newBlocks.slice(newBlocks.length - 8);
        }
        return newBlocks;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Gerar grade de 4x6
  const renderGrid = () => {
    const rows = 4;
    const cols = 6;
    const grid = [];
    
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const blockIndex = i * cols + j;
        const isActive = activeBlocks.includes(blockIndex);
        const isHovered = hoverBlock === blockIndex;
        
        row.push(
          <div
            key={blockIndex}
            className={`aspect-square rounded-md transition-all duration-300 transform 
              ${isActive ? getRandomStatus() : "bg-gray-200"} 
              ${isHovered ? "scale-110 shadow-lg" : "scale-100"}
              ${isActive && isHovered ? "rotate-3" : ""}
            `}
            onMouseEnter={() => setHoverBlock(blockIndex)}
            onMouseLeave={() => setHoverBlock(null)}
          />
        );
      }
      grid.push(
        <div key={i} className="grid grid-cols-6 gap-2">
          {row}
        </div>
      );
    }
    
    return <div className="grid grid-rows-4 gap-2">{grid}</div>;
  };
  
  return (
    <div className={`relative rounded-xl overflow-hidden p-4 border border-muted shadow-sm hover:shadow-md transition-shadow ${className || ''}`}>
      {renderGrid()}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AnimatedGrid;
