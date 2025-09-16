import React from 'react';
import type { DashboardState, Competitor, MapLayer, Module } from '../types';
import { PlaceModule } from './modules/PlaceModule';
import { ProductModule } from './modules/ProductModule';
import { PriceModule } from './modules/PriceModule';
import { PromotionModule } from './modules/PromotionModule';
import type { ViewState } from 'react-map-gl';

interface MapSectionProps {
  dashboardState: DashboardState;
  onSelectCompetitor: (competitor: Competitor) => void;
  onToggleLayer: (layer: MapLayer) => void;
  onSetModule: (module: Module) => void;
  viewState: ViewState;
  onViewStateChange: (viewState: ViewState) => void;
  isLoading: boolean;
  error: string | null;
}

export const MapSection: React.FC<MapSectionProps> = (props) => {
  const { dashboardState, onSetModule, isLoading, error } = props;
  const { activeModule } = dashboardState;

  const modules: {id: Module, label: string}[] = [
    { id: 'place', label: '📍 Place' },
    { id: 'product', label: '🍔 Product' },
    { id: 'price', label: '💲 Price' },
    { id: 'promotion', label: '🎉 Promotion' },
  ];

  const renderModule = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="bitebase-spinner" style={{width: 40, height: 40}} />
          <p className="text-sm" style={{color: 'var(--bitebase-text-secondary)'}}>Loading Live Restaurant Data...</p>
        </div>
      );
    }
    if (error) {
       return <div className="flex-1 flex items-center justify-center text-center p-4" style={{color: 'var(--destructive)'}}>{error}</div>;
    }

    switch(activeModule) {
      case 'place':
        // FIX: Removed the 'zoom' property from 'mapState' as it's not part of the 'MapRelatedState' type.
        // The zoom level is already passed via the 'viewState' prop.
        return <PlaceModule 
                  mapState={{
                    competitors: dashboardState.competitors,
                    selectedCompetitor: dashboardState.selectedCompetitor,
                    visibleLayers: dashboardState.visibleLayers,
                  }}
                  onSelectCompetitor={props.onSelectCompetitor} 
                  onToggleLayer={props.onToggleLayer} 
                  viewState={props.viewState}
                  onViewStateChange={props.onViewStateChange}
                />;
      case 'product':
        return <ProductModule products={dashboardState.products} />;
      case 'price':
        return <PriceModule benchmarks={dashboardState.priceBenchmarks} />;
      case 'promotion':
        return <PromotionModule campaigns={dashboardState.campaigns} rfmSegments={dashboardState.rfmSegments} />;
      default:
        return null;
    }
  }

  return (
    <section className="flex-1 flex flex-col gap-4 bitebase-glass-panel p-0 overflow-hidden">
        <div 
          className="flex border-b flex-wrap"
          style={{ 
            borderColor: 'var(--border)', 
            paddingLeft: 'var(--bitebase-spacing-xl)',
            paddingRight: 'var(--bitebase-spacing-xl)',
            paddingTop: 'var(--bitebase-spacing-lg)',
          }}
        >
            {modules.map(module => (
            <button
                key={module.id}
                onClick={() => onSetModule(module.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors relative`}
                style={{
                    color: activeModule === module.id ? 'var(--bitebase-primary)' : 'var(--bitebase-dark-gray)',
                }}
            >
                {module.label}
                {activeModule === module.id && 
                    <div 
                        className="absolute bottom-0 left-0 right-0 h-0.5" 
                        style={{
                            backgroundColor: 'var(--bitebase-primary)',
                            boxShadow: '0 0 8px var(--bitebase-primary)'
                        }} 
                    />
                }
            </button>
            ))}
        </div>
      
        <div 
            className="flex-1 flex flex-col overflow-hidden"
            style={{
                paddingLeft: 'var(--bitebase-spacing-xl)',
                paddingRight: 'var(--bitebase-spacing-xl)',
                paddingBottom: 'var(--bitebase-spacing-xl)',
            }}
        >
            {renderModule()}
        </div>
    </section>
  );
};