import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  ShieldAlert, 
  Navigation2, 
  Layers, 
  Train, 
  GraduationCap, 
  Activity, 
  ShoppingBag, 
  Eye, 
  EyeOff,
  Flame,
  Maximize2,
  Info
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  selectedCity: string;
  selectedLocality: string;
  onLocalitySelect?: (locality: string) => void;
  locationScore?: number;
}

interface LocalityProfile {
  id: string;
  name: string;
  coordinates: [number, number];
  pricePerSqft: number;
  crimeRate: number;
  desirability: number;
  zoning: string;
}

interface POI {
  id: string;
  name: string;
  category: 'metro' | 'school' | 'hospital' | 'mall';
  coordinates: [number, number];
  details: string;
}

interface CrimePoint {
  id: string;
  coordinates: [number, number];
  intensity: number;
  description: string;
}

// 1. Unified geographic coordinate mapping for the 5 key metropolitan regions
const CITY_LOCALITIES: Record<string, LocalityProfile[]> = {
  'New York': [
    { id: 'Downtown', name: 'Downtown (Wall St)', coordinates: [40.7061, -74.0092], pricePerSqft: 1450, crimeRate: 0.4, desirability: 9.8, zoning: 'Mixed Use' },
    { id: 'Uptown', name: 'Uptown (Manhattan)', coordinates: [40.7736, -73.9712], pricePerSqft: 1650, crimeRate: 0.3, desirability: 9.5, zoning: 'Residential High' },
    { id: 'Waterfront', name: 'Waterfront (Brooklyn)', coordinates: [40.7061, -73.9969], pricePerSqft: 1200, crimeRate: 0.6, desirability: 9.0, zoning: 'Commercial' },
    { id: 'Westside', name: 'Westside (Chelsea)', coordinates: [40.7465, -74.0014], pricePerSqft: 1100, crimeRate: 0.5, desirability: 8.8, zoning: 'Mixed Use' },
    { id: 'Suburbs', name: 'Suburbs (Long Island)', coordinates: [40.7282, -73.7949], pricePerSqft: 650, crimeRate: 0.2, desirability: 7.2, zoning: 'Residential Low' }
  ],
  'Los Angeles': [
    { id: 'Downtown', name: 'Downtown (LA Live)', coordinates: [34.0444, -118.2673], pricePerSqft: 950, crimeRate: 1.4, desirability: 8.2, zoning: 'Commercial' },
    { id: 'Uptown', name: 'Uptown (Beverly Hills)', coordinates: [34.0736, -118.4004], pricePerSqft: 1800, crimeRate: 0.4, desirability: 9.9, zoning: 'Residential Low' },
    { id: 'Waterfront', name: 'Waterfront (Santa Monica)', coordinates: [34.0194, -118.4912], pricePerSqft: 1500, crimeRate: 0.5, desirability: 9.7, zoning: 'Mixed Use' },
    { id: 'Westside', name: 'Westside (Culver City)', coordinates: [34.0211, -118.3965], pricePerSqft: 1100, crimeRate: 0.8, desirability: 9.1, zoning: 'Commercial' },
    { id: 'Suburbs', name: 'Suburbs (Pasadena)', coordinates: [34.1478, -118.1445], pricePerSqft: 750, crimeRate: 0.3, desirability: 8.5, zoning: 'Residential Mid' }
  ],
  'Chicago': [
    { id: 'Downtown', name: 'Downtown (The Loop)', coordinates: [41.8786, -87.6251], pricePerSqft: 750, crimeRate: 1.2, desirability: 8.5, zoning: 'Commercial' },
    { id: 'Uptown', name: 'Uptown (Lincoln Park)', coordinates: [41.9214, -87.6513], pricePerSqft: 900, crimeRate: 0.6, desirability: 9.2, zoning: 'Residential High' },
    { id: 'Waterfront', name: 'Waterfront (Lake Shore)', coordinates: [41.8919, -87.6105], pricePerSqft: 1100, crimeRate: 0.7, desirability: 9.5, zoning: 'Mixed Use' },
    { id: 'Westside', name: 'Westside (Wicker Park)', coordinates: [41.9088, -87.6775], pricePerSqft: 650, crimeRate: 1.1, desirability: 8.0, zoning: 'Mixed Use' },
    { id: 'Suburbs', name: 'Suburbs (Naperville)', coordinates: [41.7508, -88.1535], pricePerSqft: 450, crimeRate: 0.1, desirability: 7.5, zoning: 'Residential Low' }
  ],
  'Houston': [
    { id: 'Downtown', name: 'Downtown (Theater District)', coordinates: [29.7619, -95.3663], pricePerSqft: 450, crimeRate: 1.6, desirability: 7.8, zoning: 'Commercial' },
    { id: 'Uptown', name: 'Uptown (Galleria)', coordinates: [29.7397, -95.4634], pricePerSqft: 600, crimeRate: 0.8, desirability: 8.6, zoning: 'Mixed Use' },
    { id: 'Waterfront', name: 'Waterfront (Clear Lake)', coordinates: [29.5519, -95.0974], pricePerSqft: 520, crimeRate: 0.4, desirability: 8.2, zoning: 'Residential Low' },
    { id: 'Westside', name: 'Westside (Energy Corridor)', coordinates: [29.7825, -95.6267], pricePerSqft: 380, crimeRate: 0.5, desirability: 7.9, zoning: 'Commercial' },
    { id: 'Suburbs', name: 'Suburbs (The Woodlands)', coordinates: [30.1658, -95.4613], pricePerSqft: 400, crimeRate: 0.2, desirability: 8.4, zoning: 'Residential Low' }
  ],
  'Miami': [
    { id: 'Downtown', name: 'Downtown (Brickell)', coordinates: [25.7592, -80.1934], pricePerSqft: 1100, crimeRate: 0.9, desirability: 9.4, zoning: 'Mixed Use' },
    { id: 'Uptown', name: 'Uptown (Design District)', coordinates: [25.8135, -80.1918], pricePerSqft: 950, crimeRate: 0.7, desirability: 9.1, zoning: 'Commercial' },
    { id: 'Waterfront', name: 'Waterfront (Miami Beach)', coordinates: [25.7907, -80.1300], pricePerSqft: 1650, crimeRate: 0.4, desirability: 9.9, zoning: 'Residential High' },
    { id: 'Westside', name: 'Westside (Doral)', coordinates: [25.8195, -80.3553], pricePerSqft: 550, crimeRate: 0.5, desirability: 8.0, zoning: 'Mixed Use' },
    { id: 'Suburbs', name: 'Suburbs (Coral Gables)', coordinates: [25.7215, -80.2684], pricePerSqft: 850, crimeRate: 0.2, desirability: 8.9, zoning: 'Residential Low' }
  ]
};

// 2. Deterministic POIs generator around the selected locality's coordinates
const generatePOIsAndHeatmap = (localityId: string, center: [number, number]) => {
  const [lat, lng] = center;

  const pois: POI[] = [
    {
      id: `${localityId}-metro-1`,
      name: `${localityId} Metro Station (Red Line)`,
      category: 'metro',
      coordinates: [lat + 0.0031, lng - 0.0028],
      details: 'Transit Hub • 4 min walk • Express commuter connection'
    },
    {
      id: `${localityId}-metro-2`,
      name: `${localityId} East Subway Link`,
      category: 'metro',
      coordinates: [lat - 0.0039, lng + 0.0044],
      details: 'Commuter Link • 8 min walk • Grade-separated low-vibration lane'
    },
    {
      id: `${localityId}-school-1`,
      name: `Academy of ${localityId}`,
      category: 'school',
      coordinates: [lat - 0.0048, lng - 0.0041],
      details: 'Preschool - Grade 12 • GreatSchools Rating: 9/10 • Blue Ribbon'
    },
    {
      id: `${localityId}-school-2`,
      name: `${localityId} International School`,
      category: 'school',
      coordinates: [lat + 0.0054, lng + 0.0028],
      details: 'Charter High • STEM specialized curriculum • Extensive athletic facilities'
    },
    {
      id: `${localityId}-hospital-1`,
      name: `${localityId} Mercy Memorial Hospital`,
      category: 'hospital',
      coordinates: [lat + 0.0059, lng - 0.0058],
      details: 'Level I Trauma emergency center • Top-rated regional pediatric wing'
    },
    {
      id: `${localityId}-mall-1`,
      name: `${localityId} Galleria Plaza`,
      category: 'mall',
      coordinates: [lat - 0.0052, lng + 0.0062],
      details: 'High-end mixed retail space • Whole Foods Grocery anchor • 18 specialty bistros'
    }
  ];

  const crimePoints: CrimePoint[] = [
    {
      id: `${localityId}-crime-1`,
      coordinates: [lat + 0.0041, lng - 0.0018],
      intensity: 0.65,
      description: 'Minor commercial foot-traffic zone'
    },
    {
      id: `${localityId}-crime-2`,
      coordinates: [lat - 0.0033, lng - 0.0039],
      intensity: 0.35,
      description: 'Very quiet low-density residential lane'
    },
    {
      id: `${localityId}-crime-3`,
      coordinates: [lat + 0.0019, lng + 0.0049],
      intensity: 0.50,
      description: 'Localized boulevard speed-monitoring zone'
    }
  ];

  return { pois, crimePoints };
};

// Sub-component to recode and animate center shifts
const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

// Sub-component to monitor map state and zoom events
interface MapEventsHandlerProps {
  onZoomChange: (zoom: number) => void;
}
const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({ onZoomChange }) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    }
  });
  return null;
};

// 3. Custom HTML Leaflet Icons styled with Tailwind CSS
const createPropertyIcon = () => L.divIcon({
  html: `<div class="relative flex items-center justify-center w-10 h-10">
    <span class="absolute w-10 h-10 rounded-full bg-emerald-500/35 dark:bg-emerald-400/35 animate-ping"></span>
    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 text-white shadow-lg scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </div>
  </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const createOtherLocalityIcon = (name: string) => L.divIcon({
  html: `<div class="flex flex-col items-center justify-center group cursor-pointer">
    <div class="flex items-center justify-center w-7 h-7 rounded-full bg-slate-700 border-2 border-white dark:border-slate-800 text-white shadow-md hover:bg-emerald-500 hover:scale-110 transition-all">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
    </div>
    <span class="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold mt-1 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm transition-colors group-hover:text-emerald-500">${name.split(' (')[0]}</span>
  </div>`,
  className: '',
  iconSize: [80, 45],
  iconAnchor: [40, 15],
  popupAnchor: [0, -15]
});

const createClusterIcon = (count: number) => L.divIcon({
  html: `<div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 text-white font-mono text-xs font-black shadow-lg cursor-pointer">
    <span class="absolute inset-0 rounded-full bg-indigo-500/25 animate-ping"></span>
    <span>${count}</span>
  </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

const createMetroIcon = () => L.divIcon({
  html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 text-white shadow-md hover:scale-110 transition-all cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-train"><path d="M4 11V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><path d="M4 18V11h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><path d="M8 15h8"/><path d="m14 20 3 3"/><path d="m10 20-3 3"/><path d="M14 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const createSchoolIcon = () => L.divIcon({
  html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900 text-white shadow-md hover:scale-110 transition-all cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/><path d="M21.5 12v6"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const createHospitalIcon = () => L.divIcon({
  html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900 text-white shadow-md hover:scale-110 transition-all cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-activity"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const createMallIcon = () => L.divIcon({
  html: `<div class="flex items-center justify-center w-7 h-7 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900 text-white shadow-md hover:scale-110 transition-all cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

export const Map: React.FC<MapProps> = ({
  selectedCity = 'Chicago',
  selectedLocality = 'Downtown',
  onLocalitySelect,
  locationScore = 7.5
}) => {
  // 4. Reactive Dark Mode Tracker (directly listens to ClassList modifications on root html)
  const [isDark, setIsDark] = useState<boolean>(() => document.documentElement.classList.contains('dark'));
  const [zoom, setZoom] = useState<number>(13);
  
  // Layer Filters Configuration State
  const [activeFilters, setActiveFilters] = useState({
    metro: true,
    school: true,
    hospital: true,
    mall: true,
    heatmap: true,
    cluster: true
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Pins for the selected city
  const cityPins = CITY_LOCALITIES[selectedCity] || CITY_LOCALITIES['Chicago'];
  const activeLocalityProfile = cityPins.find(p => p.id === selectedLocality) || cityPins[0];
  const activeCoordinates = activeLocalityProfile.coordinates;

  // Generate dynamic contextual POIs based on the active neighborhood center
  const { pois, crimePoints } = generatePOIsAndHeatmap(activeLocalityProfile.id, activeCoordinates);

  // 5. Greedily cluster active POIs based on proximity threshold when Map Zoom level is low
  const getClustersOrPOIs = () => {
    const activePOIs = pois.filter(poi => {
      if (poi.category === 'metro' && !activeFilters.metro) return false;
      if (poi.category === 'school' && !activeFilters.school) return false;
      if (poi.category === 'hospital' && !activeFilters.hospital) return false;
      if (poi.category === 'mall' && !activeFilters.mall) return false;
      return true;
    });

    // If clustering is disabled or zoom is high enough, render individual elements
    if (!activeFilters.cluster || zoom >= 14) {
      return activePOIs.map(p => ({ isCluster: false, ...p }));
    }

    const clusters: any[] = [];
    const visited = new Set<string>();
    const clusterThreshold = 0.007; // Degree threshold

    activePOIs.forEach(poi => {
      if (visited.has(poi.id)) return;

      const closePOIs = activePOIs.filter(p => {
        if (visited.has(p.id)) return false;
        const dLat = p.coordinates[0] - poi.coordinates[0];
        const dLng = p.coordinates[1] - poi.coordinates[1];
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);
        return distance < clusterThreshold;
      });

      if (closePOIs.length > 1) {
        let sumLat = 0;
        let sumLng = 0;
        closePOIs.forEach(p => {
          sumLat += p.coordinates[0];
          sumLng += p.coordinates[1];
          visited.add(p.id);
        });
        clusters.push({
          isCluster: true,
          id: `cluster-${poi.id}`,
          coordinates: [sumLat / closePOIs.length, sumLng / closePOIs.length] as [number, number],
          count: closePOIs.length,
          points: closePOIs
        });
      } else {
        visited.add(poi.id);
        clusters.push({
          isCluster: false,
          ...poi
        });
      }
    });

    return clusters;
  };

  const processedPOIs = getClustersOrPOIs();

  // Dynamic sleek CartoDB basemap styling based on current app theme state
  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  const toggleFilter = (key: keyof typeof activeFilters) => {
    setActiveFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div id="spatial-mapping-container" className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
      
      {/* CSS Overrides to beautifully integrate Leaflet popups inside our high-fidelity theme */}
      <style>{`
        .leaflet-container {
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background-color: white !important;
          color: #1e293b !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          border: 1px solid #e2e8f0;
          padding: 2px;
        }
        .leaflet-popup-tip {
          background-color: white !important;
        }
        .dark .leaflet-popup-content-wrapper {
          background-color: #0f172a !important;
          color: #f1f5f9 !important;
          border-color: #1e293b;
        }
        .dark .leaflet-popup-tip {
          background-color: #0f172a !important;
        }
        .leaflet-popup-content {
          margin: 10px 12px !important;
          line-height: 1.4;
        }
      `}</style>

      {/* Map Header details */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500">
            <Navigation2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Interactive GIS Analytics</h4>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">Local GIS Map Engine</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-md">
            {selectedCity}
          </span>
        </div>
      </div>

      {/* Interactive GIS Control Toggles */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => toggleFilter('metro')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
            activeFilters.metro
              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Train className="w-3.5 h-3.5" />
          <span>Metro</span>
          {activeFilters.metro ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => toggleFilter('school')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
            activeFilters.school
              ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Schools</span>
          {activeFilters.school ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => toggleFilter('hospital')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
            activeFilters.hospital
              ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Hospitals</span>
          {activeFilters.hospital ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => toggleFilter('mall')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
            activeFilters.mall
              ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Malls</span>
          {activeFilters.mall ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => toggleFilter('heatmap')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
            activeFilters.heatmap
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Flame className="w-3.5 h-3.5 animate-pulse" />
          <span>Crime Heatmap</span>
          {activeFilters.heatmap ? <Eye className="w-3 h-3 ml-0.5" /> : <EyeOff className="w-3 h-3 ml-0.5" />}
        </button>

        <button
          onClick={() => toggleFilter('cluster')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
            activeFilters.cluster
              ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Clustering</span>
          <span className="text-[10px] font-mono px-1 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
            {activeFilters.cluster ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Primary Leaflet Container Viewport */}
      <div id="spatial-canvas" className="relative h-[340px] sm:h-[390px] w-full rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-inner z-10 bg-slate-100 dark:bg-slate-950">
        
        <MapContainer 
          center={activeCoordinates} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="h-full w-full"
          zoomControl={true}
        >
          {/* Recenter viewport animators */}
          <MapRecenter center={activeCoordinates} zoom={13} />
          <MapEventsHandler onZoomChange={setZoom} />

          {/* CartoDB Map Tiles */}
          <TileLayer
            url={tileUrl}
            attribution={attribution}
          />

          {/* 6. Heatmap Layer: Red overlapping circles representing Crime Density */}
          {activeFilters.heatmap && crimePoints.map(point => (
            <Circle
              key={point.id}
              center={point.coordinates}
              radius={240 * point.intensity}
              pathOptions={{
                fillColor: '#f43f5e',
                fillOpacity: 0.16 * point.intensity,
                color: '#f43f5e',
                weight: 1,
                opacity: 0.3 * point.intensity
              }}
            >
              <Popup>
                <div className="font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400 text-xs uppercase tracking-wide">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Crime Heat Zone</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {point.description} • Index: <span className="font-mono font-bold">{(point.intensity * 10).toFixed(1)}/10</span>
                  </p>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* 7. POIs markers (Either as grouped clusters or individual points depending on state) */}
          {processedPOIs.map((poi) => {
            if (poi.isCluster) {
              return (
                <Marker
                  key={poi.id}
                  position={poi.coordinates}
                  icon={createClusterIcon(poi.count)}
                  eventHandlers={{
                    click: (e) => {
                      const map = e.target._map;
                      map.setView(poi.coordinates, map.getZoom() + 2, { animate: true });
                    }
                  }}
                >
                  <Popup>
                    <div className="font-sans text-xs max-w-[200px] space-y-1.5">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 pb-1 border-b border-slate-100 dark:border-slate-800">
                        Grouped Cluster ({poi.count} elements)
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/40 text-[10px]">
                        {poi.points.map((p: any) => (
                          <div key={p.id} className="py-1">
                            <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">{p.category}:</span> {p.name}
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400 italic">Click cluster marker to zoom in closer</p>
                    </div>
                  </Popup>
                </Marker>
              );
            }

            // Render single point POI marker
            const getIcon = () => {
              switch (poi.category) {
                case 'metro': return createMetroIcon();
                case 'school': return createSchoolIcon();
                case 'hospital': return createHospitalIcon();
                case 'mall': return createMallIcon();
              }
            };

            const getColorClass = () => {
              switch (poi.category) {
                case 'metro': return 'text-blue-500';
                case 'school': return 'text-amber-500';
                case 'hospital': return 'text-rose-500';
                case 'mall': return 'text-purple-500';
              }
            };

            return (
              <Marker
                key={poi.id}
                position={poi.coordinates}
                icon={getIcon()}
              >
                <Popup>
                  <div className="font-sans text-xs">
                    <div className="flex items-center gap-1.5 font-bold border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-1.5">
                      <span className={getColorClass()}>
                        {poi.category === 'metro' && <Train className="w-3.5 h-3.5" />}
                        {poi.category === 'school' && <GraduationCap className="w-3.5 h-3.5" />}
                        {poi.category === 'hospital' && <Activity className="w-3.5 h-3.5" />}
                        {poi.category === 'mall' && <ShoppingBag className="w-3.5 h-3.5" />}
                      </span>
                      <span className="text-slate-800 dark:text-slate-100 capitalize font-extrabold">{poi.category} Location</span>
                    </div>
                    <div className="font-bold text-slate-700 dark:text-slate-200 text-xs mb-1">
                      {poi.name}
                    </div>
                    <div className="text-[10px] text-slate-400 leading-normal">
                      {poi.details}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* 8. Neighborhood Locality Markers (Parity with old SVG pins) */}
          {cityPins.map((locality) => {
            const isMainActive = locality.id === selectedLocality;

            return (
              <Marker
                key={locality.id}
                position={locality.coordinates}
                icon={isMainActive ? createPropertyIcon() : createOtherLocalityIcon(locality.name)}
                eventHandlers={{
                  click: () => {
                    if (onLocalitySelect) {
                      onLocalitySelect(locality.id);
                    }
                  }
                }}
              >
                <Popup>
                  <div className="font-sans text-xs space-y-1.5 min-w-[170px]">
                    <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{locality.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-tight">
                      <div>
                        <span className="text-slate-400">AVG_PRICE:</span>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">${locality.pricePerSqft}/SQFT</div>
                      </div>
                      <div>
                        <span className="text-slate-400">ZONING:</span>
                        <div className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 truncate">{locality.zoning}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">DESIRABILITY:</span>
                        <div className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{locality.desirability.toFixed(1)}/10</div>
                      </div>
                      <div>
                        <span className="text-slate-400">CRIME RATE:</span>
                        <div className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">{(locality.crimeRate * 10).toFixed(1)}% Low</div>
                      </div>
                    </div>
                    {isMainActive && (
                      <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[9px] text-emerald-500 font-bold font-mono uppercase tracking-wider text-center">
                        Active Target Profile
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Interactive Map Legend inside Map Canvas */}
        <div id="spatial-tooltip" className="absolute bottom-3 left-3 bg-slate-950/90 text-white p-2.5 rounded-lg border border-slate-800/80 shadow-xl z-[1000] text-[10px] space-y-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 font-bold font-mono tracking-wide text-slate-200 border-b border-slate-800 pb-1.5 mb-1">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>GIS MAP LEGEND</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Selected Asset</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              <span>Other Sectors</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Metro Link</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>School</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              <span>Hospital</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>Retail Mall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary metadata metrics footer */}
      <div className="grid grid-cols-3 gap-3.5 text-center font-mono text-xs">
        <div className="bg-slate-50 dark:bg-slate-800/20 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
          <div className="text-[10px] text-slate-400">CRIME INDEX</div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {activeLocalityProfile ? `${(activeLocalityProfile.crimeRate * 10).toFixed(1)}% Low` : 'N/A'}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/20 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
          <div className="text-[10px] text-slate-400">GEO_CONFIDENCE</div>
          <div className="text-xs font-bold text-emerald-500 mt-0.5">99.8% Perfect</div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/20 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50">
          <div className="text-[10px] text-slate-400">LOCALITY_SCORE</div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {activeLocalityProfile ? `${activeLocalityProfile.desirability.toFixed(1)} / 10` : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};
