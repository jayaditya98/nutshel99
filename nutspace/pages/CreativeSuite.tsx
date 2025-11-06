import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Modality, GenerateContentResponse } from '@google/genai';

interface Tool {
  title: string;
  description: string;
  actionText: string;
}

const fileToGenerativePart = async (file: File) => {
    const base64encodedData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: {
            data: base64encodedData,
            mimeType: file.type,
        },
    };
};

const RemoveBackgroundModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (files: FileList | null) => {
        if (files && files[0]) {
            const file = files[0];
            setImageFile(file);
            setResultImage(null);
            setError(null);
            const reader = new FileReader();
            reader.onload = (e) => setOriginalImage(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveBackground = async () => {
        if (!imageFile) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const imagePart = await fileToGenerativePart(imageFile);
            const textPart = { text: "Remove the background from this image. The subject should be perfectly isolated. The background should be transparent." };

            const response: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
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
                        setResultImage(imageUrl);
                        imageFound = true;
                        break;
                    }
                }
            }
            if (!imageFound) {
                setError("The model did not return an image. Please try another image.");
            }

        } catch (e: any) {
            console.error(e);
            setError(`Failed to process image: ${e.message || 'An unknown error occurred'}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetState = () => {
        setImageFile(null);
        setOriginalImage(null);
        setResultImage(null);
        setIsLoading(false);
        setError(null);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4" onClick={resetState}>
            <div className="bg-nutshel-gray-dark border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-8 space-y-6 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Remove Background</h2>
                    <button onClick={resetState} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 min-h-[400px]">
                    {!originalImage ? (
                         <label className="w-full h-full border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-center text-gray-400 hover:border-nutshel-accent hover:text-white transition-colors cursor-pointer p-4">
                            <input type="file" className="hidden" onChange={e => handleFileChange(e.target.files)} accept="image/*" />
                            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-4-4V6a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16v-4a4 4 0 00-4-4H8a4 4 0 00-4 4v4m16 0h-2m-6 0h-2"></path></svg>
                            <span>Click to browse or drag & drop an image</span>
                        </label>
                    ) : (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-center">Original</h3>
                            <div className="aspect-square bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
                                <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
                            </div>
                        </div>
                    )}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-center">Result</h3>
                        <div className="aspect-square bg-black/20 rounded-lg overflow-hidden flex items-center justify-center">
                            {isLoading ? (
                                <div className="flex flex-col items-center text-white-87">
                                    <svg className="animate-spin h-10 w-10 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing...
                                </div>
                            ) : error ? (
                                <p className="text-red-400 text-sm p-4 text-center">{error}</p>
                            ) : resultImage ? (
                                <img src={resultImage} alt="Result" className="max-w-full max-h-full object-contain" />
                            ) : (
                               <p className="text-gray-500 text-sm p-4 text-center">Result will appear here</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button onClick={resetState} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">Close</button>
                    {resultImage ? (
                        <a href={resultImage} download="background-removed.png" className="bg-nutshel-accent hover:opacity-90 text-black font-semibold py-2.5 px-6 rounded-lg transition-colors">Download</a>
                    ) : (
                         <button onClick={handleRemoveBackground} disabled={!imageFile || isLoading} className="bg-nutshel-accent hover:opacity-90 text-black font-semibold py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? 'Processing...' : 'Remove Background'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


const ToolCard: React.FC<{ tool: Tool & { onClick?: () => void } }> = ({ tool }) => (
  <div className="bg-nutshel-gray p-6 rounded-2xl border border-white/10 flex flex-col justify-between transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-nutshel-accent/20 hover:border-white/20">
    <div>
      <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
      <p className="text-gray-400 text-sm mb-6">{tool.description}</p>
    </div>
    <button onClick={tool.onClick || (() => alert(`${tool.actionText} feature coming soon!`))} className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-2.5 px-4 rounded-full text-sm transition-colors">
      {tool.actionText}
    </button>
  </div>
);

const CreativeSuite: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const tools: (Tool & { onClick?: () => void })[] = [
      {
        title: 'Image Upscale',
        description: 'Enhance and increase the resolution of any image with AI. Powered by Upscayl.',
        actionText: 'Upscale Image',
      },
      {
        title: 'Remove background',
        description: 'Isolate the image subject on a transparent background with a single click. Powered by Gemini.',
        actionText: 'Remove Background',
        onClick: () => setIsModalOpen(true),
      },
      {
        title: 'Quick Editor',
        description: 'Quickly crop, flip, mirror, or apply professional filters to your images.',
        actionText: 'Edit Image',
      },
      {
        title: 'Selective Editing',
        description: 'Intelligently change the background, swap objects, or erase unwanted elements from your photos.',
        actionText: 'Start Editing',
      },
      {
        title: 'Expand Image',
        description: 'Expand the canvas of your image to mutliple aspect ratios and let AI fill in the new areas contextually.',
        actionText: 'Extend Image',
      },
    ];

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto">
        <header className="space-y-2 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Edit Images
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">A collection of powerful, AI-driven tools to perfect your images and bring your creative visions to life.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <ToolCard key={index} tool={tool} />
          ))}
        </div>
      </div>
      <RemoveBackgroundModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default CreativeSuite;