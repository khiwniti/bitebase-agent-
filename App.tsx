import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { MapSection } from './components/MapSection';
import { ChatSection } from './components/ChatSection';
import type { DashboardState, Competitor, ChatMessage, MapLayer, Module, Product, PriceBenchmark, Campaign, RFMSegment } from './types';
import { getAIResponse } from './services/geminiService';
import { fetchCompetitors } from './services/geoService';

// --- INITIAL STATE & MOCK DATA ---
const INITIAL_VIEW_STATE = {
  longitude: -122.4194,
  latitude: 37.7749,
  zoom: 13
};

const INITIAL_MESSAGES: ChatMessage[] = [
    {
        id: 1,
        role: 'ai',
        content: `<strong>Welcome to BiteBase!</strong><br/>I'm your AI Copilot. I've just loaded live restaurant data for downtown San Francisco using the Geoapify API. Explore the map and ask me anything!`
    },
    {
        id: 2,
        role: 'ai',
        content: `I am now connected to Google Search. Try asking a question that requires real-time information, like "What's the weather like at The Ferry Building?"`
    }
];

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Truffle Pasta', popularity: 85, profitability: 90, category: 'Stars' },
  { id: 2, name: 'Margherita Pizza', popularity: 95, profitability: 40, category: 'Plowhorses' },
  { id: 3, name: 'Filet Mignon', popularity: 30, profitability: 85, category: 'Puzzles' },
  { id: 4, name: 'House Salad', popularity: 25, profitability: 30, category: 'Dogs' },
  { id: 5, name: 'Garlic Bread', popularity: 98, profitability: 55, category: 'Plowhorses' },
  { id: 6, name: 'Lobster Risotto', popularity: 45, profitability: 75, category: 'Puzzles' },
];

const MOCK_PRICE_BENCHMARKS: PriceBenchmark[] = [
  { item: 'Pizza', self: 18, competitorAvg: 16.50, competitors: { 'Pizza Palace': 17, 'Burger Barn': 14, 'Noodle House': 18.5 } },
  { item: 'Burger', self: 16, competitorAvg: 13.00, competitors: { 'Burger Barn': 12, 'The Steakhouse': 22, 'Pizza Palace': 15 } },
  { item: 'Steak', self: 45, competitorAvg: 48.00, competitors: { 'The Steakhouse': 48, 'Noodle House': 35 } },
  { item: 'Noodles', self: 22, competitorAvg: 20.00, competitors: { 'Noodle House': 20, 'Pizza Palace': 25 } },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Summer Special', channel: 'Social Media', roi: 250 },
  { id: 'c2', name: 'Email Blast Q2', channel: 'Email', roi: 420 },
  { id: 'c3', name: 'Local Flyer Drop', channel: 'Offline', roi: 80 },
  { id: 'c4', name: 'Google Ads', channel: 'PPC', roi: 310 },
];

const MOCK_RFM_SEGMENTS: RFMSegment[] = [
  { id: 1, name: 'Champions', recency: 90, frequency: 95, monetary: 98, customerCount: 150 },
  { id: 2, name: 'Loyal Customers', recency: 70, frequency: 80, monetary: 85, customerCount: 400 },
  { id: 3, name: 'At-Risk', recency: 20, frequency: 30, monetary: 40, customerCount: 250 },
  { id: 4, name: 'New Customers', recency: 95, frequency: 15, monetary: 20, customerCount: 120 },
  { id: 5, name: 'Hibernating', recency: 10, frequency: 10, monetary: 15, customerCount: 600 },
];


export default function App() {
  // --- STATE ---
  const [activeModule, setActiveModule] = useState<Module>('place');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  
  // Place Module State
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [selectedCompetitorId, setSelectedCompetitorId] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<MapLayer[]>(['competitors']);
  
  // Other Module State (still mock)
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [priceBenchmarks, setPriceBenchmarks] = useState<PriceBenchmark[]>(MOCK_PRICE_BENCHMARKS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [rfmSegments, setRfmSegments] = useState<RFMSegment[]>(MOCK_RFM_SEGMENTS);

  // --- DATA FETCHING ---
  useEffect(() => {
    const loadCompetitorData = async () => {
      try {
        setIsLoadingData(true);
        setDataError(null);
        const fetchedCompetitors = await fetchCompetitors(INITIAL_VIEW_STATE.latitude, INITIAL_VIEW_STATE.longitude);
        
        const selfRestaurant: Competitor = {
          id: 'self_restaurant',
          latitude: INITIAL_VIEW_STATE.latitude,
          longitude: INITIAL_VIEW_STATE.longitude,
          type: 'restaurant',
          name: 'Our Restaurant',
          cuisine: 'Italian',
          rating: 4.8,
          priceRange: '$$$',
          address: 'Market St, San Francisco',
          categories: ['restaurant', 'italian'],
        };

        setCompetitors([selfRestaurant, ...fetchedCompetitors]);

      } catch (error) {
        console.error("Failed to fetch competitor data:", error);
        setDataError("Could not load competitor data. Please check the API key and network connection.");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadCompetitorData();
  }, []);

  // --- STATE GETTER ---
  const getDashboardState = useCallback((): DashboardState => {
    const selectedCompetitor = competitors.find(c => c.id === selectedCompetitorId);
    return {
      activeModule,
      zoom: viewState.zoom,
      competitors,
      selectedCompetitor: selectedCompetitor || null,
      visibleLayers,
      products,
      priceBenchmarks,
      campaigns,
      rfmSegments
    };
  }, [activeModule, competitors, selectedCompetitorId, viewState.zoom, visibleLayers, products, priceBenchmarks, campaigns, rfmSegments]);
  
  // --- CALLBACKS & HANDLERS ---
  const addMessage = useCallback((role: 'user' | 'ai', content: string, isHtml: boolean = false) => {
    setMessages(prev => [...prev, { id: Date.now(), role, content, isHtml }]);
  }, []);

  const handleAiInteraction = useCallback(async (userMessage: string) => {
    setIsAiThinking(true);
    try {
      const currentState = getDashboardState();
      const aiResponse = await getAIResponse(currentState, userMessage);
      addMessage('ai', aiResponse, true);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      addMessage('ai', "Sorry, I encountered an error. Please try again.");
    } finally {
      setIsAiThinking(false);
    }
  }, [addMessage, getDashboardState]);

  const handleSendMessage = useCallback(async (message: string) => {
    addMessage('user', message);
    await handleAiInteraction(message);
  }, [addMessage, handleAiInteraction]);
  
  const handleSelectCompetitor = useCallback((competitor: Competitor) => {
    const newSelectedId = selectedCompetitorId === competitor.id ? null : competitor.id;
    setSelectedCompetitorId(newSelectedId);
    
    if (newSelectedId) {
        setViewState(v => ({...v, latitude: competitor.latitude, longitude: competitor.longitude, zoom: 15}));
    }

    const userMessage = newSelectedId
      ? `I've selected "${competitor.name}". Tell me more about it.`
      : `I've deselected "${competitor.name}".`;
    addMessage('user', userMessage);
    setTimeout(() => handleAiInteraction(userMessage), 0);
  }, [addMessage, handleAiInteraction, selectedCompetitorId]);

  const handleToggleLayer = useCallback((layer: MapLayer) => {
    setVisibleLayers(prev => {
        const newLayers = prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer];
        const action = newLayers.includes(layer) ? 'enabled' : 'disabled';
        const userMessage = `I just ${action} the ${layer.replace('_', ' ')} layer.`;
        addMessage('user', userMessage);
        setTimeout(() => handleAiInteraction(userMessage), 0);
        return newLayers;
    });
  }, [addMessage, handleAiInteraction]);
  
  const handleSetModule = useCallback((module: Module) => {
    setActiveModule(module);
    const userMessage = `I've switched to the '${module}' module. What can I see here?`;
    addMessage('user', userMessage);
    setTimeout(() => handleAiInteraction(userMessage), 0);
  }, [addMessage, handleAiInteraction]);

  return (
    <div className="flex flex-col h-screen bg-muted/50">
      <Header />
      <main 
        className="flex-1 flex flex-col md:flex-row overflow-hidden"
        style={{ padding: 'var(--bitebase-spacing-lg)', gap: 'var(--bitebase-spacing-lg)' }}
      >
        <MapSection
          dashboardState={getDashboardState()}
          onSelectCompetitor={handleSelectCompetitor}
          onToggleLayer={handleToggleLayer}
          onSetModule={handleSetModule}
          viewState={viewState}
          onViewStateChange={setViewState}
          isLoading={isLoadingData}
          error={dataError}
        />
        <ChatSection 
          messages={messages} 
          isAiThinking={isAiThinking} 
          onSendMessage={handleSendMessage} 
        />
      </main>
    </div>
  );
}