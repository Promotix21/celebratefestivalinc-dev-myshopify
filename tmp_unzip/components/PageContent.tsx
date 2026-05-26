"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  MapPin, 
  Search, 
  Store, 
  CheckCircle2, 
  ArrowRight, 
  ChefHat, 
  Flame, 
  Pizza, 
  Coffee, 
  Utensils, 
  Headset
} from 'lucide-react';
import InteractiveMap from './MapComponent';

// Mock Data matches prompt instructions
const PARTNERS = [
  {
    id: 1,
    name: "Paris Baguette",
    logo: "https://picsum.photos/seed/parisbaguette/120/120",
    image: "https://picsum.photos/seed/paris_exterior/800/500",
    cuisine: "Bakery Café",
    icon: Coffee,
    locations: 42,
    states: ["CA", "TX", "NY", "NJ", "IL"],
  },
  {
    id: 2,
    name: "Tous les Jours",
    logo: "https://picsum.photos/seed/touslesjours/120/120",
    image: "https://picsum.photos/seed/tous_exterior/800/500",
    cuisine: "Bakery",
    icon: Coffee,
    locations: 36,
    states: ["CA", "TX", "NY", "GA"],
  },
  {
    id: 3,
    name: "Curry Pizza House",
    logo: "https://picsum.photos/seed/currypizza/120/120",
    image: "https://picsum.photos/seed/curry_exterior/800/500",
    cuisine: "Pizza",
    icon: Pizza,
    locations: 12,
    states: ["CA", "TX"],
  },
  {
    id: 4,
    name: "Hashtag India",
    logo: "https://picsum.photos/seed/hashtagindia/120/120",
    image: "https://picsum.photos/seed/hashtag_exterior/800/500",
    cuisine: "Indian Cuisine",
    icon: ChefHat,
    locations: 6,
    states: ["CA"],
  },
  {
    id: 5,
    name: "Mylapore",
    logo: "https://picsum.photos/seed/mylapore/120/120",
    image: "https://picsum.photos/seed/mylapore_exterior/800/500",
    cuisine: "South Indian Cuisine",
    icon: Flame,
    locations: 3,
    states: ["CA"],
  },
  {
    id: 6,
    name: "Deccan Morsels",
    logo: "https://picsum.photos/seed/deccan/120/120",
    image: "https://picsum.photos/seed/deccan_exterior/800/500",
    cuisine: "Indian Cuisine",
    icon: ChefHat,
    locations: 2,
    states: ["TX"],
  },
  {
    id: 7,
    name: "Bombay Bistro",
    logo: "https://picsum.photos/seed/bombay/120/120",
    image: "https://picsum.photos/seed/bombay_exterior/800/500",
    cuisine: "Indian Kitchen",
    icon: Utensils,
    locations: 4,
    states: ["NJ", "IL"],
  },
  {
    id: 8,
    name: "Seoul Bowls",
    logo: "https://picsum.photos/seed/seoul/120/120",
    image: "https://picsum.photos/seed/seoul_exterior/800/500",
    cuisine: "Korean Kitchen",
    icon: Flame,
    locations: 5,
    states: ["CA", "NV"],
  },
  {
    id: 9,
    name: "Café Aroma",
    logo: "https://picsum.photos/seed/aroma/120/120",
    image: "https://picsum.photos/seed/aroma_exterior/800/500",
    cuisine: "Coffee & Brunch",
    icon: Coffee,
    locations: 8,
    states: ["NY", "MA", "CT"],
  }
];

const ALL_STATES = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
const ACTIVE_STATES = ALL_STATES.filter(s => !["AK", "ME", "MS", "SD", "VT"].includes(s));

const MAP_DATA = {
  "CA": { partners: 18, locations: 44, tags: "Bakery • Indian • Pizza" },
  "TX": { partners: 12, locations: 32, tags: "BBQ • Mexican • Bakery" },
  "NY": { partners: 15, locations: 38, tags: "Deli • Pizza • Bakery" },
  "IL": { partners: 8, locations: 21, tags: "Pizza • Diner • Fast Casual" },
  "FL": { partners: 10, locations: 25, tags: "Seafood • Latin • Fast Food" },
  "GA": { partners: 7, locations: 18, tags: "Southern • Bakery • Cafe" },
  "NJ": { partners: 9, locations: 22, tags: "Diner • Italian • Indian" },
  "NV": { partners: 5, locations: 12, tags: "Buffet • Korean • Fast Food" },
  "MA": { partners: 6, locations: 14, tags: "Seafood • Coffee • Pub" },
  "CT": { partners: 4, locations: 9, tags: "Pizza • Coffee • Diner" },
};

// Fill in rest of active states with generic data for map interactions
ACTIVE_STATES.forEach(state => {
  if (!MAP_DATA[state as keyof typeof MAP_DATA]) {
    (MAP_DATA as any)[state] = { partners: Math.floor(Math.random() * 5) + 1, locations: Math.floor(Math.random() * 10) + 2, tags: "Restaurant • Eatery • Cafe" };
  }
});

export default function PageContent() {
  const [selectedState, setSelectedState] = useState<string>("All States");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Recently Added");

  // Filtering Logic
  const filteredPartners = PARTNERS.filter(partner => {
    const matchesState = selectedState === "All States" || partner.states.includes(selectedState);
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          partner.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  // Sorting Logic
  if (sortBy === "Alphabetical") {
    filteredPartners.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "Most Locations") {
    filteredPartners.sort((a, b) => b.locations - a.locations);
  } else if (sortBy === "Recently Added") {
    filteredPartners.sort((a, b) => a.id - b.id);
  }

  // Common quick states for chips
  const quickStates = ["All States", "CA", "TX", "NY", "FL", "IL"];

  return (
    <div className="w-full min-h-screen bg-[#f3f3f3] text-[#121212] flex flex-col font-sans">
      
      {/* Top Navigation / Header Area */}
      <nav className="h-14 bg-white border-b border-[#e5e5e5] px-6 lg:px-12 flex items-center shrink-0 z-50">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="font-serif font-bold text-xl md:text-2xl tracking-tighter text-[#1a365d]">CELEBRATE <span className="text-[#8b1538]">FESTIVAL</span></div>
            <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold hidden md:block">Commercial Kitchen Systems</div>
          </div>
          <div className="hidden md:flex space-x-8 text-xs font-semibold uppercase tracking-wider text-[#1a365d]">
            <a href="#" className="flex items-center h-14 hover:border-b-2 hover:border-[#1a365d] border-b-2 border-transparent">Equipment</a>
            <a href="#" className="flex items-center h-14 border-b-2 border-[#8b1538]">Partners</a>
            <a href="#" className="flex items-center h-14 hover:border-b-2 hover:border-[#1a365d] border-b-2 border-transparent">Case Studies</a>
            <a href="#" className="flex items-center h-14 hover:border-b-2 hover:border-[#1a365d] border-b-2 border-transparent">Contact</a>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="bg-white border-b border-[#e5e5e5] px-6 lg:px-12 py-6 md:py-10 flex shrink-0">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-8 items-center">
          
          {/* Left Column */}
          <div className="flex flex-col lg:w-1/2 lg:pr-12 justify-center">
            {/* Breadcrumb */}
            <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 flex items-center">
              <span className="text-gray-900">Home &gt; Our Restaurant Partners</span>
            </div>

            {/* Heading */}
            <h1 className="font-serif text-4xl lg:text-5xl font-bold leading-tight text-[#1a365d] mb-4">
              Trusted by Restaurants<br className="hidden md:block" /> Across the U.S.
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-6 max-w-md leading-relaxed">
              We provide high-performance commercial kitchen solutions for the nation&apos;s leading restaurant groups and culinary pioneers.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              <div className="border-l border-gray-200 pl-3">
                <div className="text-xl font-bold text-[#1a365d]">50+</div>
                <div className="text-[9px] uppercase text-gray-500">Locations</div>
              </div>
              <div className="border-l border-gray-200 pl-3">
                <div className="text-xl font-bold text-[#1a365d]">150+</div>
                <div className="text-[9px] uppercase text-gray-500">Brands</div>
              </div>
              <div className="border-l border-gray-200 pl-3">
                <div className="text-xl font-bold text-[#1a365d]">48</div>
                <div className="text-[9px] uppercase text-gray-500">States</div>
              </div>
              <div className="border-l border-gray-200 pl-3">
                <div className="text-xl font-bold text-[#1a365d]">10+</div>
                <div className="text-[9px] uppercase text-gray-500">Years</div>
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:w-1/2 relative flex items-center justify-center bg-gray-50 p-2 md:p-6 min-h-[300px]">
             <InteractiveMap activeStates={ACTIVE_STATES} partnerData={MAP_DATA as any} />
             
             {/* Simple Legend overlay */}
             <div className="absolute bottom-4 left-4 flex gap-4 text-[9px] uppercase tracking-tighter">
                <div className="flex items-center"><div className="w-2 h-2 bg-[#8b1538] mr-1"></div> Active Partners</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-[#ff6b6b] mr-1"></div> Hub Regions</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-[#e5e5e5] border border-gray-300 mr-1"></div> Coming Soon</div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. FILTERING + SEARCH SECTION */}
      <section className="bg-white px-6 lg:px-12 py-4 border-b border-[#e5e5e5] shrink-0">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row gap-4 justify-between items-center">
          
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {/* Dropdown */}
            <div className="shrink-0 relative">
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="appearance-none bg-white border border-[#e5e5e5] px-4 py-2 pr-8 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="All States">Filter by State</option>
                {ACTIVE_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
              <div className="absolute right-2 top-[30%] pointer-events-none text-gray-500 text-[8px]">▼</div>
            </div>

            {/* Chips */}
            <div className="flex space-x-2 shrink-0">
              {quickStates.map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedState(st)}
                  className={`px-3 py-2 text-[10px] font-bold uppercase tracking-tight transition-all border ${
                    selectedState === st 
                    ? 'bg-[#8b1538] border-[#8b1538] text-white' 
                    : 'bg-white border-[#e5e5e5] text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <div className="absolute left-2 text-[10px] top-[30%] pointer-events-none text-gray-400">🔍</div>
              <input 
                type="text" 
                placeholder="Search restaurant or brand..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs border border-[#e5e5e5] focus:outline-none bg-white"
              />
            </div>
            
            {/* Sort */}
            <div className="shrink-0 flex items-center relative">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-[#e5e5e5] text-xs py-2 pl-4 pr-8 text-gray-700 font-medium cursor-pointer focus:outline-none"
              >
                <option>Recently Added</option>
                <option>Alphabetical</option>
                <option>Most Locations</option>
              </select>
              <div className="absolute right-2 top-[30%] pointer-events-none text-gray-500 text-[8px]">▼</div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. RESTAURANT PARTNER GRID */}
      <section className="flex-1 px-6 lg:px-12 py-6 overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col h-full">
        
        {filteredPartners.length === 0 ? (
          <div className="py-20 text-center bg-white border border-[#e5e5e5]">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-[#1a365d] mb-2">No partners found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or searching for a different brand.</p>
            <button 
              onClick={() => { setSelectedState("All States"); setSearchQuery(""); }}
              className="mt-6 text-[#8b1538] font-bold text-[10px] uppercase tracking-wider hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full items-start pb-8">
            {filteredPartners.map((partner, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={partner.id} 
                className="group flex flex-col bg-white border border-[#e5e5e5] shadow-[0_4px_0_rgba(0,0,0,0.03)] hover:shadow-[0_8px_0_rgba(0,0,0,0.04)] transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Top Image */}
                <div className="w-full h-32 overflow-hidden relative bg-gray-200">
                  <img src={partner.image} alt={partner.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute top-2 right-2 bg-white/90 p-1 border border-gray-100 shadow-sm flex items-center justify-center w-8 h-8">
                     <img src={partner.logo} alt="" className="w-6 h-6 object-contain mix-blend-multiply" />
                  </div>
                  <div className="absolute bottom-2 left-3 text-white text-[10px] font-bold uppercase tracking-widest pointer-events-none drop-shadow-sm">{partner.name}</div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col">
                  
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 flex items-center gap-1">
                        <partner.icon className="w-3 h-3 text-gray-300" />
                        {partner.cuisine}
                      </span>
                      <span className="text-sm font-bold text-[#1a365d] group-hover:text-[#8b1538] transition-colors">{partner.name}</span>
                    </div>
                    
                    {/* Badge */}
                    <div className="bg-[#fff1f1] px-2 py-0.5 border border-[#ffdada]">
                      <span className="text-[10px] font-bold text-[#8b1538] whitespace-nowrap">{partner.locations} Locations</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-500 mb-2 leading-tight">
                    <span className="font-bold text-[#1a365d] block md:inline">Regions:</span> {partner.states.map(s => `${s} (${Math.ceil((MAP_DATA as any)[s]?.partners || 1)})`).join(" • ")}
                  </div>

                  <div className="mt-2 pt-2 border-t border-gray-50 flex justify-between items-center text-xs">
                    <a href="#" className="text-[10px] font-bold text-[#8b1538] uppercase tracking-wider group-hover:underline">
                      View Details &rarr;
                    </a>
                    <div className="w-5 h-5 bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#8b1538] group-hover:text-white transition-colors duration-300 pointer-events-none">
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>
      </section>

      {/* 4. BOTTOM CTA STRIP */}
      <section className="flex-none w-full bg-gradient-to-r from-[#1a365d] to-[#2d5a87] flex items-center px-6 lg:px-12 shrink-0">
        <div className="w-full max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between py-6 md:py-0 md:h-20 gap-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6 w-full">
            <span className="text-white font-serif italic text-lg opacity-90">Planning a new location?</span>
            <span className="text-gray-300 text-xs tracking-wide">Our experts are here to help you build a kitchen that works.</span>
          </div>
          
          <button className="shrink-0 w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#8b1538] to-[#ff6b6b] text-white text-[11px] font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-shadow border border-white/10">
            Request a Quote
          </button>
        </div>
      </section>

    </div>
  );
}
