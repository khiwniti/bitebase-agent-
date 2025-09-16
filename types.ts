export type MarkerType = 'restaurant' | 'competitor_cheap' | 'competitor_mid' | 'competitor_expensive';

export interface Competitor {
  id: string; // Geoapify place_id or custom id
  latitude: number;
  longitude: number;
  type: MarkerType;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: '$' | '$$' | '$$$';
  address: string;
  categories: string[];
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  isHtml?: boolean;
}

export type MapLayer = 'competitors';

export type Module = 'place' | 'product' | 'price' | 'promotion';

// --- Product Module Types ---
export type ProductCategory = 'Stars' | 'Plowhorses' | 'Puzzles' | 'Dogs';
export interface Product {
    id: number;
    name: string;
    popularity: number; // 0-100
    profitability: number; // 0-100
    category: ProductCategory;
}

// --- Price Module Types ---
export interface PriceBenchmark {
    item: string;
    self: number;
    competitorAvg: number;
    competitors: Record<string, number>;
}

// --- Promotion Module Types ---
export interface Campaign {
    id: string;
    name:string;
    channel: 'Social Media' | 'Email' | 'Offline' | 'PPC';
    roi: number; // in percent
}

export interface RFMSegment {
    id: number;
    name: string;
    recency: number; // 0-100
    frequency: number; // 0-100
    monetary: number; // 0-100
    customerCount: number;
}

// --- Main State Interface ---
export interface DashboardState {
    activeModule: Module;
    // Place Module
    zoom: number;
    competitors: Competitor[];
    selectedCompetitor: Competitor | null;
    visibleLayers: MapLayer[];
    // Product Module
    products: Product[];
    // Price Module
    priceBenchmarks: PriceBenchmark[];
    // Promotion Module
    campaigns: Campaign[];
    rfmSegments: RFMSegment[];
}