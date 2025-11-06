import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';
import { ZapIcon } from '../components/Icons';

const tools = [
  { name: 'Design', icon: '🎨' },
  { name: 'Brand Palette', icon: '🎨' },
  { name: 'Shapes', icon: '⭐' },
  { name: 'Elements', icon: '✨' },
  { name: 'Text', icon: 'T' },
  { name: 'Own Custom Features', icon: '💎' },
];

const bottomTools = ['Upscale', 'Magic Expand', 'File Upload', 'Remove Bg'];

const AiCanvas: React.FC = () => {
    const location = useLocation();
    const [prompt, setPrompt] = useState('');
    const [initialImage, setInitialImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const { studioTitle, imageSeed, imageName } = location.state || {};
        if (studioTitle) {
            setPrompt(`A photo for a ${studioTitle.toLowerCase()}, `);
        }
        if (imageSeed) {
            const imageUrl = `https://picsum.photos/seed/${imageSeed}/512/512`;
            setInitialImage(imageUrl);
            setGeneratedImage(null);
            setPrompt(`An edit of the image "${imageName || 'of a subject'}", `);
        }
    }, [location.state]);

    const handleGenerate = async () => {
        if (!prompt && !initialImage) {
            setError('Please enter a prompt or provide an image to edit.');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const textPart = { text: prompt };
            const parts: any[] = [textPart];

            if (initialImage) {
                const response = await fetch(initialImage);
                if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                const blob = await response.blob();
                const base64data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
                
                const imagePart = {
                    inlineData: {
                        data: base64data,
                        mimeType: blob.type.startsWith('image/') ? blob.type : 'image/jpeg',
                    },
                };
                parts.unshift(imagePart);
            }

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            let imageFound = false;
            if (response.candidates && response.candidates.length > 0) {
              for (const part of response.candidates[0].content.parts) {
                  if (part.inlineData) {
                      const base64ImageBytes: string = part.inlineData.data;
                      const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                      setGeneratedImage(imageUrl);
                      setInitialImage(imageUrl); // The new image becomes the base for further edits
                      imageFound = true;
                      break; 
                  }
              }
            }
            if (!imageFound) {
                setError("The model did not return an image. Please refine your prompt.");
            }

        } catch (e: any) {
            console.error(e);
            setError(`Failed to generate image: ${e.message || 'An unknown error occurred'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const ImageDisplay: React.FC<{src: string | null; title: string; children?: React.ReactNode}> = ({ src, title, children }) => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/20 rounded-lg p-2 space-y-2">
            <span className="text-sm font-semibold text-gray-400">{title}</span>
            <div className="w-full aspect-square bg-black/20 rounded-md flex items-center justify-center overflow-hidden">
                {src ? <img src={src} alt={title} className="w-full h-full object-contain"/> : children}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-nutshel-gray-dark rounded-2xl overflow-hidden border border-white/10">
            <header className="flex items-center justify-between p-2 sm:p-3 border-b border-white/10 flex-shrink-0">
                <div className="text-base sm:text-lg font-semibold">AI Canvas</div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400 hidden sm:inline">100%</span>
                    <button 
                      onClick={() => (generatedImage || initialImage) && window.open(generatedImage || initialImage)}
                      disabled={!generatedImage && !initialImage}
                      className="px-3 sm:px-4 py-2 text-sm font-semibold rounded-full bg-nutshel-accent text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="hidden sm:inline">Download</span> ↓
                    </button>
                </div>
            </header>
            
            <div className="flex-1 flex overflow-hidden">
                <aside className="w-48 bg-nutshel-gray p-4 flex-col space-y-2 border-r border-white/10 hidden lg:flex">
                    <h3 className="font-bold text-sm px-2 text-gray-400 uppercase">Tools</h3>
                    {tools.map(tool => (
                        <button key={tool.name} className="flex items-center space-x-3 w-full text-left p-2 rounded-md hover:bg-white/10 transition-colors">
                            <span className="text-lg">{tool.icon}</span>
                            <span className="text-sm font-medium">{tool.name}</span>
                        </button>
                    ))}
                </aside>
                
                <main className="flex-1 flex flex-col bg-black/20 p-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 place-items-center bg-white/5 rounded-lg border-2 border-dashed border-white/10 p-4">
                        <ImageDisplay src={initialImage} title="Input Image">
                            <p className="text-gray-500 text-center text-sm p-4">Load an asset from a project or upload a file to start editing.</p>
                        </ImageDisplay>
                        <ImageDisplay src={generatedImage} title="Generated Image">
                           {isLoading ? (
                             <div className="flex flex-col items-center text-white-87">
                               <svg className="animate-spin h-10 w-10 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               Generating...
                             </div>
                           ) : error ? (
                             <div className="text-red-400 text-center p-4 text-sm">{error}</div>
                           ) : (
                             <div className="text-center text-gray-500 p-8">
                                <ZapIcon className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                                <p className="text-white-87 font-semibold">Your creation will appear here.</p>
                                <p className="text-xs mt-2">Describe what you want to create in the prompt bar below.</p>
                            </div>
                           )}
                        </ImageDisplay>
                    </div>

                    <div className="mt-4 flex-shrink-0">
                        <div className="flex space-x-2 justify-center mb-2">
                            {bottomTools.map(tool => (
                                <button key={tool} className="text-xs bg-nutshel-gray hover:bg-white/10 px-3 py-1.5 rounded-md transition-colors">{tool}</button>
                            ))}
                        </div>
                         <div className="relative">
                            <input
                                type="text"
                                placeholder="A photo of a red sports car driving on a coastal road at sunset, cinematic lighting"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                className="w-full bg-nutshel-gray border border-white/20 rounded-lg py-3 pl-4 pr-28 text-white focus:ring-nutshel-accent focus:border-nutshel-accent"
                            />
                            <button 
                                onClick={handleGenerate} 
                                disabled={isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-nutshel-accent text-black font-semibold px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                                {isLoading ? '...' : 'Generate'}
                            </button>
                        </div>
                    </div>
                </main>
                
                <aside className="w-64 bg-nutshel-gray p-4 border-l border-white/10 flex-col hidden lg:flex">
                    <h3 className="font-semibold mb-4">Nut Agent</h3>
                    <div className="flex-1 bg-black/20 rounded-md p-2 flex flex-col">
                        <div className="flex-1 text-sm text-gray-400">AI chat...</div>
                         <input type="text" placeholder="Type a command..." className="w-full bg-white/10 border-0 rounded-md p-2 text-sm focus:ring-1 focus:ring-nutshel-accent"/>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AiCanvas;