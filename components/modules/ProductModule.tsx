import React from 'react';
import type { Product, ProductCategory } from '../../types';
import { ChartContainer, BarChart, ScatterPlot } from '../shared/Charts';

const categoryStyles: Record<ProductCategory, string> = {
    Stars: 'var(--chart-3)',
    Plowhorses: 'var(--chart-2)',
    Puzzles: 'var(--chart-5)',
    Dogs: 'var(--bitebase-dark-gray)',
};

interface ProductModuleProps {
    products: Product[];
}

export const ProductModule: React.FC<ProductModuleProps> = ({ products }) => {
    const topSellersData = products
        .slice()
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)
        .map(p => ({ label: p.name, value: p.popularity, color: 'var(--chart-1)' }));
    
    const scatterData = products.map(p => ({
        x: p.popularity,
        y: p.profitability,
        label: p.name,
        color: categoryStyles[p.category],
    }));

    return (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto p-1 scrollbar-custom">
            <ChartContainer title="Top 5 Selling Products (by Popularity)">
                <BarChart data={topSellersData} unit="%" />
            </ChartContainer>
            <ChartContainer 
                title="Menu Engineering Matrix" 
                subtitle="Popularity vs. Profitability"
            >
                <ScatterPlot 
                    data={scatterData} 
                    xAxisLabel="Popularity" 
                    yAxisLabel="Profitability" 
                    showQuadrants={true}
                />
            </ChartContainer>
        </div>
    );
};