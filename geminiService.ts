import { GoogleGenAI } from "@google/genai";
import { Language } from "./types";

// Always use process.env.API_KEY directly and create a new instance before making an API call.
export const getAIInsights = async (data: any[], title: string, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";

  const prompts = {
    [Language.EN]: `
      Analyze the following data for the report titled "${title}".
      Data JSON: ${JSON.stringify(data.slice(0, 20))}
      
      Provide a structured professional analysis report in Markdown. 
      Focus on:
      1. Key trends and patterns.
      2. Any notable anomalies.
      3. Correlation between different fields if applicable.
      4. Strategic recommendations.
      
      Keep the report concise but insightful. Use bullet points.
      Respond in English.
    `,
    [Language.ZH]: `
      请分析标题为 "${title}" 的以下数据。
      数据 JSON: ${JSON.stringify(data.slice(0, 20))}
      
      请提供一份结构化的专业分析报告（使用 Markdown 格式）。
      重点关注：
      1. 关键趋势和模式。
      2. 任何显著的异常情况。
      3. 不同字段之间的相关性（如果适用）。
      4. 战略性建议。
      
      报告应简洁且富有洞察力。使用圆点列表。
      请务必使用中文回复。
    `
  };

  const prompt = prompts[lang] || prompts[Language.EN];

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
    return lang === Language.ZH 
      ? "生成 AI 洞察失败。请检查您的网络连接或 API 密钥。" 
      : "Failed to generate AI insights. Please check your connection or API key.";
  }
};