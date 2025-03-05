
import React, { useEffect, useState, useRef } from "react";

interface AnimatedGridProps {
  className?: string;
}

const AnimatedGrid: React.FC<AnimatedGridProps> = ({ className }) => {
  const [activeBlocks, setActiveBlocks] = useState<number[]>([]);
  const [hoverBlock, setHoverBlock] = useState<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  // Cores padronizadas para representar estados
  const statuses = [
    "bg-green-500", // confirmado (verde)
    "bg-yellow-500", // pendente (amarelo)
    "bg-red-500", // cancelado (vermelho)
  ];
  
  const blockStatusMap = useRef<Map<number, string>>(new Map());
  
  // Animação mais lenta com intervalo maior
  useEffect(() => {
    const totalBlocks = 24; // 4x6 grid
    const updateInterval = 3000; // 3 segundos entre atualizações - ainda mais lento
    
    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= updateInterval) {
        lastUpdateRef.current = timestamp;
        
        // Adicionar ou remover blocos aleatoriamente
        const newActiveBlock = Math.floor(Math.random() * totalBlocks);
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Salvar o status do bloco
        blockStatusMap.current.set(newActiveBlock, randomStatus);
        
        setActiveBlocks(prev => {
          // Se já temos muitos blocos ativos, remove um aleatório
          if (prev.length > 12) {
            const indexToRemove = Math.floor(Math.random() * prev.length);
            return [
              ...prev.slice(0, indexToRemove), 
              ...prev.slice(indexToRemove + 1),
              newActiveBlock
            ];
          }
          
          // Verificar se o bloco já está ativo
          if (!prev.includes(newActiveBlock)) {
            return [...prev, newActiveBlock];
          }
          
          return prev;
        });
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Gerar grade adaptativa com tamanho responsivo
  const renderGrid = () => {
    // Usar 3x4 para dispositivos móveis e 4x6 para desktop
    const isMobile = window.innerWidth < 640;
    const rows = isMobile ? 3 : 4;
    const cols = isMobile ? 4 : 6;
    const grid = [];
    
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        const blockIndex = i * cols + j;
        const isActive = activeBlocks.includes(blockIndex);
        const isHovered = hoverBlock === blockIndex;
        const blockStatus = blockStatusMap.current.get(blockIndex) || "bg-gray-200";
        
        row.push(
          <div
            key={blockIndex}
            className={`aspect-square rounded-md transition-all duration-700 transform 
              ${isActive ? blockStatus : "bg-gray-200"} 
              ${isHovered ? "scale-110 shadow-lg z-10" : "scale-100"}
              ${isActive && isHovered ? "rotate-3" : ""}
            `}
            onMouseEnter={() => setHoverBlock(blockIndex)}
            onMouseLeave={() => setHoverBlock(null)}
          />
        );
      }
      grid.push(
        <div key={i} className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {row}
        </div>
      );
    }
    
    return <div className="grid grid-rows-3 sm:grid-rows-4 gap-2">{grid}</div>;
  };
  
  return (
    <div className={`relative rounded-xl overflow-hidden p-3 sm:p-4 border border-muted shadow-sm hover:shadow-md transition-shadow ${className || ''}`}>
      {renderGrid()}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AnimatedGrid;
