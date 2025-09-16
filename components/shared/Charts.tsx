import React from 'react';

// --- ChartContainer ---
interface ChartContainerProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}
export const ChartContainer: React.FC<ChartContainerProps> = ({ title, subtitle, children }) => (
    <div className="bitebase-translucent-card flex flex-col h-full min-h-[300px]">
        <div>
            <h3 className="font-semibold text-md" style={{color: 'var(--bitebase-primary)'}}>{title}</h3>
            {subtitle && <p className="text-xs mb-4" style={{color: 'var(--bitebase-text-secondary)'}}>{subtitle}</p>}
        </div>
        <div className="flex-1 flex flex-col justify-end min-h-0">{children}</div>
    </div>
);


// --- BarChart ---
interface BarChartData {
    label: string;
    value: number;
    color?: string;
}
interface BarChartProps {
    data: BarChartData[];
    unit?: string;
}
export const BarChart: React.FC<BarChartProps> = ({ data, unit = '' }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    return (
        <div className="flex-1 flex items-end justify-around gap-2 pt-4">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-xs font-bold" style={{color: 'var(--bitebase-text-secondary)'}}>
                        {item.value}{unit}
                    </div>
                    <div
                        className={`w-full rounded-t-sm transition-all duration-500 ease-out`}
                        style={{ 
                            height: `${(item.value / maxValue) * 100}%`,
                            backgroundColor: item.color || 'var(--primary)'
                        }}
                        title={`${item.label}: ${item.value}${unit}`}
                    />
                    <div className="text-[10px] text-center truncate w-full group-hover:text-foreground" style={{color: 'var(--bitebase-dark-gray)'}}>
                        {item.label}
                    </div>
                </div>
            ))}
        </div>
    );
};


// --- GroupedBarChart ---
interface GroupedBarChartData {
    group: string;
    values: { label: string; value: number; color: string }[];
}
interface GroupedBarChartProps {
    data: GroupedBarChartData[];
    unit?: string;
}
export const GroupedBarChart: React.FC<GroupedBarChartProps> = ({ data, unit = '' }) => {
    const maxValue = Math.max(...data.flatMap(g => g.values.map(v => v.value)), 0);
    return (
        <div className="flex-1 flex items-end justify-around gap-4 pt-4 px-2 relative">
            {data.map((group, groupIndex) => (
                <div key={groupIndex} className="flex-1 flex flex-col items-center gap-2">
                    <div className="flex items-end justify-center h-full w-full gap-1">
                        {group.values.map((item, itemIndex) => (
                            <div key={itemIndex} className="w-full h-full flex flex-col justify-end items-center group/item">
                                <div className="text-xs font-bold opacity-0 group-hover/item:opacity-100 transition-opacity" style={{color: 'var(--bitebase-text-secondary)'}}>
                                    {item.value}{unit}
                                </div>
                                <div
                                    className={`w-full rounded-t-sm transition-all duration-500 ease-out`}
                                    style={{ 
                                        height: `${(item.value / maxValue) * 100}%`,
                                        backgroundColor: item.color
                                    }}
                                    title={`${item.label}: ${item.value}${unit}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="text-[10px] text-center truncate w-full group-hover:text-foreground" style={{color: 'var(--bitebase-dark-gray)'}}>
                        {group.group}
                    </div>
                </div>
            ))}
             <div className="absolute top-4 right-4 flex gap-4 text-xs">
                {data && data.length > 0 && data[0].values.map(v => (
                    <div key={v.label} className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-sm`} style={{backgroundColor: v.color}}></div>
                        <span>{v.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- ScatterPlot ---
interface ScatterPlotData {
    x: number; y: number; label: string; size?: number; color: string;
}
interface ScatterPlotProps {
    data: ScatterPlotData[];
    xAxisLabel: string;
    yAxisLabel: string;
    showQuadrants?: boolean;
}
export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, xAxisLabel, yAxisLabel, showQuadrants = false }) => {
    const maxSize = Math.max(...data.map(d => d.size || 20), 20);

    return (
        <div className="flex-1 flex relative p-4 pl-8 pb-8">
            {/* Axis Lines & Labels */}
            <div className="absolute bottom-0 left-0 top-0 w-px" style={{backgroundColor: 'var(--border)'}}></div>
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{backgroundColor: 'var(--border)'}}></div>
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs" style={{color: 'var(--muted-foreground)'}}>{yAxisLabel}</div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs" style={{color: 'var(--muted-foreground)'}}>{xAxisLabel}</div>
            
            {/* Quadrant Lines */}
            {showQuadrants && <>
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px border-r border-dashed" style={{borderColor: 'var(--border)'}}></div>
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px border-t border-dashed" style={{borderColor: 'var(--border)'}}></div>
            </>}
            
            {/* Data Points */}
            {data.map((point, i) => {
                const pointSize = point.size ? 12 + (point.size / maxSize) * 20 : 20;
                return (
                    <div
                        key={i}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 ease-out group/point"
                        style={{
                            left: `${point.x}%`,
                            bottom: `${point.y}%`,
                            width: `${pointSize}px`,
                            height: `${pointSize}px`,
                        }}
                    >
                       <div className={`w-full h-full rounded-full opacity-70 group-hover/point:opacity-100 group-hover/point:scale-125 transition-all`} style={{backgroundColor: point.color}}/>
                       <div 
                         className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white rounded-md opacity-0 group-hover/point:opacity-100 transition-opacity whitespace-nowrap z-10"
                         style={{backgroundColor: 'var(--foreground)'}}
                        >
                           {point.label}
                       </div>
                    </div>
                );
            })}
        </div>
    );
};