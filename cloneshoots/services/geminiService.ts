import { GoogleGenAI, Modality } from '@google/genai';
import { GenerationMode } from '../types';
import { fileToGenerativePart, GenerativePart } from '../utils/fileUtils';

// Ensure the API key is available from environment variables.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey });
const model = 'gemini-2.5-flash-image';

// Maps the UI mode to a specific instruction for the AI model.
const getPromptForMode = (mode: GenerationMode): string => {
  switch (mode) {
    case GenerationMode.Style:
      return "Transform the first image to embody the artistic characteristics of the second reference image. Adopt the reference image's color palette, brushstroke texture, and atmospheric lighting, while meticulously preserving the original subject's core identity, features, and spatial composition. The final output should look as if the subject from the first image was originally captured in the environment and style of the second image.";
    case GenerationMode.Pose:
      return "Using the second image as a reference for pose only, reposition the subject from the first image to match the pose. It is critical to preserve the original subject's identity, including their facial features, body, and clothing, exactly as they appear in the first image. The background and artistic style of the first image should also be maintained. Transfer only the pose.";
    default:
      // This function should not be called with 'Both' mode, as it's handled separately in `generateImage`.
      throw new Error(`Unsupported generation mode for direct prompting: ${mode}`);
  }
};

/**
 * Performs a single image generation call to the Gemini API.
 * @param image1Part The first image (e.g., original subject).
 * @param image2Part The second image (e.g., reference).
 * @param prompt The text instruction for the model.
 * @returns A promise resolving to the base64 data URL of the generated image.
 */
const performSingleGeneration = async (
  image1Part: GenerativePart,
  image2Part: GenerativePart,
  prompt: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [image1Part, image2Part, { text: prompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imagePart?.inlineData) {
    const { mimeType, data } = imagePart.inlineData;
    return `data:${mimeType};base64,${data}`;
  } else {
    const textResponse = response.text?.trim();
    if (textResponse) {
      throw new Error(`The model did not return an image. Response: "${textResponse}"`);
    }
    throw new Error('Image generation failed. The model did not return a valid image.');
  }
};


/**
 * Generates an image by combining an original image and a reference image based on a specified mode.
 * @param originalImage The user's primary image file.
 * @param referenceImage The image providing the style and/or pose reference.
 * @param mode The generation mode ('style', 'pose', or 'both').
 * @returns A promise that resolves to a base64 encoded data URL of the generated image.
 */
export const generateImage = async (
  originalImage: File,
  referenceImage: File,
  mode: GenerationMode
): Promise<string> => {
  try {
    const originalImagePart = await fileToGenerativePart(originalImage);
    const referenceImagePart = await fileToGenerativePart(referenceImage);

    if (mode === GenerationMode.Both) {
      // For 'Both' mode, we use a more reliable two-step process.
      
      // Step 1: Transfer the pose.
      const posePrompt = getPromptForMode(GenerationMode.Pose);
      const poseTransferredImage = await performSingleGeneration(
        originalImagePart,
        referenceImagePart,
        posePrompt
      );

      // Prepare the result of step 1 as input for step 2.
      const mimeType = poseTransferredImage.split(';')[0].split(':')[1];
      const base64Data = poseTransferredImage.split(',')[1];
      if (!mimeType || !base64Data) {
          throw new Error('Failed to parse intermediate image from pose transfer step.');
      }
      const poseTransferredImagePart: GenerativePart = {
        inlineData: { mimeType, data: base64Data },
      };

      // Step 2: Apply the style to the new pose-transferred image.
      const stylePrompt = getPromptForMode(GenerationMode.Style);
      const finalImage = await performSingleGeneration(
        poseTransferredImagePart,
        referenceImagePart, // The original reference is used again for its style.
        stylePrompt
      );
      
      return finalImage;

    } else {
      // For 'Style' or 'Pose' mode, perform a single generation.
      const promptText = getPromptForMode(mode);
      return await performSingleGeneration(
        originalImagePart,
        referenceImagePart,
        promptText
      );
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Re-throw a more user-friendly error message.
    throw new Error('Failed to generate image. Please check the console for details.');
  }
};
