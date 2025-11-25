import { GoogleGenAI, Type } from "@google/genai";
import { SmartSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTimerSuggestion = async (query: string): Promise<SmartSuggestion | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User wants to set a timer for: "${query}". 
      Determine the best duration for this task. 
      If the request is ambiguous, make a reasonable standard guess (e.g. for "meditation" guess 10 minutes).
      Return the result as a JSON object with 'task' (cleaned up name), 'durationSeconds' (integer), and 'reasoning' (short explanation).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: { type: Type.STRING },
            durationSeconds: { type: Type.INTEGER },
            reasoning: { type: Type.STRING },
          },
          required: ["task", "durationSeconds", "reasoning"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as SmartSuggestion;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
