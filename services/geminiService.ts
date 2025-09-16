import { GoogleGenAI } from "@google/genai";
import type { DashboardState, Competitor, Product, PriceBenchmark, Campaign, RFMSegment } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Using a mock response.");
}

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

// --- FORMATTERS FOR PROMPT ---
const formatCompetitors = (c: Competitor[]) => c.map(comp => `- ${comp.name} (${comp.cuisine}, ${comp.priceRange}, Rating: ${comp.rating}/5, Address: ${comp.address})`).join('\n');
const formatProducts = (p: Product[]) => p.map(prod => `- ${prod.name} (Popularity: ${prod.popularity}, Profitability: ${prod.profitability}, Category: ${prod.category})`).join('\n');
const formatPrices = (pb: PriceBenchmark[]) => pb.map(item => `- ${item.item}: Your Price: $${item.self}, Competitor Avg: $${item.competitorAvg.toFixed(2)}`).join('\n');
const formatCampaigns = (c: Campaign[]) => c.map(camp => `- ${camp.name} (${camp.channel}): ${camp.roi}% ROI`).join('\n');
const formatRFM = (s: RFMSegment[]) => s.map(seg => `- ${seg.name}: ${seg.customerCount} customers`).join('\n');

const getModuleSpecificContext = (state: DashboardState): string => {
    switch (state.activeModule) {
        case 'place':
            const selected = state.selectedCompetitor ? `The user has selected "${state.selectedCompetitor.name}".` : "No competitor is selected.";
            return `
## Detailed View: Place Module
The user is viewing the map of restaurants in San Francisco.
- Visible Layers: ${state.visibleLayers.join(', ') || 'None'}
- ${selected}
- Visible Competitors:
${formatCompetitors(state.competitors.filter(c => c.type !== 'restaurant'))}`;

        case 'product':
            return `
## Detailed View: Product Module
The user is viewing the menu engineering analysis.
${formatProducts(state.products)}`;

        case 'price':
            return `
## Detailed View: Price Module
The user is viewing the competitive pricing analysis.
${formatPrices(state.priceBenchmarks)}`;

        case 'promotion':
            return `
## Detailed View: Promotion Module
The user is viewing marketing and customer segmentation data.
${formatCampaigns(state.campaigns)}
${formatRFM(state.rfmSegments)}`;
        default:
            return '';
    }
}

const formatSources = (chunks: any[]): string => {
    if (!chunks || chunks.length === 0) return '';
    const sources = chunks
        .map(chunk => chunk.web)
        .filter(source => source && source.uri)
        .map(source => `<li><a href="${source.uri}" target="_blank" rel="noopener noreferrer">${source.title}</a></li>`)
        .join('');
    
    return sources ? `<br/><hr style="margin: 8px 0;"/><small><strong>Sources:</strong><ul>${sources}</ul></small>` : '';
};


export async function getAIResponse(dashboardState: DashboardState, userMessage: string): Promise<string> {
    const mockResponse = "This is a mock response. Please set your API key to get real AI-powered insights.";
    if (!ai) {
        return new Promise(resolve => setTimeout(() => resolve(mockResponse), 500));
    }

    const prompt = `
        You are an AI Copilot for "BiteBase", a sophisticated market research dashboard for the restaurant industry. Your goal is to help restaurant owners make data-driven decisions by analyzing the state of their dashboard. You have a complete, real-time view of their screen and access to Google Search for up-to-date information.

        Your responses must be insightful, professional, and use HTML for formatting (e.g., <strong>, <br/>, <ul>, <li>). Do not use markdown. Be concise and helpful.

        # Current Dashboard State
        - The user is currently on the "${dashboardState.activeModule}" module.
        ${getModuleSpecificContext(dashboardState)}

        # User's Latest Action/Message
        "${userMessage}"

        # Your Task
        Based on the complete dashboard state and the user's message, provide a helpful and context-aware response.
        - If the user's query can be best answered with real-time information (e.g., "what's the weather", "tell me about this landmark", "are there any events near..."), use your search tool.
        - If the user asks for analysis, provide a summary based on the data for the ACTIVE module.
        - If they ask for suggestions, offer strategic advice relevant to the ACTIVE module.
        - If their message describes an action (like switching modules), acknowledge it and briefly describe what the new view shows or suggest an action they can take in this new view.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        const mainText = response.text;
        const sources = formatSources(response.candidates?.[0]?.groundingMetadata?.groundingChunks);

        return mainText + sources;

    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to get response from AI.");
    }
}