import type { Competitor, MarkerType } from '../types';
import { GEOAPIFY_API_KEY } from '../config';

const API_URL = `https://api.geoapify.com/v2/places`;

function getPriceRange(categories: string[]): '$' | '$$' | '$$$' {
    if (categories.includes('catering.fast_food') || categories.includes('catering.food_court')) return '$';
    if (categories.includes('catering.fine_dining')) return '$$$';
    return '$$';
}

function getMarkerType(priceRange: '$' | '$$' | '$$$'): MarkerType {
    switch (priceRange) {
        case '$': return 'competitor_cheap';
        case '$$': return 'competitor_mid';
        case '$$$': return 'competitor_expensive';
    }
}

export async function fetchCompetitors(lat: number, lon: number): Promise<Competitor[]> {
    const categories = 'catering.restaurant,catering.cafe,catering.fast_food,catering.bar';
    const radius = 5000; // 5km
    
    const url = `${API_URL}?categories=${categories}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=50&apiKey=${GEOAPIFY_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Geoapify API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (!data.features) {
        return [];
    }

    return data.features.map((feature: any): Competitor => {
        const props = feature.properties;
        const categories = props.categories || [];
        const priceRange = getPriceRange(categories);

        return {
            id: props.place_id,
            latitude: props.lat,
            longitude: props.lon,
            name: props.name || 'Unknown Restaurant',
            cuisine: categories.find((c: string) => c.startsWith('catering.'))?.split('.')[1]?.replace(/_/g, ' ') || 'Restaurant',
            rating: props.catering?.rating || Math.round((3 + Math.random() * 2) * 2) / 2, // Mock rating if not available
            priceRange: priceRange,
            type: getMarkerType(priceRange),
            address: props.address_line2 || 'Address not available',
            categories: categories,
        };
    });
}