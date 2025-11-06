
import { GoogleGenAI, Modality, GenerateContentResponse, Type } from "@google/genai";
import type { PhotoshootConfig } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const imageGenerationModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-flash';

const DEFAULT_SCENE_SUGGESTIONS = [
  "on a white marble surface", "on a dark wood table", "with a soft, blurry background", "cinematic lighting", "minimalist style", "with a single plant in the background"
];

const DEFAULT_ARTISTIC_SUGGESTIONS = [
  "Photorealistic", "Analog film", "Cinematic lighting", "Moody and dramatic", "Clean and minimalist", "Vintage aesthetic"
];

const DEFAULT_EDITING_SUGGESTIONS = [
  "Make the lighting more dramatic",
  "Change the background to a beach scene",
  "Add a reflection on the surface",
  "Give it a vintage film look",
  "Make the colors pop more",
  "Add a subtle motion blur"
];


/**
 * Gets a filename-friendly product name from an image.
 * @returns A promise that resolves to a string for the product name.
 */
export async function getProductName(
  base64ImageData: string,
  mimeType: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          { text: "Analyze this product image. What is a short, descriptive name for this product? Return a single string that would be suitable for a filename. For example: 'blue_sports_sneaker' or 'silver_wrist_watch'. The name must be lowercase, use underscores for spaces, and contain no special characters other than underscores. Return ONLY the filename-safe string and nothing else." },
        ],
      },
    });

    const productName = response.text.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    return productName || 'product';
  } catch (error) {
    console.error("Error getting product name:", error);
    return 'product';
  }
}

/**
 * Analyzes the product image and suggests creative photoshoot scenes.
 * @returns A promise that resolves to an array of scene suggestions.
 */
export async function analyzeImageForSceneSuggestions(
  base64ImageData: string,
  mimeType: string
): Promise<string[]> {
  try {
     const response = await ai.models.generateContent({
      model: textModel,
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType } },
          { text: "Analyze this product image. Act as a creative director. Suggest six creative photoshoot scenes (e.g., 'on a rustic wooden table', 'in a minimalist tech setup'). Return a JSON object with a single key: 'sceneSuggestions', containing an array of 6 strings." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });
    const result = JSON.parse(response.text);
    if (result.sceneSuggestions) return result.sceneSuggestions;
    return DEFAULT_SCENE_SUGGESTIONS;
  } catch (error) {
    console.error("Error analyzing image for scene suggestions:", error);
    return DEFAULT_SCENE_SUGGESTIONS;
  }
}

/**
 * Analyzes the product image and suggests creative artistic styles.
 * @returns A promise that resolves to an array of artistic suggestions.
 */
export async function analyzeImageForArtisticSuggestions(
  base64ImageData: string,
  mimeType: string
): Promise<string[]> {
  try {
     const response = await ai.models.generateContent({
      model: textModel,
      contents: {
        parts: [
          { inlineData: { data: base64ImageData, mimeType } },
          { text: "Analyze this product image. Act as a creative director. Suggest six artistic styles (e.g., 'Vintage 90s product catalog photo', 'dramatic cinematic lighting', 'ethereal and dreamy with soft focus'). Return a JSON object with a single key: 'artisticSuggestions', containing an array of 6 strings." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            artisticSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });
    const result = JSON.parse(response.text);
    if (result.artisticSuggestions) return result.artisticSuggestions;
    return DEFAULT_ARTISTIC_SUGGESTIONS;
  } catch (error) {
    console.error("Error analyzing image for artistic suggestions:", error);
    return DEFAULT_ARTISTIC_SUGGESTIONS;
  }
}


/**
 * Analyzes an image and suggests creative editing prompts.
 * @returns A promise that resolves to an array of editing suggestions.
 */
export async function analyzeImageForEditingSuggestions(
  base64ImageData: string,
  mimeType: string
): Promise<string[]> {
  try {
     const response = await ai.models.generateContent({
      model: textModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          { text: "You are a creative photo editor. Analyze this image and suggest 6 creative ways to edit or refine it. The suggestions should be concise and actionable prompts. For example: 'make the lighting more dramatic', 'change the background to a beach scene', 'add a reflection on the surface'. Return a JSON object with a single key: 'editSuggestions', containing an array of 6 strings." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            editSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        },
      },
    });

    const jsonString = response.text;
    const result = JSON.parse(jsonString);

    if (result.editSuggestions && Array.isArray(result.editSuggestions)) {
      return result.editSuggestions;
    }

    return DEFAULT_EDITING_SUGGESTIONS;
  } catch (error) {
    console.error("Error analyzing image for editing suggestions:", error);
    return DEFAULT_EDITING_SUGGESTIONS; // Fallback on any error
  }
}

/**
 * Generates a single product image from a specific angle.
 * @returns A promise that resolves to a base64 data URL of the generated image, or null on failure.
 */
async function generateSingleImage(
  base64ImageData: string,
  mimeType: string,
  angle: string,
  stylePrompt: string,
  negativePrompt: string,
  artisticStylePrompt: string,
  styleReferenceBase64?: string,
  styleReferenceMimeType?: string
): Promise<string | null> {
  const parts: any[] = [{ inlineData: { data: base64ImageData, mimeType: mimeType } }];
  let prompt: string;

  if (styleReferenceBase64 && styleReferenceMimeType) {
    parts.push({ inlineData: { data: styleReferenceBase64, mimeType: styleReferenceMimeType } });

    prompt = `You are an expert AI art director. Your task is to create a new product photograph.

**MANDATORY INSTRUCTION: CAMERA ANGLE**
The most critical requirement is the camera angle. The new image **MUST** be from a **${angle}**. Do not deviate from this angle.

**SOURCE IMAGES:**
- **Image 1 (Product):** This is the product to be photographed.
- **Image 2 (Style Reference):** This image dictates the complete visual style.

**GOAL: REPLICATE STYLE & SCENE**
Generate a new, photorealistic image of the product from Image 1, but place it in a scene that meticulously replicates the style, mood, and composition of Image 2.

**STYLE ANALYSIS (from Image 2):**
1.  **Scene & Composition:** Recreate the background, props, surfaces, and textures from Image 2.
2.  **Lighting:** Precisely match the lighting style (e.g., soft natural light, hard shadows).
3.  **Color & Mood:** Adopt the color grading and overall mood.

**EXECUTION RULES:**
- The product from Image 1 **MUST** remain unchanged in its core design. Only its context and lighting should be transformed to match Image 2.
- The final image must be of the highest professional quality.`;

    // Add refinements from other text prompts
    if (artisticStylePrompt && artisticStylePrompt.trim() !== '') {
      prompt += `\n\n**Additional Artistic Refinement:** While matching the style of Image 2, also incorporate this specific artistic style: "${artisticStylePrompt}".`;
    }
    if (stylePrompt && stylePrompt.trim() !== '') {
      prompt += `\n\n**Additional Scene Refinement:** While matching the scene of Image 2, also incorporate these details for the style, scene, and background: "${stylePrompt}".`;
    }
    if (negativePrompt && negativePrompt.trim() !== '') {
      prompt += `\n\n**IMPORTANT EXCLUSIONS:** Do not include any of the following elements in the final image: "${negativePrompt}".`;
    }
  } else {
    // Logic for when there is no style reference image
    prompt = `You are an expert AI art director creating a professional product photograph.

**MANDATORY INSTRUCTION: CAMERA ANGLE**
The most critical requirement is the camera angle. The new image **MUST** be from a **${angle}**. This instruction is non-negotiable.

**PRODUCT CONSISTENCY:**
- The product's appearance must be identical to the one in the provided image. Do not alter its design, color, or features.

**QUALITY:**
- The final image must be high-resolution, photorealistic, and suitable for a premium e-commerce website.`;

    if (artisticStylePrompt && artisticStylePrompt.trim() !== '') {
      prompt += `\n\n**ARTISTIC STYLE:**\nThe overall artistic style should be: "${artisticStylePrompt}".`;
    }

    if (stylePrompt && stylePrompt.trim() !== '') {
      prompt += `\n\n**SCENE & BACKGROUND:**\nFollow these instructions carefully for the style, scene, and background: "${stylePrompt}".`;
    } else {
      // Default background if no style prompt is given
      prompt += `\n\n**SCENE & BACKGROUND:**\nThe image should be isolated on a clean, solid white background with realistic lighting and soft, natural shadows.`;
    }

    if (negativePrompt && negativePrompt.trim() !== '') {
      prompt += `\n\n**IMPORTANT EXCLUSIONS:**\nDo not include any of the following elements in the image: "${negativePrompt}".`;
    }
  }

  parts.push({ text: prompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: imageGenerationModel,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (part) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
    );

    if (imagePart?.inlineData) {
      const { data, mimeType: imgMimeType } = imagePart.inlineData;
      return `data:${imgMimeType};base64,${data}`;
    }
    console.warn(`No image part found for angle: ${angle}`);
    return null;
  } catch (error) {
    console.error(`Error generating image for angle "${angle}":`, error);
    return null; // Return null on error for this angle
  }
}

/**
 * Generates a full product photoshoot by creating images from multiple angles.
 * @returns A promise that resolves to an array of base64 data URLs for the generated images.
 */
export async function generateProductImages(
  base64ImageData: string, 
  mimeType: string, 
  config: PhotoshootConfig,
  onProgress: (message: string, current: number, total: number) => void,
  styleReferenceBase64?: string,
  styleReferenceMimeType?: string
): Promise<string[]> {
  const { selectedAngles, stylePrompt, negativePrompt, artisticStylePrompt } = config;
  const generatedImages: (string | null)[] = [];
  
  for (let i = 0; i < selectedAngles.length; i++) {
    const angle = selectedAngles[i];
    onProgress(`Generating "${angle}" shot (${i + 1} of ${selectedAngles.length})...`, i + 1, selectedAngles.length);
    const result = await generateSingleImage(
      base64ImageData, 
      mimeType, 
      angle, 
      stylePrompt, 
      negativePrompt, 
      artisticStylePrompt,
      styleReferenceBase64,
      styleReferenceMimeType
    );
    generatedImages.push(result);
  }
  
  // Filter out any null results from failed API calls
  return generatedImages.filter((result): result is string => result !== null);
}

/**
 * Refines an existing product image based on a text prompt.
 * @returns A promise that resolves to a base64 data URL of the refined image, or null on failure.
 */
export async function refineProductImage(base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: imageGenerationModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: `Refine this product image according to the following instruction: "${prompt}". Maintain a professional, studio-quality look suitable for e-commerce.`,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (part) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
    );

    if (imagePart?.inlineData) {
      const { data, mimeType: imgMimeType } = imagePart.inlineData;
      return `data:${imgMimeType};base64,${data}`;
    }
    console.warn(`No image part found for refinement prompt: ${prompt}`);
    return null;
  } catch (error) {
    console.error(`Error refining image with prompt "${prompt}":`, error);
    return null;
  }
}

/**
 * Generates a subtle variation of an existing image.
 * @returns A promise that resolves to a base64 data URL of the new image variation, or null on failure.
 */
export async function generateImageVariation(base64ImageData: string, mimeType: string): Promise<string | null> {
  const prompt = "Generate a new version of this product image that is a subtle variation of the original. Maintain the same product, angle, and overall professional, studio-quality style, but introduce slight, realistic changes to the lighting, shadows, or composition to provide a fresh alternative.";
  // This uses the same underlying logic as refining, just with a fixed, internal prompt.
  return refineProductImage(base64ImageData, mimeType, prompt);
}

/**
 * Upscales an image to a higher resolution, enhancing details.
 * @returns A promise that resolves to a base64 data URL of the upscaled image, or null on failure.
 */
export async function upscaleImage(base64ImageData: string, mimeType: string): Promise<string | null> {
  const prompt = "Upscale this image to a higher resolution. Enhance fine details, sharpness, and clarity while preserving the original composition, colors, and artistic style. The output must be a photorealistic, high-quality version of the input image, suitable for high-resolution displays and print.";
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: imageGenerationModel,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(
      (part) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
    );

    if (imagePart?.inlineData) {
      const { data, mimeType: imgMimeType } = imagePart.inlineData;
      return `data:${imgMimeType};base64,${data}`;
    }
    console.warn(`No image part found for upscaling.`);
    return null;
  } catch (error) {
    console.error(`Error upscaling image:`, error);
    return null;
  }
}
