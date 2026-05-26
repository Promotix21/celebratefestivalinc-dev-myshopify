"use client";

import React, { useState } from "react";
import USAMap from "react-usa-map";
import { motion, AnimatePresence } from "motion/react";

interface MapProps {
  activeStates: string[];
  partnerData: Record<string, { partners: number; locations: number; tags: string }>;
  overrideActiveColor?: string;
}

export default function InteractiveMap({ activeStates, partnerData, overrideActiveColor }: MapProps) {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: any | null;
  }>({ show: false, x: 0, y: 0, content: null });

  const handleMouseOver = (e: any) => {
    const stateAbbreviation = e.target.dataset.name;
    if (activeStates.includes(stateAbbreviation) && partnerData[stateAbbreviation]) {
      const data = partnerData[stateAbbreviation];
      const rect = e.target.getBoundingClientRect();
      
      setTooltip({
        show: true,
        x: e.clientX,
        y: e.clientY,
        content: {
          state: stateAbbreviation,
          ...data
        }
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };

  const handleMouseMove = (e: any) => {
    if (tooltip.show) {
      setTooltip(prev => ({
        ...prev,
        x: e.clientX,
        y: e.clientY
      }));
    }
  };

  const statesCustomConfig = () => {
    const config: any = {};
    // Base all active 
    activeStates.forEach(state => {
      config[state] = {
        fill: overrideActiveColor || "#ff6b6b", // Coral default
        clickHandler: () => {}
      };
    });
    
    // Make TX and CA burgundy as per original mockup, unless overridden
    if (!overrideActiveColor) {
      if (config['TX']) config['TX'].fill = "#8b1538";
      if (config['CA']) config['CA'].fill = "#8b1538";
    }
    
    // Deactivated states
    const inactive = ["AK", "ME", "MS", "SD", "VT"];
    inactive.forEach(state => {
      config[state] = {
        fill: "#e5e5e5", // Sleek light gray
      };
    });
    
    return config;
  };

  return (
    <div 
      className="relative w-full overflow-hidden map-container flex flex-col justify-center items-center"
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <USAMap 
        customize={statesCustomConfig()} 
        defaultFill="#e5e5e5"
      />
      
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip.show && tooltip.content && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 pointer-events-none bg-white border border-[#e5e5e5] p-3 shadow-lg flex flex-col space-y-1 w-40"
            style={{
              left: tooltip.x + 15,
              top: tooltip.y + 15
            }}
          >
            <div className="text-xs font-bold text-[#1a365d]">{tooltip.content.state}</div>
            <div className="text-[10px] text-gray-500">{tooltip.content.partners} Restaurant Partners</div>
            <div className="text-[10px] text-gray-500">{tooltip.content.locations} Supported Locations</div>
            <div className="flex space-x-1 mt-1">
              {tooltip.content.tags.split("•").slice(0, 2).map((t: string) => t.trim()).map((tag: string) => (
                  <span key={tag} className="px-1 bg-gray-100 text-[8px] rounded-sm text-gray-600">{tag}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
