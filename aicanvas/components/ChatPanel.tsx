import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useCanvasStore } from '../store/canvasStore';
import { ChevronDownIcon, ChevronUpIcon, CropIcon, RemoveBgIcon, MaximizeIcon, PlusCircleIcon, SendIcon, ExpandIcon, UploadIcon, XIcon } from './ui/Icons';

type ImageAsset = {
  id: string;
  src: string;
  prompt: string;
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const ChatPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { addImageLayer } = useCanvasStore();
    const [prompt, setPrompt] = useState('');
    const [images, setImages] = useState<ImageAsset[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCropPopoverOpen, setIsCropPopoverOpen] = useState(false);
    const [isExpandPopoverOpen, setIsExpandPopoverOpen] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const cropButtonRef = useRef<HTMLButtonElement>(null);
    const cropPopoverRef = useRef<HTMLDivElement>(null);
    const expandButtonRef = useRef<HTMLButtonElement>(null);
    const expandPopoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (galleryRef.current) {
            galleryRef.current.scrollTop = galleryRef.current.scrollHeight;
        }
    }, [images]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                cropPopoverRef.current && !cropPopoverRef.current.contains(event.target as Node) &&
                cropButtonRef.current && !cropButtonRef.current.contains(event.target as Node)
            ) {
                setIsCropPopoverOpen(false);
            }
            if (
                expandPopoverRef.current && !expandPopoverRef.current.contains(event.target as Node) &&
                expandButtonRef.current && !expandButtonRef.current.contains(event.target as Node)
            ) {
                setIsExpandPopoverOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleAddToCanvas = (image: ImageAsset) => {
        const img = new Image();
        img.onload = () => {
            addImageLayer(image.src, img.naturalWidth, img.naturalHeight);
        };
        img.src = image.src;
    };

    const handleDeleteImage = (idToDelete: string) => {
        setImages(prev => prev.filter(img => img.id !== idToDelete));
        if (selectedImageId === idToDelete) {
            setSelectedImageId(null);
        }
    }

    const processApiResponse = (response: any, originalPrompt: string) => {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const src = `data:image/png;base64,${base64ImageBytes}`;
                const newImage: ImageAsset = {
                    id: `img_${Date.now()}`,
                    src,
                    prompt: originalPrompt
                };

                const img = new Image();
                img.onload = () => addImageLayer(src, img.naturalWidth, img.naturalHeight);
                img.src = src;

                setImages(prev => [...prev, newImage]);
                setSelectedImageId(newImage.id);
                return;
            }
        }
        throw new Error("No image data found in API response.");
    }
    
    const callGenerativeApi = async (textPrompt: string, image?: ImageAsset) => {
        setIsLoading(true);
        setError(null);
        try {
            const parts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: textPrompt }];
            if (image) {
                const base64Data = image.src.split(',')[1];
                parts.unshift({
                    inlineData: {
                        data: base64Data,
                        mimeType: 'image/png',
                    },
                });
            }
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts },
                config: { responseModalities: [Modality.IMAGE] },
            });
            processApiResponse(response, textPrompt);
        } catch (err) {
            console.error(err);
            setError('Failed to generate image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    const handleGenerate = () => {
        if (!prompt.trim() || isLoading) return;
        callGenerativeApi(prompt);
        setPrompt('');
    };

    const handleEdit = (action: 'upscale' | 'remove-bg') => {
        const selectedImage = images.find(img => img.id === selectedImageId);
        if (!selectedImage || isLoading) return;
        
        let editPrompt = '';
        switch(action) {
            case 'upscale': editPrompt = `Upscale and enhance this image to the highest quality: ${selectedImage.prompt}`; break;
            case 'remove-bg': editPrompt = 'Remove the background of this image perfectly, leaving a transparent background.'; break;
        }
        
        callGenerativeApi(editPrompt, selectedImage);
    }
    
    const handleExpand = (aspectRatio: string) => {
        const selectedImage = images.find(img => img.id === selectedImageId);
        if (!selectedImage || isLoading) return;

        const expandPrompt = `Seamlessly expand this image to a ${aspectRatio} aspect ratio using generative fill. Maintain the original style and content, extending the background naturally.`;
        callGenerativeApi(expandPrompt, selectedImage);
        setIsExpandPopoverOpen(false);
    };

    const handleCrop = (aspectRatio: string) => {
        const selectedImage = images.find(img => img.id === selectedImageId);
        if (!selectedImage || isLoading) return;

        const cropPrompt = `Crop this image to a ${aspectRatio} aspect ratio. Ensure the main subject is well-framed.`;
        callGenerativeApi(cropPrompt, selectedImage);
        setIsCropPopoverOpen(false); // Close popover after action
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                const newImage: ImageAsset = {
                    id: `img_${Date.now()}`,
                    src,
                    prompt: 'Uploaded image'
                };
                setImages(prev => [...prev, newImage]);
                setSelectedImageId(newImage.id);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const selectedImage = images.find(img => img.id === selectedImageId);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute left-1/2 -translate-x-1/2 -top-4 w-16 h-4 bg-nutshel-gray border-t border-l border-r border-white/10 rounded-t-lg flex items-center justify-center text-gray-400 hover:text-white z-20"
                aria-label={isOpen ? "Hide AI panel" : "Show AI panel"}
                title={isOpen ? "Hide AI panel" : "Show AI panel"}
            >
                {isOpen ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronUpIcon className="w-4 h-4" />}
            </button>
            <div className={`bg-nutshel-gray border-t border-white/10 z-10 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'h-36' : 'h-0'}`}>
                <div className="p-4 flex gap-4 h-full">
                    {/* Controls */}
                    <div className="w-96 flex flex-col gap-2">
                         <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="flex gap-2">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Generate an image of a cat driving a sports car..."
                                className="flex-1 p-2 border border-white/10 rounded-md bg-white/5 text-gray-200 placeholder:text-gray-500 focus:ring-2 focus:ring-nutshel-blue outline-none"
                            />
                            <button type="submit" disabled={isLoading} title="Generate Image" className="p-2 w-10 h-10 flex items-center justify-center bg-nutshel-blue text-black rounded-md hover:opacity-90 disabled:bg-gray-500 disabled:opacity-50">
                                <SendIcon className="w-5 h-5"/>
                            </button>
                        </form>
                        {error && <p className="text-red-500 text-xs">{error}</p>}
                        
                        <div className="mt-auto grid grid-cols-5 gap-2">
                            <EditButton label="Upscale" onClick={() => handleEdit('upscale')} disabled={!selectedImage || isLoading}><MaximizeIcon className="w-5 h-5"/></EditButton>
                            <div className="relative">
                                <button
                                    ref={expandButtonRef}
                                    onClick={() => setIsExpandPopoverOpen(p => !p)}
                                    disabled={!selectedImage || isLoading}
                                    title="Magic Expand"
                                    className="w-full h-full flex flex-col items-center justify-center p-2 rounded-md bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ExpandIcon className="w-5 h-5"/>
                                    <span className="text-xs mt-1 font-medium">Expand</span>
                                </button>
                                {isExpandPopoverOpen && (
                                    <div ref={expandPopoverRef} className="absolute bottom-full mb-2 w-40 bg-nutshel-gray-dark border border-white/10 rounded-lg shadow-lg p-1 z-10">
                                        <CropOption onClick={() => handleExpand('1:1')}>Square (1:1)</CropOption>
                                        <CropOption onClick={() => handleExpand('16:9')}>Landscape (16:9)</CropOption>
                                        <CropOption onClick={() => handleExpand('9:16')}>Portrait (9:16)</CropOption>
                                        <CropOption onClick={() => handleExpand('4:3')}>Standard (4:3)</CropOption>
                                        <CropOption onClick={() => handleExpand('3:4')}>Tall (3:4)</CropOption>
                                    </div>
                                )}
                            </div>
                             <div className="relative">
                                <button
                                    ref={cropButtonRef}
                                    onClick={() => setIsCropPopoverOpen(p => !p)}
                                    disabled={!selectedImage || isLoading}
                                    title="Crop"
                                    className="w-full h-full flex flex-col items-center justify-center p-2 rounded-md bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <CropIcon className="w-5 h-5"/>
                                    <span className="text-xs mt-1 font-medium">Crop</span>
                                </button>
                                {isCropPopoverOpen && (
                                    <div ref={cropPopoverRef} className="absolute bottom-full mb-2 w-40 bg-nutshel-gray-dark border border-white/10 rounded-lg shadow-lg p-1 z-10">
                                        <CropOption onClick={() => handleCrop('1:1')}>Square (1:1)</CropOption>
                                        <CropOption onClick={() => handleCrop('16:9')}>Landscape (16:9)</CropOption>
                                        <CropOption onClick={() => handleCrop('9:16')}>Portrait (9:16)</CropOption>
                                        <CropOption onClick={() => handleCrop('4:3')}>Standard (4:3)</CropOption>
                                        <CropOption onClick={() => handleCrop('3:4')}>Tall (3:4)</CropOption>
                                    </div>
                                )}
                            </div>
                            <EditButton label="Remove BG" onClick={() => handleEdit('remove-bg')} disabled={!selectedImage || isLoading}><RemoveBgIcon className="w-5 h-5"/></EditButton>
                            <EditButton label="Upload" onClick={() => fileInputRef.current?.click()} disabled={isLoading}><UploadIcon className="w-5 h-5"/></EditButton>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden"/>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    <div ref={galleryRef} className="flex-1 flex gap-3 overflow-x-auto bg-black/20 rounded-lg p-2">
                        {images.map(img => (
                            <div key={img.id} className="relative flex-shrink-0 group" onClick={() => setSelectedImageId(img.id)}>
                                <img 
                                    src={img.src} 
                                    alt={img.prompt}
                                    className={`w-28 h-28 object-cover rounded-lg cursor-pointer ring-2 ${selectedImageId === img.id ? 'ring-nutshel-blue' : 'ring-transparent'}`}
                                />
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id); }}
                                    className="absolute top-1.5 left-1.5 bg-black/40 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                                    title="Delete Image"
                                >
                                    <XIcon className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleAddToCanvas(img); }}
                                    className="absolute top-1.5 right-1.5 bg-black/40 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 hover:bg-nutshel-blue hover:text-black transition-all"
                                    title="Add to Canvas"
                                    >
                                        <PlusCircleIcon className="w-5 h-5" />
                                    </button>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="w-28 h-28 flex-shrink-0 bg-white/5 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nutshel-blue"></div>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditButton: React.FC<{label: string; onClick: () => void; disabled: boolean; children: React.ReactNode}> = ({label, onClick, disabled, children}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={label}
        className="flex flex-col items-center justify-center p-2 rounded-md bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
        {children}
        <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
);

const CropOption: React.FC<{onClick: () => void; children: React.ReactNode}> = ({onClick, children}) => (
    <button
        onClick={onClick}
        className="w-full text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10 transition-colors"
    >
        {children}
    </button>
);

export default ChatPanel;