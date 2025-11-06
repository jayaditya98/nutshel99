// FIX: Removed unnecessary self-import of `LayerType` which was causing a declaration conflict.
export enum LayerType {
  Text = 'Text',
  Image = 'Image',
  Rectangle = 'Rectangle',
  Ellipse = 'Ellipse',
  Group = 'Group',
  Square = 'Square',
  Circle = 'Circle',
  Triangle = 'Triangle',
  Polygon = 'Polygon',
  Star = 'Star',
  Arrow = 'Arrow',
  Heart = 'Heart',
  Diamond = 'Diamond',
  Parallelogram = 'Parallelogram',
  Trapezoid = 'Trapezoid',
}

export interface Layer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  properties: TextLayerProps | ImageLayerProps | ShapeLayerProps | GroupLayerProps;
}

export interface TextLayerProps {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number; // in px
  lineHeight: number; // multiplier
  textTransform: 'none' | 'uppercase' | 'lowercase';
}

export interface ImageLayerProps {
  src: string;
  flipHorizontal: boolean;
  flipVertical: boolean;
  filters: {
    grayscale: number; // 0-1
    sepia: number; // 0-1
    invert: number; // 0-1
    brightness: number; // 0-2
    contrast: number; // 0-2
    saturate: number; // 0-2
    blur: number; // in px, 0-10
    hueRotate: number; // in deg, 0-360
  };
}

export interface ShapeLayerProps {
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: [number, number, number, number]; // tl, tr, br, bl
  // For polygons and stars
  points?: number;
  // For stars
  innerRadiusRatio?: number;
}

export interface GroupLayerProps {
  children: Layer[];
}

export type CanvasState = {
  layers: Layer[];
  selectedLayerIds: string[];
  customFonts: string[];
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panning: boolean;
  brandColors: string[];
  savedColors: string[];
  canvasBackgroundColor: string;
  isCanvasSelected: boolean;
  canvasName: string;
};