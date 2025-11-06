import React, { useRef, useState, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { LayerType } from '../types';
import { TextIcon, ShapesIcon, PaletteIcon, BlocksIcon, UploadIcon } from './ui/Icons';
import ShapesPopover from './ShapesPopover';
import BrandPalettePopover from './BrandPalettePopover';
import ElementsPopover from './GenerateElementPopover';
import ImportImageModal from './ImportImageModal';

const IconButton: React.FC<{ onClick?: () => void; children: React.ReactNode; label: string }> = ({ onClick, children, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex flex-col items-center justify-center p-3 w-full rounded-lg bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
  >
    {children}
    <span className="text-xs mt-2 font-medium text-gray-300">{label}</span>
  </button>
);

const Toolbar: React.FC = () => {
  const { addLayer, addImageLayer } = useCanvasStore();
  const [isShapesPopoverOpen, setShapesPopoverOpen] = useState(false);
  const [isBrandPaletteOpen, setBrandPaletteOpen] = useState(false);
  const [isElementsPopoverOpen, setElementsPopoverOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const shapesButtonRef = useRef<HTMLButtonElement>(null);
  const brandButtonRef = useRef<HTMLButtonElement>(null);
  const elementsButtonRef = useRef<HTMLButtonElement>(null);
  const shapesPopoverRef = useRef<HTMLDivElement>(null);
  const brandPopoverRef = useRef<HTMLDivElement>(null);
  const elementsPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shapesPopoverRef.current && !shapesPopoverRef.current.contains(event.target as Node) &&
        shapesButtonRef.current && !shapesButtonRef.current.contains(event.target as Node)
      ) {
        setShapesPopoverOpen(false);
      }
       if (
        brandPopoverRef.current && !brandPopoverRef.current.contains(event.target as Node) &&
        brandButtonRef.current && !brandButtonRef.current.contains(event.target as Node)
      ) {
        setBrandPaletteOpen(false);
      }
      if (
        elementsPopoverRef.current && !elementsPopoverRef.current.contains(event.target as Node) &&
        elementsButtonRef.current && !elementsButtonRef.current.contains(event.target as Node)
      ) {
        setElementsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  

  return (
    <div className="relative">
      <div className="w-24 bg-nutshel-gray border-r border-white/10 flex flex-col items-center p-4 space-y-4 h-full">
        <div className="flex flex-col space-y-2 w-full">
          <IconButton onClick={() => addLayer(LayerType.Text)} label="Text">
            <TextIcon className="w-5 h-5" />
          </IconButton>
          <button ref={shapesButtonRef} onClick={() => setShapesPopoverOpen(p => !p)} aria-label="Shapes" title="Shapes"
             className="flex flex-col items-center justify-center p-3 w-full rounded-lg bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
          >
              <ShapesIcon className="w-5 h-5" />
              <span className="text-xs mt-2 font-medium text-gray-300">Shapes</span>
          </button>
           <button ref={brandButtonRef} onClick={() => setBrandPaletteOpen(p => !p)} aria-label="Brand Palette" title="Brand Palette"
             className="flex flex-col items-center justify-center p-3 w-full rounded-lg bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
          >
              <PaletteIcon className="w-5 h-5" />
              <span className="text-xs mt-2 font-medium text-gray-300">Brand Palette</span>
          </button>
           <button ref={elementsButtonRef} onClick={() => setElementsPopoverOpen(p => !p)} aria-label="Elements" title="Elements"
             className="flex flex-col items-center justify-center p-3 w-full rounded-lg bg-white/5 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nutshel-blue"
          >
              <BlocksIcon className="w-5 h-5" />
              <span className="text-xs mt-2 font-medium text-gray-300">Elements</span>
          </button>
          <IconButton onClick={() => setIsImportModalOpen(true)} label="Import">
            <UploadIcon className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
      {isShapesPopoverOpen && <ShapesPopover ref={shapesPopoverRef} onClose={() => setShapesPopoverOpen(false)} />}
      {isBrandPaletteOpen && <BrandPalettePopover ref={brandPopoverRef} onClose={() => setBrandPaletteOpen(false)} />}
      {isElementsPopoverOpen && <ElementsPopover ref={elementsPopoverRef} onClose={() => setElementsPopoverOpen(false)} />}
      <ImportImageModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={addImageLayer}
      />
    </div>
  );
};

export default Toolbar;