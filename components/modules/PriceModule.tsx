import React from 'react';
import type { PriceBenchmark } from '../../types';
import { ChartContainer, GroupedBarChart } from '../shared/Charts';

interface PriceModuleProps {
    benchmarks: PriceBenchmark[];
}

export const PriceModule: React.FC<PriceModuleProps> = ({ benchmarks }) => {
    const chartData = benchmarks.map(bm => ({
        group: bm.item,
        values: [
            { label: 'You', value: bm.self, color: 'var(--chart-1)' },
            { label: 'Avg.', value: bm.competitorAvg, color: 'var(--chart-3)' }
        ]
    }));

    return (
        <div className="flex-1 overflow-y-auto p-1 scrollbar-custom">
            <ChartContainer title="Competitor Price Benchmarking">
                 <GroupedBarChart data={chartData} unit="$" />
            </ChartContainer>
        </div>
    );
};