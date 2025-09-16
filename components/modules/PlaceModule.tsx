import React from 'react';
import type { Competitor, MarkerType, MapLayer } from '../../types';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl';
import { MAPBOX_API_KEY } from '../../config';
import type { ViewState } from 'react-map-gl';


// --- Components ---

interface CompetitorMarkerProps {
  competitor: Competitor;
  isSelected: boolean;
  onClick: () => void;
}

const CompetitorMarker: React.FC<CompetitorMarkerProps> = ({ competitor, isSelected, onClick }) => {
    const typeColors: { [key in MarkerType]: string } = {
        restaurant: 'var(--chart-1)',
        competitor_cheap: 'var(--chart-2)',
        competitor_mid: 'var(--chart-3)',
        competitor_expensive: 'var(--chart-5)',
    };
    
    const size = isSelected ? 24 : 16;

    return (
        <div
            className={`transition-all duration-300 group cursor-pointer`}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{ width: size, height: size, zIndex: isSelected ? 10 : 1 }}
        >
            <div 
              className={`w-full h-full rounded-full border-2 border-white shadow-md transition-all duration-300 group-hover:scale-125`}
              style={{ 
                  backgroundColor: typeColors[competitor.type],
                  boxShadow: isSelected ? `0 0 15px ${typeColors[competitor.type]}`: 'var(--bitebase-shadow-sm)'
                }}
            />
        </div>
    );
};

interface LayerControlProps {
  onToggleLayer: (layer: MapLayer) => void;
  visibleLayers: MapLayer[];
}
const LayerControls: React.FC<LayerControlProps> = ({ onToggleLayer, visibleLayers }) => {
  const layers: { id: MapLayer; label: string; emoji: string }[] = [
    { id: 'competitors', label: 'Competitors', emoji: '🏢' },
  ];

  return (
    <div className="p-1">
      <h4 className="text-sm font-semibold mb-3 px-2" style={{color: 'var(--bitebase-primary)'}}>Data Layers</h4>
      <div className="flex flex-col gap-2">
        {layers.map(({id, label, emoji}) => {
          const isActive = visibleLayers.includes(id);
          return (
            <button
              key={id}
              onClick={() => onToggleLayer(id)}
              className={`text-left text-sm p-2 rounded-md transition-all duration-200 flex items-center border`}
              style={{
                borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                backgroundColor: isActive ? 'rgba(116, 195, 101, 0.1)' : 'var(--background)',
                color: isActive ? 'var(--primary)' : 'var(--foreground)'
              }}
            >
              <span className="mr-3 text-lg">{emoji}</span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  );
};


// --- Main Module Component ---

interface MapRelatedState {
    competitors: Competitor[];
    selectedCompetitor: Competitor | null;
    visibleLayers: MapLayer[];
}

interface PlaceModuleProps {
    mapState: MapRelatedState;
    onSelectCompetitor: (competitor: Competitor) => void;
    onToggleLayer: (layer: MapLayer) => void;
    viewState: ViewState;
    onViewStateChange: (viewState: ViewState) => void;
}

export const PlaceModule: React.FC<PlaceModuleProps> = (props) => {
  const { mapState, viewState, onViewStateChange, onSelectCompetitor } = props;
  const { competitors, selectedCompetitor, visibleLayers } = mapState;

  return (
    <div className="flex flex-col md:flex-row flex-1 gap-4 overflow-hidden">
        <div className="w-full md:w-48 lg:w-56 flex-shrink-0">
            <LayerControls onToggleLayer={props.onToggleLayer} visibleLayers={mapState.visibleLayers} />
        </div>
        <div className="flex-1 flex flex-col min-h-0 rounded-lg overflow-hidden shadow-inner" style={{borderColor: 'var(--border)', backgroundColor: 'var(--muted)'}}>
            <Map
              {...viewState}
              onMove={evt => onViewStateChange(evt.viewState)}
              mapboxAccessToken={MAPBOX_API_KEY}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              style={{width: '100%', height: '100%'}}
            >
              <NavigationControl position="top-right" />

              {visibleLayers.includes('competitors') && competitors.map(competitor => (
                <Marker
                  key={competitor.id}
                  longitude={competitor.longitude}
                  latitude={competitor.latitude}
                  anchor="center"
                >
                  <CompetitorMarker
                    competitor={competitor}
                    isSelected={competitor.id === selectedCompetitor?.id}
                    onClick={() => onSelectCompetitor(competitor)}
                  />
                </Marker>
              ))}

              {selectedCompetitor && (
                <Popup
                  longitude={selectedCompetitor.longitude}
                  latitude={selectedCompetitor.latitude}
                  onClose={() => onSelectCompetitor(selectedCompetitor)}
                  closeOnClick={false}
                  anchor="bottom"
                  offset={20}
                >
                  <div className="text-xs">
                    <strong className="font-bold block">{selectedCompetitor.name}</strong>
                    <span>{selectedCompetitor.address}</span>
                  </div>
                </Popup>
              )}
            </Map>
        </div>
    </div>
  );
};