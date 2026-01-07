
import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly and create a new instance before making an API call.
export const getAIInsights = async (data: any[], title: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const prompt = `
    Analyze the following data for the report titled "${title}".
    Data JSON: ${JSON.stringify(data.slice(0, 20))}
    
    Provide a structured professional analysis report in Markdown. 
    Focus on:
    1. Key trends and patterns.
    2. Any notable anomalies.
    3. Correlation between different fields if applicable.
    4. Strategic recommendations.
    
    Keep the report concise but insightful. Use bullet points.
  `;

  try {
    // Calling generateContent directly with model name and prompt string.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    // response.text is a property, do not call it as a method.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate AI insights. Please check your connection or API key.";
  }
};
