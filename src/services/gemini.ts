import { GoogleGenAI } from "@google/genai";
import { DataStats, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAIInsights = async (stats: DataStats, analysisGoal: string, language: 'en' | 'so', userPrompt?: string, history: ChatMessage[] = []) => {
  const langName = language === 'en' ? 'English' : 'Somali';
  const basePrompt = `
    You are XogHub, a professional Data Analyst AI. 
    Your goal is to act like a real, senior data analyst, not just a processing tool.
    
    User's Analysis Goal/KPIs: ${analysisGoal}
    
    Workflow & Persona:
    1. Understand User Goals: If the provided goal is generic (e.g., "analyze this"), proactively ask the user for specific KPIs, objectives, or expected outcomes in your response.
    2. Data Cleaning: You are aware that the data has been cleaned (missing values handled, duplicates removed).
    3. Comprehensive Analysis: Provide summary statistics, detect patterns, trends, and anomalies.
    4. Actionable Recommendations: Always conclude with practical, data-driven advice.
    5. Language: You must respond ONLY in ${langName}.

    Rules:
    - DO NOT include any introductory phrases, greetings, or mentions of "XogHub" in the output.
    - START DIRECTLY with the data insights and analysis.
    - NEVER assume user intent. If the goal is vague, ASK clarifying questions.
    - Treat data as strictly user-owned and confidential.
    - Explain complex statistical concepts in simple, accessible language.
    - Be fast, clear, and practical.
    - If the user asks about a specific chart, provide a deep dive into those specific numbers.
    
    Data Summary:
    Total Rows: ${stats.totalRows}
    Columns: ${Object.keys(stats.columnStats).join(", ")}
    Detailed Stats: ${JSON.stringify(stats.columnStats)}
    
    Provide your response as a JSON array of strings in ${langName}.
  `;

  const chatContext = history.length > 0 
    ? `\n\nConversation History:\n${history.map(m => `${m.role.toUpperCase()}: ${m.content.join(" ")}`).join("\n")}`
    : "";

  const prompt = userPrompt 
    ? `${basePrompt}${chatContext}\n\nNew User Request: ${userPrompt}\n\nInstructions:
       1. If the user is asking about a specific chart or column, use the 'Detailed Stats' provided above to give precise answers.
       2. Maintain a professional, analytical tone.
       3. Respond ONLY in ${langName} as a JSON array of strings.`
    : basePrompt;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return language === 'en' 
      ? ["Unable to generate insights at this time."] 
      : ["Ma awoodno inaan xogtan falanqeyno xilligan."];
  }
};
