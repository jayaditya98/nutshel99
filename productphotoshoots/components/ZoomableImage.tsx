
import React, { useState, useRef, useEffect } from 'react';
import { ZoomOutIcon } from './icons/ZoomOutIcon';

interface ZoomableImageProps {
  src: string;
  alt: string;
}

const MIN_SCALE = 1;
const MAX_SCALE = 8;

export const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    reset();
  }, [src]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleAmount = -e.deltaY * 0.01;
    let newScale = scale * (1 + scaleAmount);
    
    if (newScale < MIN_SCALE) newScale = MIN_SCALE;
    if (newScale > MAX_SCALE) newScale = MAX_SCALE;

    if (newScale === scale) return;

    if (newScale <= MIN_SCALE) {
      reset();
      return;
    }

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const newX = mouseX - (mouseX - position.x) * (newScale / scale);
    const newY = mouseY - (mouseY - position.y) * (newScale / scale);
    
    setPosition({ x: newX, y: newY });
    setScale(newScale);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (scale <= 1) return;
    setIsDragging(true);
    setStartDrag({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - startDrag.x,
      y: e.clientY - startDrag.y,
    });
  };

  const handleMouseUpOrLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const getDistance = (touches: TouchList | React.TouchList) => {
    return Math.sqrt(
      Math.pow(touches[0].clientX - touches[1].clientX, 2) +
      Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
  };

  const initialTouchState = useRef<{ distance: number; scale: number; } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialTouchState.current = { distance: getDistance(e.touches), scale };
    } else if (e.touches.length === 1 && scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setStartDrag({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialTouchState.current) {
      e.preventDefault();
      const newDistance = getDistance(e.touches);
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, initialTouchState.current.scale * (newDistance / initialTouchState.current.distance)));
      // This simplified implementation zooms towards the center of the image.
      setScale(newScale);
    } else if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - startDrag.x,
        y: e.touches[0].clientY - startDrag.y,
      });
    }
  };

  const handleTouchEnd = () => {
    initialTouchState.current = null;
    setIsDragging(false);
    if (scale < MIN_SCALE + 0.05) { // Add a little tolerance
        reset();
    }
  };

  const cursorStyle = scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default';

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-zinc-900 rounded-lg relative group/zoom"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none', cursor: cursorStyle }}
      onDoubleClick={reset}
    >
      <div
        className="w-full h-full transition-transform duration-100"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transformOrigin: '0 0',
        }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
          draggable="false"
        />
      </div>
      {scale > 1 && (
        <button
          onClick={reset}
          title="Reset Zoom (or double-click)"
          className="absolute top-2 right-2 z-10 p-1.5 bg-black/60 text-white rounded-full hover:bg-white hover:text-black hover:scale-110 transition-all opacity-0 group-hover/zoom:opacity-100"
        >
          <ZoomOutIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};