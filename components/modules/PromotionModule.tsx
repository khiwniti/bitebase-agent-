import React from 'react';
import type { Campaign, RFMSegment } from '../../types';
import { ChartContainer, BarChart, ScatterPlot } from '../shared/Charts';

const rfmColors = [ 'var(--chart-1)', 'var(--chart-2)', 'var(--chart-5)', 'var(--chart-3)', 'var(--bitebase-dark-gray)' ];

interface PromotionModuleProps {
    campaigns: Campaign[];
    rfmSegments: RFMSegment[];
}

export const PromotionModule: React.FC<PromotionModuleProps> = ({ campaigns, rfmSegments }) => {
    const campaignData = campaigns
        .slice()
        .sort((a,b) => b.roi - a.roi)
        .map(c => ({ label: c.name, value: c.roi, color: 'var(--chart-1)' }));
    
    const rfmData = rfmSegments.map((s, i) => ({
        x: s.recency,
        y: s.frequency,
        label: `${s.name} (${s.customerCount})`,
        size: s.monetary, // Use monetary value for size
        color: rfmColors[i % rfmColors.length],
    }));

    return (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto p-1 scrollbar-custom">
            <ChartContainer title="Marketing Campaign ROI">
                <BarChart data={campaignData} unit="%" />
            </ChartContainer>
            <ChartContainer 
                title="RFM Customer Segmentation"
                subtitle="Recency vs. Frequency (Size = Monetary Value)"
            >
                <ScatterPlot 
                    data={rfmData}
                    xAxisLabel="Recency"
                    yAxisLabel="Frequency"
                />
            </ChartContainer>
        </div>
    );
};