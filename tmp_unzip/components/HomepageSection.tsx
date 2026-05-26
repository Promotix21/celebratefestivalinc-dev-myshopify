"use client";

import React from 'react';
import InteractiveMap from './MapComponent';
import { motion } from 'motion/react';
import { 
  Pizza, 
  MapPin, 
  ChevronRight,
  Store,
  Users,
  Truck,
  Award,
  ArrowRight,
  ChefHat,
  Coffee,
  Refrigerator,
  Microwave
} from 'lucide-react';

const PARTNERS = [
  {
    id: 1,
    name: "Curry Pizza House",
    logo: "https://picsum.photos/seed/currypizza/120/120",
    cuisine: "Pizza",
    icon: Pizza,
    locations: 12,
    states: "California, Texas",
  },
  {
    id: 2,
    name: "Hashtag Indian",
    logo: "https://picsum.photos/seed/hashtagindia/120/120",
    cuisine: "Indian Cuisine",
    icon: ChefHat,
    locations: 6,
    states: "California",
  },
  {
    id: 3,
    name: "Mylapore",
    logo: "https://picsum.photos/seed/mylapore/120/120",
    cuisine: "South Indian Cuisine",
    icon: Coffee,
    locations: 3,
    states: "California",
  }
];

const ALL_STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const ACTIVE_STATES = ALL_STATES.filter(s => !["AK", "ME", "MS", "SD", "VT"].includes(s));

const MAP_DATA = {
  "CA": { partners: 18, locations: 44, tags: "Bakery • Indian • Pizza" },
  "TX": { partners: 12, locations: 32, tags: "BBQ • Mexican • Bakery" },
};
// Fill rest
ACTIVE_STATES.forEach(state => {
  if (!MAP_DATA[state as keyof typeof MAP_DATA]) {
    (MAP_DATA as any)[state] = { partners: Math.floor(Math.random() * 5) + 1, locations: Math.floor(Math.random() * 10) + 2, tags: "Restaurant • Eatery" };
  }
});

export default function HomepageSection() {
  return (
    <section className="w-full bg-white flex flex-col font-sans py-10 md:py-14 border-y border-gray-200">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col">
      
      {/* 1. SECTION HEADER */}
      <div className="text-center mb-8">
        <h4 className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#d63f3a] mb-4">
          Trusted Partners
        </h4>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a365d] mb-4 tracking-tight">
          Trusted by Restaurants Across the U.S.
        </h2>
        <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Proudly supporting independent restaurants and growing chains with reliable commercial kitchen solutions nationwide.
        </p>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        
        {/* Left Side: Map Map */}
        <div className="flex flex-col relative w-full items-center justify-center">
          <div className="w-full h-auto px-4 lg:px-0">
             <InteractiveMap activeStates={ACTIVE_STATES} partnerData={MAP_DATA as any} overrideActiveColor="#d63f3a" />
          </div>
          {/* Legend */}
          <div className="flex items-center gap-6 mt-4 justify-center lg:justify-start w-full px-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-[#d63f3a] rounded-sm"></div>
              <span className="text-[10px] uppercase font-bold text-gray-500">States We Serve</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-[#e5e5e5] rounded-sm"></div>
              <span className="text-[10px] uppercase font-bold text-gray-400">States Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Right Side: Cards */}
        <div className="flex flex-col gap-3 justify-center">
          {PARTNERS.map((partner) => (
            <div 
              key={partner.id} 
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-3.5 flex items-center gap-4 cursor-pointer hover:border-[#1a365d]/20"
            >
              {/* Logo */}
              <div className="w-16 h-16 shrink-0 rounded-full border border-gray-100 flex items-center justify-center p-2 bg-white overflow-hidden shadow-sm">
                <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" />
              </div>
              
              {/* Details */}
              <div className="flex flex-col flex-1">
                <h3 className="text-lg font-bold text-[#1a365d] mb-1">{partner.name}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5 font-medium">
                  <partner.icon className="w-3.5 h-3.5 text-[#d63f3a]" />
                  {partner.cuisine}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {partner.states}
                </div>
              </div>

              {/* Badge Area */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-[#fff4f2] text-[#d63f3a] rounded-lg px-3 py-1.5 flex flex-col items-center justify-center min-w-[64px] border border-[#ffedea]">
                  <div className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" />
                    <span className="text-lg font-bold leading-none">{partner.locations}</span>
                  </div>
                  <span className="text-[7.5px] uppercase font-bold tracking-wider mt-0.5 opacity-80">Locations</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
          ))}

          <div className="mt-4 flex justify-end pr-4">
            <a href="#" className="flex items-center text-sm font-semibold text-[#d63f3a] hover:underline">
              View all restaurant partners <ArrowRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>

      </div>

      {/* 3. STATS ROW */}
      <div className="bg-gray-50/80 rounded-xl p-5 mb-8 border border-gray-100 hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200/60">
          
          <div className="flex items-center gap-4 xl:justify-center">
            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm shrink-0">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#d63f3a]">50+</span>
              <span className="text-[10px] font-bold text-[#1a365d] mt-1 relative -top-1">Restaurant Locations</span>
              <span className="text-[10px] text-gray-400">Supported Nationwide</span>
            </div>
          </div>

          <div className="flex items-center gap-3 xl:justify-center pt-5 md:pt-0 md:pl-6">
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm shrink-0">
              <Store className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#d63f3a]">150+</span>
              <span className="text-[10px] font-bold text-[#1a365d] mt-1 relative -top-1">Restaurant Brands</span>
              <span className="text-[10px] text-gray-400">Trust Our Equipment</span>
            </div>
          </div>

          <div className="flex items-center gap-3 xl:justify-center pt-5 xl:pt-0 xl:pl-6">
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm shrink-0">
              <Truck className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#d63f3a]">48</span>
              <span className="text-[10px] font-bold text-[#1a365d] mt-1 relative -top-1">States Covered</span>
              <span className="text-[10px] text-gray-400">Coast to Coast</span>
            </div>
          </div>

          <div className="flex items-center gap-3 xl:justify-center pt-5 md:pt-0 md:pl-6 xl:pt-0">
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm shrink-0">
              <Award className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#d63f3a]">10+</span>
              <span className="text-[10px] font-bold text-[#1a365d] mt-1 relative -top-1">Years of Partnership</span>
              <span className="text-[10px] text-gray-400">Supporting Food Businesses</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. FINAL CTA */}
      <div className="text-center relative py-2">
        <h4 className="text-sm font-bold text-[#1a365d] mb-4">
          Powering kitchens that serve thousands every day.
        </h4>
        <button className="bg-[#c22d28] hover:bg-[#a1231f] text-white px-8 py-3 rounded-lg font-bold text-sm transition-colors shadow-md shadow-red-900/20 inline-flex items-center gap-2">
          Explore Our Equipment <ArrowRight className="w-4 h-4" />
        </button>

        {/* Note: In a real app we would use SVG paths for silhouettes, here mimicking with subtle background icons floating */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5 flex items-center justify-between px-10 md:px-32 mix-blend-multiply">
          <Refrigerator className="w-24 h-24 md:w-32 md:h-32 text-gray-500" />
          <Microwave className="w-20 h-20 md:w-28 md:h-28 text-gray-500 hidden md:block" />
          <Store className="w-24 h-24 md:w-32 md:h-32 text-gray-500" />
          <Coffee className="w-16 h-16 md:w-28 md:h-28 text-gray-500 hidden md:block" />
        </div>
      </div>

      </div>
    </section>
  );
}
