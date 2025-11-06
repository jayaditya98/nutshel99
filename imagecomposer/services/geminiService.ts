import { GoogleGenAI, Modality, Type } from "@google/genai";
import { CompositionState, FileWithPreview } from '../types';
import { fileToBase64 } from '../utils/fileUtils';

// This function assumes that process.env.API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Constructs a detailed, narrative prompt for image generation based on the 6-component framework
 * recommended for Gemini 2.5 Flash Image. This improves multi-image composition and style consistency.
 * @param state - The current state of the user's composition choices.
 * @returns A string representing the prompt for the AI model.
 */
function constructPrompt(state: CompositionState): string {
  // 2. Subject: The main focus of the image.
  const subject = `the ${state.subjects.length > 1 ? 'subjects' : 'subject'} from the provided images`;
  
  // 3. Action/State: Describes what the subject is doing.
  const actionState = "posed naturally and integrated seamlessly into the scene";

  // 4. Environment: The background and setting.
  let environment: string;
  if (state.background.type === 'generate') {
    environment = `a scene described as: "${state.background.description}"`;
  } else {
    environment = `the environment from the provided background image`;
  }
  
  // 6. Style/Mood: Defines the overall artistic direction.
  const styleMood = "photorealistic and cohesive";

  // Detailed descriptions for clothing, and accessories.
  let clothingLine = '';
    if (state.clothing.type === 'custom') {
        const parts = [];
        if (state.clothing.preset) {
            parts.push(`${state.clothing.preset} style`);
        }
        if (state.clothing.description) {
            parts.push(`specifically: "${state.clothing.description}"`);
        }
        if (state.clothing.file) {
            parts.push('inspired by the provided reference image');
        }

        if (parts.length > 0) {
            clothingLine = `- They are wearing clothing that is ${parts.join(', ')}.`;
        }
    }

  let accessoriesDetails = '';
  if (state.accessories.length > 0) {
    const presetAccessories = state.accessories.filter(a => a.type === 'preset').map(a => a.preset);
    const uploadedAccessoriesCount = state.accessories.filter(a => a.type === 'upload').length;

    let detailsParts = [];
    if (presetAccessories.length > 0) {
      detailsParts.push(`They should be wearing: ${presetAccessories.join(', ')}.`);
    }
    if (uploadedAccessoriesCount > 0) {
      detailsParts.push(`Additionally, incorporate the accessories from the ${uploadedAccessoriesCount} provided accessory image(s). For each one, identify the accessory, determine its best placement on the subject (like a watch on a wrist or sunglasses on a face), and blend it into the scene with realistic size, orientation, lighting, and shadows.`);
    }
    accessoriesDetails = `\nACCESSORIES: ${detailsParts.join(' ')}`;
  }
  
  // Assemble the prompt using a simpler, direct structure to avoid backend parsing issues.
  const prompt = `INSTRUCTIONS: Create a single, high-quality, seamless composite image by fusing the elements from all the provided images.

SCENE: ${subject}, who are ${actionState} in ${environment}.
STYLE: The final image should be ${styleMood}.
COMPOSITION: ${state.compositionPrompt}

SUBJECT DETAILS:
- Maintain the exact likeness of the subjects from their images.${clothingLine ? '\n' + clothingLine : ''}${accessoriesDetails}

COMPOSITION RULES: Blend all elements perfectly. Ensure realistic shadows, perspective, and lighting. The final image must look like a single, authentic photograph, not a collage.
`;

  return prompt;
}

export async function getBackgroundSuggestions(subjectImages: FileWithPreview[]): Promise<string[]> {
  if (subjectImages.length === 0) {
    throw new Error("Cannot generate suggestions without subject images.");
  }

  const model = 'gemini-2.5-flash';
  const prompt = `Analyze the subject(s) in the provided image(s). Based on their appearance and potential context, generate 4 creative and distinct background descriptions that would be suitable for a composite image. The descriptions should be concise (a few words to a short sentence) and evocative.`;

  const imageParts = [];
  // Use up to 2 subject images to give the model context.
  for (const imageFile of subjectImages.slice(0, 2)) {
    const base64Data = await fileToBase64(imageFile);
    imageParts.push({
      inlineData: {
        data: base64Data,
        mimeType: imageFile.type,
      },
    });
  }

  const contents = {
    parts: [
      ...imageParts,
      { text: prompt },
    ],
  };

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: "A creative background suggestion.",
            }
          }
        },
        required: ["suggestions"]
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (result.suggestions && Array.isArray(result.suggestions)) {
      return result.suggestions;
    }
    throw new Error("Invalid JSON structure in AI response.");
  } catch (e) {
    console.error("Failed to parse AI suggestions JSON:", response.text, e);
    throw new Error("The AI returned an unexpected format for suggestions. Please try again.");
  }
}

export async function getCompositionSuggestions(subjectImages: FileWithPreview[]): Promise<string[]> {
  if (subjectImages.length === 0) {
    throw new Error("Cannot generate suggestions without subject images.");
  }

  const model = 'gemini-2.5-flash';
  const prompt = `Analyze the subject(s) in the provided image(s). Based on their appearance, generate 4 creative and distinct composition descriptions. Each description should specify a lighting style and a shot type/framing. They should be concise (a short sentence) and evocative. Example: "Golden hour lighting, close-up portrait shot."`;

  const imageParts = [];
  // Use up to 2 subject images to give the model context.
  for (const imageFile of subjectImages.slice(0, 2)) {
    const base64Data = await fileToBase64(imageFile);
    imageParts.push({
      inlineData: {
        data: base64Data,
        mimeType: imageFile.type,
      },
    });
  }

  const contents = {
    parts: [
      ...imageParts,
      { text: prompt },
    ],
  };

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING,
              description: "A creative composition suggestion.",
            }
          }
        },
        required: ["suggestions"]
      },
    },
  });

  try {
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    if (result.suggestions && Array.isArray(result.suggestions)) {
      return result.suggestions;
    }
    throw new Error("Invalid JSON structure in AI response.");
  } catch (e) {
    console.error("Failed to parse AI suggestions JSON:", response.text, e);
    throw new Error("The AI returned an unexpected format for suggestions. Please try again.");
  }
}


export async function generateComposition(state: CompositionState): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  const prompt = constructPrompt(state);
  const MAX_IMAGES = 4; // Gemini 2.5 Flash Image supports up to 4 images.

  const imageParts = [];

  // Add subjects
  for (const subjectFile of state.subjects) {
    const base64Data = await fileToBase64(subjectFile);
    imageParts.push({
      inlineData: {
        data: base64Data,
        mimeType: subjectFile.type,
      },
    });
  }

  // Add background if uploaded
  if (state.background.type === 'upload' && state.background.file) {
    const base64Data = await fileToBase64(state.background.file);
    imageParts.push({
      inlineData: {
        data: base64Data,
        mimeType: state.background.file.type,
      },
    });
  }

  // Add clothing reference if uploaded
  if (state.clothing.type === 'custom' && state.clothing.file) {
    const base64Data = await fileToBase64(state.clothing.file);
    imageParts.push({
      inlineData: {
        data: base64Data,
        mimeType: state.clothing.file.type,
      },
    });
  }
  
  // Add accessory images
  for (const accessory of state.accessories) {
    if (accessory.type === 'upload' && accessory.file) {
        const base64Data = await fileToBase64(accessory.file);
        imageParts.push({
          inlineData: {
            data: base64Data,
            mimeType: accessory.file.type,
          },
        });
    }
  }

  if (imageParts.length > MAX_IMAGES) {
    throw new Error(`Too many images. The model supports a maximum of ${MAX_IMAGES}, but ${imageParts.length} were provided. Please reduce the number of uploaded images.`);
  }

  const contents = {
    parts: [
      ...imageParts,
      { text: prompt },
    ],
  };

  const response = await ai.models.generateContent({
    model,
    contents,
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });
  
  const candidate = response.candidates?.[0];

  if (!candidate) {
    throw new Error('Image generation failed. The API returned no content. This could be due to a network issue or an invalid request.');
  }

  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    if (candidate.finishReason === 'SAFETY') {
      const blockedRating = candidate.safetyRatings?.find(r => r.blocked);
      const category = blockedRating?.category.replace('HARM_CATEGORY_', '') || 'Unknown';
      throw new Error(`Image generation blocked for safety reasons (${category}). Please adjust your prompt or uploaded images.`);
    }
    throw new Error(`Image generation failed. Reason: ${candidate.finishReason}.`);
  }
  
  const imagePart = candidate.content?.parts?.find(part => part.inlineData);

  if (imagePart?.inlineData) {
    const base64ImageBytes: string = imagePart.inlineData.data;
    return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
  }

  throw new Error('Image generation failed. The API did not return an image in the response, although the request was successful. The model may have been unable to fulfill the request.');
}