import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanvasStore } from '../store/canvasStore';
import { UndoIcon, RedoIcon, FontIcon, CanvasSizeIcon, ChevronDownIcon, MenuIcon, FilePlusIcon, FolderIcon, CopyIcon, EditIcon, SaveIcon, ChevronLeftIcon } from './ui/Icons';
import ResizeModal from './ResizeModal';
import { Layer, LayerType, TextLayerProps, ImageLayerProps, ShapeLayerProps, GroupLayerProps } from '../types';
import { useProjects } from '../../contexts/ProjectContext';
import SaveDesignModal from './SaveDesignModal';


declare global {
    const html2canvas: any;
    const jspdf: {
        jsPDF: new (options: any) => any;
    };
}

// --- SVG Export Helpers ---

// SVG Path Generators (copied from LayerComponent.tsx for self-containment)
const getPolygonPath = (points: number = 6): string => {
  const centerX = 50;
  const centerY = 50;
  const radius = 50;
  const angleStep = (Math.PI * 2) / points;
  let path = 'M ';
  for (let i = 0; i < points; i++) {
    const angle = angleStep * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    path += `${x.toFixed(2)},${y.toFixed(2)} L `;
  }
  return path.slice(0, -2) + ' Z';
};

const getStarPath = (points: number = 5, innerRadiusRatio: number = 0.5): string => {
    const centerX = 50;
    const centerY = 50;
    const outerRadius = 50;
    const innerRadius = outerRadius * innerRadiusRatio;
    const angleStep = Math.PI / points;

    let path = 'M ';
    for (let i = 0; i < 2 * points; i++) {
        const isOuter = i % 2 === 0;
        const radius = isOuter ? outerRadius : innerRadius;
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        path += `${x.toFixed(2)},${y.toFixed(2)} L `;
    }
    return path.slice(0, -2) + ' Z';
};

const predefinedPaths = {
  triangle: "M 50 0 L 100 86.6 L 0 86.6 Z",
  arrow: "M 0 25 L 60 25 L 60 0 L 100 50 L 60 100 L 60 75 L 0 75 Z",
  heart: "M 50 95 C 20 95 0 65 0 45 C 0 25 20 5 50 35 C 80 5 100 25 100 45 C 100 65 80 95 50 95 Z",
  diamond: "M 50 0 L 100 50 L 50 100 L 0 50 Z",
  parallelogram: "M 25 0 L 100 0 L 75 100 L 0 100 Z",
  trapezoid: "M 20 0 L 80 0 L 100 100 L 0 100 Z",
};


// Helper to convert image URL to data URI
const imageToDataUri = async (url: string): Promise<string> => {
    if (url.startsWith('data:image')) {
        return url;
    }
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Failed to fetch and convert image:', url, error);
        return ''; // Return empty string on failure
    }
};

// Recursive helper to generate SVG elements from layers
const generateSvgElements = async (layers: Layer[]): Promise<string> => {
    let elements = '';
    for (const layer of layers) {
        if (!layer.visible) continue;

        let elementString = '';
        const props = layer.properties;

        switch (layer.type) {
            case LayerType.Rectangle:
            case LayerType.Square: {
                const rectProps = props as ShapeLayerProps;
                elementString = `<rect x="0" y="0" width="${layer.width}" height="${layer.height}" fill="${rectProps.fill}" stroke="${rectProps.stroke}" stroke-width="${rectProps.strokeWidth}" rx="${rectProps.cornerRadius?.[0] || 0}" />`;
                break;
            }
            case LayerType.Ellipse:
            case LayerType.Circle: {
                const ellipseProps = props as ShapeLayerProps;
                elementString = `<ellipse cx="${layer.width / 2}" cy="${layer.height / 2}" rx="${layer.width / 2}" ry="${layer.height / 2}" fill="${ellipseProps.fill}" stroke="${ellipseProps.stroke}" stroke-width="${ellipseProps.strokeWidth}" />`;
                break;
            }
            case LayerType.Text: {
                const textProps = props as TextLayerProps;
                const anchor = textProps.textAlign === 'left' ? 'start' : textProps.textAlign === 'center' ? 'middle' : 'end';
                let xPos = 0;
                if (anchor === 'middle') xPos = layer.width / 2;
                if (anchor === 'end') xPos = layer.width;

                const lines = textProps.text.split('\n');
                const tspans = lines.map((line, index) => 
                    `<tspan x="${xPos}" dy="${index === 0 ? 0 : textProps.lineHeight * textProps.fontSize}">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</tspan>`
                ).join('');

                elementString = `<text y="${textProps.fontSize * 0.8}" font-family="${textProps.fontFamily}" font-size="${textProps.fontSize}" font-weight="${textProps.fontWeight}" font-style="${textProps.fontStyle}" fill="${textProps.color}" text-anchor="${anchor}" letter-spacing="${textProps.letterSpacing}" style="text-transform: ${textProps.textTransform}; text-decoration: ${textProps.textDecoration}; white-space: pre;">${tspans}</text>`;
                break;
            }
            case LayerType.Image: {
                const imageProps = props as ImageLayerProps;
                const dataUri = await imageToDataUri(imageProps.src);
                if (dataUri) {
                    const flipX = imageProps.flipHorizontal;
                    const flipY = imageProps.flipVertical;
                    let scaleTransform = '';
                    if (flipX || flipY) {
                        const scaleXVal = flipX ? -1 : 1;
                        const scaleYVal = flipY ? -1 : 1;
                        const tx = flipX ? layer.width : 0;
                        const ty = flipY ? layer.height : 0;
                        scaleTransform = `transform="translate(${tx}, ${ty}) scale(${scaleXVal}, ${scaleYVal})"`;
                    }
                    elementString = `<image href="${dataUri}" x="0" y="0" width="${layer.width}" height="${layer.height}" ${scaleTransform} />`;
                }
                break;
            }
            case LayerType.Group: {
                elementString = await generateSvgElements((props as GroupLayerProps).children);
                break;
            }
            default: {
                const shapeProps = props as ShapeLayerProps;
                let pathData = '';
                // FIX: Replaced faulty dynamic property access with a type-safe switch statement.
                // The original code had a casing mismatch between LayerType enum values (e.g., "Triangle")
                // and predefinedPaths object keys (e.g., "triangle"), causing the logic to fail
                // and resulting in a TypeScript error on an unsafe type cast.
                switch (layer.type) {
                    case LayerType.Triangle: pathData = predefinedPaths.triangle; break;
                    case LayerType.Arrow: pathData = predefinedPaths.arrow; break;
                    case LayerType.Heart: pathData = predefinedPaths.heart; break;
                    case LayerType.Diamond: pathData = predefinedPaths.diamond; break;
                    case LayerType.Parallelogram: pathData = predefinedPaths.parallelogram; break;
                    case LayerType.Trapezoid: pathData = predefinedPaths.trapezoid; break;
                    case LayerType.Polygon:
                        pathData = getPolygonPath(shapeProps.points);
                        break;
                    case LayerType.Star:
                        pathData = getStarPath(shapeProps.points, shapeProps.innerRadiusRatio);
                        break;
                }

                if (pathData) {
                    const strokeScale = 100 / Math.max(layer.width, layer.height);
                    elementString = `<g transform="scale(${layer.width / 100}, ${layer.height / 100})"><path d="${pathData}" fill="${shapeProps.fill}" stroke="${shapeProps.stroke}" stroke-width="${shapeProps.strokeWidth * strokeScale}" vector-effect="non-scaling-stroke" /></g>`;
                }
            }
        }
        
        if (elementString) {
            const transform = `transform="translate(${layer.x}, ${layer.y}) rotate(${layer.rotation}, ${layer.width / 2}, ${layer.height / 2})"`;
            elements += `<g ${transform} opacity="${layer.opacity}">${elementString}</g>\n`;
        }
    }
    return elements;
};


const TopBarButton: React.FC<{ onClick?: () => void; children: React.ReactNode; label: string }> = ({ onClick, children, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className="p-2 rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
  >
    {children}
  </button>
);

const MenuItem: React.FC<{icon: React.ReactNode; onClick: () => void; children: React.ReactNode; disabled?: boolean;}> = ({ icon, onClick, children, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md text-gray-200 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
        <span className="w-5 h-5 flex items-center justify-center text-gray-400">{icon}</span>
        <span>{children}</span>
    </button>
);


const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const { addProjectAssetFromCanvas } = useProjects();
  const { canvasName, setCanvasName, newCanvas, addCustomFont, undo, redo } = useCanvasStore();
  const fontInputRef = useRef<HTMLInputElement>(null);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(canvasName);
  const menuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
            setIsDownloadMenuOpen(false);
        }
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setTempName(canvasName);
  }, [canvasName]);
  
  const handleNameSave = () => {
    if (tempName.trim()) {
      setCanvasName(tempName.trim());
    } else {
      setTempName(canvasName); // Revert if empty
    }
    setIsEditingName(false);
  };

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.toLowerCase().endsWith('.ttf') || file.name.toLowerCase().endsWith('.otf'))) {
        try {
            const fontFamily = file.name.replace(/\.[^/.]+$/, "");
            const fontFace = new FontFace(fontFamily, await file.arrayBuffer());
            await fontFace.load();
            document.fonts.add(fontFace);
            addCustomFont(fontFace.family);
        } catch (error) {
            console.error("Failed to load font:", error);
            alert("There was an error loading the font file. Please ensure it is a valid .ttf or .otf file.");
        }
    } else {
        alert('Please upload a valid .ttf or .otf font file.');
    }
    if (e.target) {
        e.target.value = '';
    }
  };

  const handleDownload = async (format: 'png' | 'pdf' | 'jpg' | 'svg') => {
    // Handle SVG separately
    if (format === 'svg') {
        useCanvasStore.getState().setSelectedLayers([]);
        await new Promise(resolve => requestAnimationFrame(resolve));
        try {
            const { layers, canvasWidth, canvasHeight, canvasBackgroundColor } = useCanvasStore.getState();
            const svgElements = await generateSvgElements(layers);
            
            const fontFamilies = new Set<string>();
            const collectFonts = (layersToScan: Layer[]) => {
                for(const l of layersToScan) {
                    if (l.type === LayerType.Text) {
                        fontFamilies.add((l.properties as TextLayerProps).fontFamily);
                    } else if (l.type === LayerType.Group) {
                        collectFonts((l.properties as GroupLayerProps).children);
                    }
                }
            };
            collectFonts(layers);
            
            let fontDefs = '';
            if (fontFamilies.size > 0) {
                 const queryParams = Array.from(fontFamilies).map(f => `family=${f.replace(/ /g, '+')}:ital,wght@0,400;0,700;1,400;1,700`).join('&');
                 const rawFontUrl = `https://fonts.googleapis.com/css2?${queryParams}&display=swap`;
                 // Escape ampersands for XML compatibility
                 const safeFontUrl = rawFontUrl.replace(/&/g, '&amp;');
                 fontDefs = `<defs><style>@import url('${safeFontUrl}');</style></defs>`;
            }

            const svgString = `<svg width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                ${fontDefs}
                <rect width="100%" height="100%" fill="${canvasBackgroundColor}" />
                ${svgElements}
            </svg>`;

            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ai-canvas-design.svg';
            link.click();
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error generating SVG:', error);
            alert('Sorry, there was an error exporting the SVG.');
        }
        return; // Early exit for SVG
    }
  
    // Existing logic for PNG, JPG, PDF
    const loadHtml2Canvas = () => {
        return new Promise<any | null>((resolve) => {
            if (typeof html2canvas !== 'undefined') {
                resolve(html2canvas);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => resolve((window as any).html2canvas);
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });
    };

    const loadJsPDF = () => {
        return new Promise<typeof jspdf | null>((resolve) => {
            if (typeof (window as any).jspdf !== 'undefined') {
                resolve((window as any).jspdf);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => resolve((window as any).jspdf);
            script.onerror = () => resolve(null);
            document.head.appendChild(script);
        });
    };
  
    const h2c = await loadHtml2Canvas();
    if (!h2c) {
      console.error('html2canvas not loaded');
      alert('Could not load download library. Please try again.');
      return;
    }
  
    const viewport = document.getElementById('viewport');
    const zoomContainer = document.getElementById('zoom-container');
    const canvasElement = document.getElementById('canvas');
  
    if (!viewport || !zoomContainer || !canvasElement) {
      console.error('Could not find required elements for download');
      alert('An unexpected error occurred. Could not find canvas elements.');
      return;
    }
  
    useCanvasStore.getState().setSelectedLayers([]);
    await new Promise(resolve => requestAnimationFrame(resolve));
  
    const originalViewportTransform = viewport.style.transform;
    const originalZoomTransform = zoomContainer.style.transform;
  
    try {
      viewport.style.transform = '';
      zoomContainer.style.transform = '';
  
      const callableH2c = (h2c as any).default || h2c;
      if (typeof callableH2c !== 'function') {
        console.error('html2canvas is not a function');
        return;
      }
      
      const canvas = await callableH2c(canvasElement, {
        useCORS: true,
        scale: 2,
        logging: false,
        backgroundColor: useCanvasStore.getState().canvasBackgroundColor,
      });
  
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = 'ai-canvas-design.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } else if (format === 'jpg') {
        const link = document.createElement('a');
        link.download = 'ai-canvas-design.jpg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
      } else if (format === 'pdf') {
        const jsPDFModule = await loadJsPDF();
        if (!jsPDFModule) {
          console.error('jsPDF not loaded');
          alert('Could not load PDF library. Please try again.');
          return;
        }
        const { jsPDF } = jsPDFModule;
        const imgData = canvas.toDataURL('image/png');
        
        const pdfWidth = useCanvasStore.getState().canvasWidth;
        const pdfHeight = useCanvasStore.getState().canvasHeight;

        const orientation = pdfWidth > pdfHeight ? 'l' : 'p';
        
        const pdf = new jsPDF({
          orientation,
          unit: 'px',
          format: [pdfWidth, pdfHeight]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('ai-canvas-design.pdf');
      }
  
    } catch (error) {
      console.error('Error during canvas capture:', error);
      alert('Sorry, there was an error exporting the image.');
    } finally {
      viewport.style.transform = originalViewportTransform;
      zoomContainer.style.transform = originalZoomTransform;
    }
  };

  return (
    <>
      <div className="h-16 bg-black/20 backdrop-blur-xl flex items-center px-4 z-20 border-b border-white/10">
        <div className="flex items-center gap-2">
            <TopBarButton onClick={() => navigate('/workspace/dashboard')} label="Back">
                <ChevronLeftIcon className="w-5 h-5" />
            </TopBarButton>
            <div className="relative" ref={menuRef}>
                <TopBarButton onClick={() => setIsMenuOpen(p => !p)} label="File Menu">
                    <MenuIcon className="w-5 h-5" />
                </TopBarButton>
                {isMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-60 bg-nutshel-gray-dark border border-white/10 rounded-md shadow-lg z-30 p-2">
                        <MenuItem icon={<FilePlusIcon className="w-5 h-5"/>} onClick={() => { newCanvas(); setIsMenuOpen(false); }}>New Blank Canvas</MenuItem>
                        <MenuItem icon={<FolderIcon className="w-5 h-5"/>} onClick={() => alert('Feature not implemented')} disabled>Open...</MenuItem>
                        <MenuItem icon={<CopyIcon className="w-5 h-5"/>} onClick={() => alert('Feature not implemented')} disabled>Duplicate Canvas</MenuItem>
                        <div className="h-px bg-white/10 my-1"></div>
                        <MenuItem icon={<EditIcon className="w-5 h-5"/>} onClick={() => { setIsEditingName(true); setIsMenuOpen(false); }}>Rename</MenuItem>
                        <MenuItem icon={<SaveIcon className="w-5 h-5"/>} onClick={() => alert('Feature not implemented')} disabled>Save</MenuItem>
                    </div>
                )}
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              AI Canvas
            </h1>
        </div>
        
        <div className="border-l border-white/10 h-6 mx-4"></div>

        {isEditingName ? (
            <input
                ref={nameInputRef}
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setIsEditingName(false); }}
                className="text-sm font-medium bg-white/10 text-white rounded-md px-2 py-1 w-48 outline-none ring-2 ring-nutshel-blue"
            />
        ) : (
            <div 
                onDoubleClick={() => setIsEditingName(true)}
                className="text-sm font-medium text-gray-300 px-2 py-1 rounded-md hover:bg-white/10 cursor-pointer"
                title="Double-click to rename"
            >
                {canvasName}
            </div>
        )}


        <div className="flex items-center gap-1 ml-4">
          <TopBarButton onClick={() => setIsResizeModalOpen(true)} label="Resize Canvas">
            <CanvasSizeIcon className="w-5 h-5" />
          </TopBarButton>
          <div className="border-l border-white/10 h-6 mx-2"></div>
          <TopBarButton onClick={undo} label="Undo">
              <UndoIcon className="w-5 h-5" />
          </TopBarButton>
          <TopBarButton onClick={redo} label="Redo">
              <RedoIcon className="w-5 h-5" />
          </TopBarButton>
        </div>
        <div className="ml-auto flex items-center gap-4">
            <button
                onClick={() => fontInputRef.current?.click()}
                aria-label="Upload Font"
                className="flex items-center space-x-2 p-2 rounded-md text-gray-300 hover:bg-white/10 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue text-sm font-medium"
            >
                <FontIcon className="w-5 h-5" />
                <span>Upload Font</span>
            </button>
            <button
                onClick={() => setIsSaveModalOpen(true)}
                aria-label="Save Project"
                className="flex items-center space-x-2 px-4 py-2 rounded-full text-gray-300 bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue text-sm font-semibold"
            >
                <SaveIcon className="w-5 h-5" />
                <span>Save</span>
            </button>
            <div className="relative" ref={downloadMenuRef}>
                <button
                    onClick={() => setIsDownloadMenuOpen(p => !p)}
                    className="px-6 py-2 bg-nutshel-blue text-black font-semibold rounded-full hover:opacity-90 transition-opacity text-sm flex items-center space-x-2"
                >
                    <span>Download</span>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDownloadMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-nutshel-gray-dark border border-white/10 rounded-md shadow-lg z-20 p-1">
                        <button
                            onClick={() => { handleDownload('png'); setIsDownloadMenuOpen(false); }}
                            className="w-full text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10 transition-colors"
                        >
                            PNG Image
                        </button>
                        <button
                            onClick={() => { handleDownload('jpg'); setIsDownloadMenuOpen(false); }}
                            className="w-full text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10 transition-colors"
                        >
                            JPG Image
                        </button>
                         <button
                            onClick={() => { handleDownload('svg'); setIsDownloadMenuOpen(false); }}
                            className="w-full text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10 transition-colors"
                        >
                            SVG Vector
                        </button>
                        <button
                            onClick={() => { handleDownload('pdf'); setIsDownloadMenuOpen(false); }}
                            className="w-full text-left px-3 py-1.5 text-sm rounded-md text-gray-300 hover:bg-white/10 transition-colors"
                        >
                            PDF Document
                        </button>
                    </div>
                )}
            </div>
        </div>
        <input type="file" ref={fontInputRef} accept=".ttf,.otf" className="hidden" onChange={handleFontUpload} />
      </div>
      {isResizeModalOpen && <ResizeModal onClose={() => setIsResizeModalOpen(false)} />}
      <SaveDesignModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={async (projectId, saveAsDesign, saveAsImage) => {
          const state = useCanvasStore.getState();
          const canvasState = {
            layers: state.layers,
            canvasWidth: state.canvasWidth,
            canvasHeight: state.canvasHeight,
            canvasBackgroundColor: state.canvasBackgroundColor,
            canvasName: state.canvasName,
          };

          let imageUrl: string | undefined;
          if (saveAsImage) {
            try {
              const canvas = document.getElementById('canvas') as HTMLCanvasElement;
              if (canvas) {
                imageUrl = canvas.toDataURL('image/png');
              } else {
                // Fallback: try to capture from viewport
                const viewport = document.getElementById('viewport');
                if (viewport && typeof html2canvas !== 'undefined') {
                  const canvas = await html2canvas(viewport, {
                    backgroundColor: state.canvasBackgroundColor || '#FFFFFF',
                  });
                  imageUrl = canvas.toDataURL('image/png');
                }
              }
            } catch (error) {
              console.error('Error capturing canvas as image:', error);
            }
          }

          await addProjectAssetFromCanvas(
            projectId,
            {
              name: state.canvasName || 'Untitled Design',
              type: 'ai-canvas',
              sourceApp: 'ai-canvas',
              ...(saveAsDesign && { canvasState }),
              ...(saveAsImage && imageUrl && { imageUrls: imageUrl }),
              metadata: {
                createdAt: Date.now(),
              },
            },
            saveAsDesign,
            saveAsImage
          );

          alert('Design saved to project!');
        }}
      />
    </>
  );
};

export default TopBar;