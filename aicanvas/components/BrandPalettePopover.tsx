import React, { useState } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { GoogleGenAI, Type } from '@google/genai';
import { WandIcon } from './ui/Icons';

interface BrandPalettePopoverProps {
  onClose: () => void;
}

interface BrandIdentity {
    colors: string[];
    fonts: string[];
    logoStyle: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const loadGoogleFont = (fontFamily: string) => {
    const formattedFontFamily = fontFamily.replace(/ /g, '+');
    const linkId = `google-font-${formattedFontFamily}`;
    if (document.getElementById(linkId)) return;

    const link = document.createElement('link');
    link.id = linkId;
    link.href = `https://fonts.googleapis.com/css2?family=${formattedFontFamily}:wght@400;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
};


const BrandPalettePopover = React.forwardRef<HTMLDivElement, BrandPalettePopoverProps>(({ onClose }, ref) => {
  const { setBrandColors, addCustomFont } = useCanvasStore();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandIdentity, setBrandIdentity] = useState<BrandIdentity | null>(null);

  const handleGenerate = async () => {
    if (!url.trim()) {
        setError("Please enter a URL or brand name.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setBrandIdentity(null);

    const prompt = `You are a world-class brand identity expert. A user has provided the name of their brand, which is also their website URL or social media handle: "${url}". Based on this name, generate a plausible and aesthetically pleasing brand identity. Your response must be a valid JSON object only, with no other text or explanations. For colors, provide 4-6 hex codes. For fonts, provide 2-3 Google Font names that pair well together. For logoStyle, provide a brief, one-sentence description of a suitable logo.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        colors: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of 4-6 hex color codes that represent the brand palette."
                        },
                        fonts: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of 2-3 Google Font names that pair well together."
                        },
                        logoStyle: {
                            type: Type.STRING,
                            description: "A brief, one-sentence description of a suitable logo style."
                        }
                    },
                    required: ['colors', 'fonts', 'logoStyle']
                }
            }
        });

        const result: BrandIdentity = JSON.parse(response.text);
        setBrandIdentity(result);

        // Add to store
        setBrandColors(result.colors);
        result.fonts.forEach(font => {
            loadGoogleFont(font);
            addCustomFont(font);
        });

    } catch (err) {
        console.error("Error generating brand identity:", err);
        setError("Sorry, we couldn't generate the brand palette. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div ref={ref} className="absolute left-28 top-24 bg-nutshel-gray rounded-xl shadow-lg p-4 z-10 border border-white/10 w-80">
        <h4 className="text-sm font-bold text-gray-400 mb-3 tracking-wider">GENERATE BRAND PALETTE</h4>
        <div className="flex gap-2">
            <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g., notion.so or @nike"
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
        {brandIdentity && (
            <div className="mt-4 space-y-3 pt-3 border-t border-white/10">
                <div>
                    <h5 className="text-xs font-semibold text-gray-400 mb-1.5">COLOR PALETTE</h5>
                    <div className="flex flex-wrap gap-2">
                        {brandIdentity.colors.map(color => (
                            <div key={color} className="w-6 h-6 rounded-full border-2 border-white/10" style={{ backgroundColor: color }} title={color} />
                        ))}
                    </div>
                </div>
                 <div>
                    <h5 className="text-xs font-semibold text-gray-400 mb-1.5">TYPOGRAPHY</h5>
                    <div className="flex flex-wrap gap-2">
                        {brandIdentity.fonts.map(font => (
                           <div key={font} className="px-2 py-1 bg-white/5 rounded-md text-sm text-gray-300" style={{ fontFamily: font }}>{font}</div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h5 className="text-xs font-semibold text-gray-400 mb-1.5">LOGO STYLE</h5>
                    <p className="text-sm text-gray-300">{brandIdentity.logoStyle}</p>
                </div>
                <p className="text-xs text-center text-gray-500 pt-2">Assets added to your libraries.</p>
            </div>
        )}
    </div>
  );
});

export default BrandPalettePopover;