import React from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { LayerType } from '../types';
import { 
    RectangleIcon, CircleIcon, SquareIcon, EllipseIcon, TriangleIcon, PolygonIcon, 
    StarIcon, ArrowIcon, HeartIcon, DiamondIcon, ParallelogramIcon, TrapezoidIcon
} from './ui/Icons';

interface ShapesPopoverProps {
  onClose: () => void;
}

const shapes = [
    { type: LayerType.Rectangle, label: "Rectangle", icon: RectangleIcon },
    { type: LayerType.Square, label: "Square", icon: SquareIcon },
    { type: LayerType.Circle, label: "Circle", icon: CircleIcon },
    { type: LayerType.Triangle, label: "Triangle", icon: TriangleIcon },
    { type: LayerType.Ellipse, label: "Ellipse", icon: EllipseIcon },
    { type: LayerType.Polygon, label: "Polygon", icon: PolygonIcon },
    { type: LayerType.Star, label: "Star", icon: StarIcon },
    { type: LayerType.Arrow, label: "Arrow", icon: ArrowIcon },
    { type: LayerType.Heart, label: "Heart", icon: HeartIcon },
    { type: LayerType.Diamond, label: "Diamond", icon: DiamondIcon },
    { type: LayerType.Parallelogram, label: "Parallelogram", icon: ParallelogramIcon },
    { type: LayerType.Trapezoid, label: "Trapezoid", icon: TrapezoidIcon },
]

const ShapeButton: React.FC<{ onClick: () => void; children: React.ReactNode; label: string }> = ({ onClick, children, label }) => (
    <button 
        onClick={onClick} 
        className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors w-full text-center"
        aria-label={`Add ${label} shape`}
    >
        {children}
        <span className="text-xs mt-1 font-medium text-gray-300">{label}</span>
    </button>
);

const ShapesPopover = React.forwardRef<HTMLDivElement, ShapesPopoverProps>(({ onClose }, ref) => {
  const { addLayer } = useCanvasStore();

  const handleAddShape = (type: LayerType) => {
    addLayer(type);
    onClose();
  };

  return (
    <div ref={ref} className="absolute left-28 top-12 bg-nutshel-gray rounded-xl shadow-lg p-2 z-10 border border-white/10 w-64">
        <h4 className="text-xs font-bold text-gray-500 px-2 pt-1 pb-2 tracking-wider">SHAPES</h4>
        <div className="grid grid-cols-3 gap-2">
            {shapes.map(({ type, label, icon: Icon }) => (
                <ShapeButton key={type} onClick={() => handleAddShape(type)} label={label}>
                    <Icon className="w-8 h-8 text-gray-300" />
                </ShapeButton>
            ))}
        </div>
    </div>
  );
});

export default ShapesPopover;