
import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import type { EncodedImage } from "../types";

// API Key must be handled via environment variables.
// The execution environment is expected to have `process.env.API_KEY` available.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will prevent the app from running if the API key is not configured,
  // which is a hard requirement.
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates creative style and scene suggestions based on an uploaded image.
 * @param base64Image The base64 encoded string of the user's uploaded image.
 * @param mimeType The IANA mime type of the user's uploaded image.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const generateStyleSuggestions = async (base64Image: string, mimeType: string): Promise<string[]> => {
  console.log("Calling Gemini API 'gemini-2.5-flash' for style suggestions.");
  try {
    const prompt = "Analyze the provided image of a person. Generate 3 distinct and creative scene descriptions for a professional photoshoot featuring this person. Each description should detail the background and lighting. The tone should be high-fashion and editorial. Return ONLY the JSON array of strings.";

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);
    
    if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
      return suggestions;
    }
    
    throw new Error("AI response was not in the expected format.");

  } catch (error) {
    console.error("Error generating style suggestions:", error);
    // Return empty array on failure so the UI doesn't break
    return [];
  }
};

/**
 * Generates creative pose suggestions based on an uploaded image.
 * @param base64Image The base64 encoded string of the user's uploaded image.
 * @param mimeType The IANA mime type of the user's uploaded image.
 * @returns A promise that resolves to an array of string suggestions.
 */
export const generatePoseSuggestions = async (base64Image: string, mimeType: string): Promise<string[]> => {
  console.log("Calling Gemini API 'gemini-2.5-flash' for pose suggestions.");
  try {
    const prompt = "Based on the person in the image, generate 4 creative and distinct photoshoot pose descriptions. The descriptions should be concise and actionable, suitable for a professional model. Examples: 'Leaning against a wall, one hand in pocket, looking away from camera', 'Confident stride towards the camera, slight smile'. Return ONLY the JSON array of strings.";

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const suggestions = JSON.parse(jsonText);
    
    if (Array.isArray(suggestions) && suggestions.every(s => typeof s === 'string')) {
      return suggestions;
    }
    
    throw new Error("AI response was not in the expected format for pose suggestions.");

  } catch (error) {
    console.error("Error generating pose suggestions:", error);
    return [];
  }
};


/**
 * Calls the Gemini API to generate a studio-quality image.
 * This uses the 'gemini-2.5-flash-image' model to edit an existing image based on a prompt.
 * 
 * @param base64Image The base64 encoded string of the user's uploaded image.
 * @param mimeType The IANA mime type of the user's uploaded image (e.g., 'image/jpeg').
 * @param prompt The detailed text prompt for the AI.
 * @param accessories An array of base64 encoded accessory images.
 * @returns A promise that resolves to a base64 data URL of the generated image.
 */
export const generateStudioImage = async (
  base64Image: string, 
  mimeType: string, 
  prompt: string,
  accessories: EncodedImage[] = []
): Promise<string> => {
  console.log("Calling Gemini API 'gemini-2.5-flash-image' with prompt:", prompt);
  
  try {
    const mainImagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const accessoryImageParts = accessories.map(acc => ({
      inlineData: {
        data: acc.base64Data,
        mimeType: acc.mimeType,
      },
    }));

    const textPart = { text: prompt };

    const parts = [mainImagePart, ...accessoryImageParts, textPart];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // The response can contain multiple parts (text, image). We need to find the image part.
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      const { data, mimeType: responseMimeType } = imagePart.inlineData;
      const imageUrl = `data:${responseMimeType};base64,${data}`;
      return imageUrl;
    } else {
      // Handle cases where the model might return only text (e.g., a safety rejection)
      const textResponse = response.text;
      console.error("API response did not contain an image. Text response:", textResponse);
      throw new Error(`Image generation failed. The model responded with: ${textResponse || 'No content'}`);
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the error to be caught by the calling function in App.tsx
    throw new Error('An API error occurred during image generation. Please check your API key and network connection.');
  }
};
