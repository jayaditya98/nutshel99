import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { GoogleGenAI, Modality } from '@google/genai';
import { WandIcon } from './ui/Icons';

interface ElementsPopoverProps {
  onClose: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const ElementsPopover = React.forwardRef<HTMLDivElement, ElementsPopoverProps>(({ onClose }, ref) => {
    const { addImageLayer } = useCanvasStore();
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please enter a description for the element.");
            return;
        }
        setIsLoading(true);
        setError(null);

        const fullPrompt = `You are an expert graphic designer creating a single, isolated visual element based on this description: "${prompt}".

**Key Requirements:**
1.  **Isolated Element:** The subject must be the only object. No background scenery, shadows, or other objects.
2.  **True Transparent Background:** The output MUST be a PNG with a 100% transparent alpha channel. Do NOT simulate transparency with a checkerboard or colored background.
3.  **High Quality:** The element must be clean, with sharp edges, suitable for resizing.
4.  **No Extraneous Details:** Do not include any text, watermarks, or logos.

The final asset should be ready for immediate use on a design canvas.`;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: fullPrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            let imageFound = false;
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const src = `data:image/png;base64,${base64ImageBytes}`;
                    
                    const img = new Image();
                    img.onload = () => {
                        addImageLayer(src, img.naturalWidth, img.naturalHeight);
                    };
                    img.src = src;

                    imageFound = true;
                    break; 
                }
            }

            if (!imageFound) {
                throw new Error("No image data found in the API response.");
            }
            
            onClose();

        } catch (err) {
            console.error("Error generating element:", err);
            setError("Sorry, we couldn't generate the element. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div ref={ref} className="absolute left-28 top-36 bg-nutshel-gray rounded-xl shadow-lg p-4 z-10 border border-white/10 w-80">
            <h4 className="text-sm font-bold text-gray-400 mb-3 tracking-wider">GENERATE ELEMENTS</h4>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., a blue bird icon"
                    className="flex-1 p-2 border border-white/10 rounded-md bg-white/5 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-nutshel-blue outline-none text-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading}
                    className="p-2 w-10 h-10 flex items-center justify-center bg-nutshel-blue text-black rounded-md hover:opacity-90 disabled:bg-gray-500 disabled:opacity-50 transition-colors"
                >
                     {isLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                     ) : (
                        <WandIcon className="w-5 h-5"/>
                     )}
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">Describe an icon, illustration, or shape you want to create.</p>
        </div>
    );
});

export default ElementsPopover;