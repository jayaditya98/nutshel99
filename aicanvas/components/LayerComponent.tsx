import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Layer, LayerType, TextLayerProps, ImageLayerProps, ShapeLayerProps, GroupLayerProps } from '../types';
import { useCanvasStore } from '../store/canvasStore';
import { LockIcon } from './ui/Icons';

interface LayerComponentProps {
  layer: Layer;
  index: number;
  setSnapGuides: React.Dispatch<React.SetStateAction<{ horizontal: number[]; vertical: number[] }>>;
}

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const corners: { name: Corner; cursor: string; position: string }[] = [
    { name: 'tl', cursor: 'cursor-nwse-resize', position: 'absolute -top-1.5 -left-1.5' },
    { name: 'tr', cursor: 'cursor-nesw-resize', position: 'absolute -top-1.5 -right-1.5' },
    { name: 'bl', cursor: 'cursor-nesw-resize', position: 'absolute -bottom-1.5 -left-1.5' },
    { name: 'br', cursor: 'cursor-nwse-resize', position: 'absolute -bottom-1.5 -right-1.5' },
];

const cornerTitles: { [key in Corner]: string } = {
    tl: 'Resize top-left',
    tr: 'Resize top-right',
    bl: 'Resize bottom-left',
    br: 'Resize bottom-right',
};


const generateFilterString = (filters: ImageLayerProps['filters']) => {
  if (!filters) return 'none';
  // Check if any filter is not at its default value
  const isAnyFilterActive = 
    filters.grayscale !== 0 ||
    filters.sepia !== 0 ||
    filters.invert !== 0 ||
    filters.brightness !== 1 ||
    filters.contrast !== 1 ||
    filters.saturate !== 1 ||
    filters.blur !== 0 ||
    filters.hueRotate !== 0;

  if (!isAnyFilterActive) return 'none';
  
  return [
    `grayscale(${filters.grayscale})`,
    `sepia(${filters.sepia})`,
    `invert(${filters.invert})`,
    `brightness(${filters.brightness})`,
    `contrast(${filters.contrast})`,
    `saturate(${filters.saturate})`,
    `blur(${filters.blur}px)`,
    `hue-rotate(${filters.hueRotate}deg)`,
  ].join(' ');
};

// SVG Path Generators
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

const LayerComponent: React.FC<LayerComponentProps> = ({ layer, index, setSnapGuides }) => {
  const { 
    selectedLayerIds, setSelectedLayers, toggleSelection, resizeLayer, 
    updateLayer, takeSnapshot, zoom, panning, layers: allLayers, 
    canvasWidth, canvasHeight 
  } = useCanvasStore();
  const isSelected = selectedLayerIds.includes(layer.id);
  const isLocked = layer.locked;
  const showControls = isSelected && !isLocked && selectedLayerIds.length === 1 && layer.type !== LayerType.Group;
  
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const textContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (layer.type === LayerType.Text && textContentRef.current && !isEditing) {
      const newHeight = textContentRef.current.scrollHeight;
      if (newHeight > 0 && Math.abs(layer.height - newHeight) > 1) {
        updateLayer(layer.id, { height: newHeight });
      }
    }
  }, [layer.properties, layer.width, layer.type, isEditing, layer.id, layer.height, updateLayer]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.select();
        const textarea = textareaRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        if (layer.height < textarea.scrollHeight) {
          updateLayer(layer.id, { height: textarea.scrollHeight });
        }
    }
  }, [isEditing, layer.id, layer.height, updateLayer]);
  
  const handleDoubleClick = () => {
    if (isLocked) return;
    if (layer.type === LayerType.Text && !panning) {
      setIsEditing(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const newText = textarea.value;

    textarea.style.height = 'auto';
    const newHeight = textarea.scrollHeight;
    textarea.style.height = `${newHeight}px`;

    updateLayer(layer.id, (l) => {
        (l.properties as TextLayerProps).text = newText;
        l.height = newHeight;
    });
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    takeSnapshot();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (panning) return;
    e.stopPropagation();
    
    if (e.shiftKey) {
        toggleSelection(layer.id);
    } else if (!isSelected) {
        setSelectedLayers([layer.id]);
    }

    if (isLocked) return;

    const startX = e.clientX;
    const startY = e.clientY;

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onMouseUp);
      setSnapGuides({ horizontal: [], vertical: [] }); // Clear guides
      takeSnapshot();
    };
    
    const initialLayerPositions = new Map<string, {x: number, y: number}>();
    const idsToMove = useCanvasStore.getState().selectedLayerIds.includes(layer.id) ? useCanvasStore.getState().selectedLayerIds : [layer.id];
    
    idsToMove.forEach(id => {
        const l = allLayers.find(l => l.id === id);
        if (l && !l.locked) initialLayerPositions.set(id, {x: l.x, y: l.y});
    });

    // --- SNAPPING SETUP ---
    const SNAP_THRESHOLD = 8 / zoom;
    const otherLayers = allLayers.filter(l => !idsToMove.includes(l.id));

    const movingLayers = allLayers.filter(l => idsToMove.includes(l.id));
    const initialGroupBounds = {
        left: Math.min(...movingLayers.map(l => l.x)),
        top: Math.min(...movingLayers.map(l => l.y)),
        right: Math.max(...movingLayers.map(l => l.x + l.width)),
        bottom: Math.max(...movingLayers.map(l => l.y + l.height)),
        width: 0,
        height: 0,
    };
    initialGroupBounds.width = initialGroupBounds.right - initialGroupBounds.left;
    initialGroupBounds.height = initialGroupBounds.bottom - initialGroupBounds.top;

    const verticalTargets = new Set([0, canvasWidth / 2, canvasWidth]);
    const horizontalTargets = new Set([0, canvasHeight / 2, canvasHeight]);

    otherLayers.forEach(l => {
        verticalTargets.add(l.x);
        verticalTargets.add(l.x + l.width / 2);
        verticalTargets.add(l.x + l.width);
        horizontalTargets.add(l.y);
        horizontalTargets.add(l.y + l.height / 2);
        horizontalTargets.add(l.y + l.height);
    });

    const onDrag = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / zoom;
        const dy = (moveEvent.clientY - startY) / zoom;
        
        const proposedBounds = {
            left: initialGroupBounds.left + dx,
            top: initialGroupBounds.top + dy,
            right: initialGroupBounds.right + dx,
            bottom: initialGroupBounds.bottom + dy,
            hCenter: initialGroupBounds.left + dx + initialGroupBounds.width / 2,
            vCenter: initialGroupBounds.top + dy + initialGroupBounds.height / 2,
        };
        
        let snapDx = 0;
        let snapDy = 0;
        const activeGuides = { horizontal: new Set<number>(), vertical: new Set<number>() };

        for (const target of verticalTargets) {
            if (Math.abs(proposedBounds.left - target) < SNAP_THRESHOLD) {
                snapDx = target - proposedBounds.left;
                activeGuides.vertical.add(target);
                break;
            }
            if (Math.abs(proposedBounds.hCenter - target) < SNAP_THRESHOLD) {
                snapDx = target - proposedBounds.hCenter;
                activeGuides.vertical.add(target);
                break;
            }
            if (Math.abs(proposedBounds.right - target) < SNAP_THRESHOLD) {
                snapDx = target - proposedBounds.right;
                activeGuides.vertical.add(target);
                break;
            }
        }

        for (const target of horizontalTargets) {
            if (Math.abs(proposedBounds.top - target) < SNAP_THRESHOLD) {
                snapDy = target - proposedBounds.top;
                activeGuides.horizontal.add(target);
                break;
            }
            if (Math.abs(proposedBounds.vCenter - target) < SNAP_THRESHOLD) {
                snapDy = target - proposedBounds.vCenter;
                activeGuides.horizontal.add(target);
                break;
            }
            if (Math.abs(proposedBounds.bottom - target) < SNAP_THRESHOLD) {
                snapDy = target - proposedBounds.bottom;
                activeGuides.horizontal.add(target);
                break;
            }
        }
        
        const finalDx = dx + snapDx;
        const finalDy = dy + snapDy;
        
        setSnapGuides({ horizontal: Array.from(activeGuides.horizontal), vertical: Array.from(activeGuides.vertical) });

        initialLayerPositions.forEach((initialPos, id) => {
            updateLayer(id, { x: initialPos.x + finalDx, y: initialPos.y + finalDy });
        });
    };

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, corner: Corner) => {
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const { x: initialX, y: initialY, width: initialWidth, height: initialHeight, rotation } = layer;
    
    const rad = rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // --- SNAPPING SETUP ---
    const SNAP_THRESHOLD = 8 / zoom;
    const otherLayers = allLayers.filter(l => l.id !== layer.id);
    const verticalTargets = new Set([0, canvasWidth / 2, canvasWidth]);
    const horizontalTargets = new Set([0, canvasHeight / 2, canvasHeight]);
    otherLayers.forEach(l => {
        verticalTargets.add(l.x);
        verticalTargets.add(l.x + l.width / 2);
        verticalTargets.add(l.x + l.width);
        horizontalTargets.add(l.y);
        horizontalTargets.add(l.y + l.height / 2);
        horizontalTargets.add(l.y + l.height);
    });

    const onMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / zoom;
        const dy = (moveEvent.clientY - startY) / zoom;

        const dxRotated = dx * cos + dy * sin;
        const dyRotated = -dx * sin + dy * cos;

        let dw = 0;
        let dh = 0;

        if (corner.includes('r')) dw = dxRotated; else dw = -dxRotated;
        if (corner.includes('b')) dh = dyRotated; else dh = -dyRotated;
        
        let newWidth = initialWidth + dw;
        let newHeight = initialHeight + dh;

        if (moveEvent.shiftKey) {
            const aspectRatio = initialWidth / initialHeight;
            if (Math.abs(dw) > Math.abs(dh)) {
                newHeight = newWidth / aspectRatio;
            } else {
                newWidth = newHeight * aspectRatio;
            }
        }
        
        if (newWidth < 10) newWidth = 10;
        if (newHeight < 10) newHeight = 10;
        
        const finalDw = newWidth - initialWidth;
        const finalDh = newHeight - initialHeight;

        let centerMoveXLocal = finalDw / 2;
        let centerMoveYLocal = finalDh / 2;
        
        if (corner.includes('l')) centerMoveXLocal = -centerMoveXLocal;
        if (corner.includes('t')) centerMoveYLocal = -centerMoveYLocal;

        const centerDxScreen = centerMoveXLocal * cos - centerMoveYLocal * sin;
        const centerDyScreen = centerMoveXLocal * sin + centerMoveYLocal * cos;
        
        const initialCenterX = initialX + initialWidth / 2;
        const initialCenterY = initialY + initialHeight / 2;
        const newCenterX = initialCenterX + centerDxScreen;
        const newCenterY = initialCenterY + centerDyScreen;
        
        let newX = newCenterX - newWidth / 2;
        let newY = newCenterY - newHeight / 2;

        // --- SNAPPING LOGIC ---
        const activeGuides = { horizontal: new Set<number>(), vertical: new Set<number>() };
        const proposedBounds = { left: newX, top: newY, right: newX + newWidth, bottom: newY + newHeight };
        
        // Vertical
        if (corner.includes('l')) {
            for (const target of verticalTargets) {
                if (Math.abs(proposedBounds.left - target) < SNAP_THRESHOLD) {
                    const diff = target - newX;
                    newX += diff; newWidth -= diff;
                    activeGuides.vertical.add(target); break;
                }
            }
        } else if (corner.includes('r')) {
            for (const target of verticalTargets) {
                if (Math.abs(proposedBounds.right - target) < SNAP_THRESHOLD) {
                    newWidth = target - newX;
                    activeGuides.vertical.add(target); break;
                }
            }
        }
        // Horizontal
        if (corner.includes('t')) {
            for (const target of horizontalTargets) {
                if (Math.abs(proposedBounds.top - target) < SNAP_THRESHOLD) {
                    const diff = target - newY;
                    newY += diff; newHeight -= diff;
                    activeGuides.horizontal.add(target); break;
                }
            }
        } else if (corner.includes('b')) {
            for (const target of horizontalTargets) {
                if (Math.abs(proposedBounds.bottom - target) < SNAP_THRESHOLD) {
                    newHeight = target - newY;
                    activeGuides.horizontal.add(target); break;
                }
            }
        }
        setSnapGuides({ horizontal: Array.from(activeGuides.horizontal), vertical: Array.from(activeGuides.vertical) });
        resizeLayer(layer.id, newWidth, newHeight, newX, newY);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setSnapGuides({ horizontal: [], vertical: [] });
      takeSnapshot();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleRotateMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!layerRef.current) return;

    const rect = layerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const initialRotation = layer.rotation;

    const onMouseMove = (moveEvent: MouseEvent) => {
        const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
        const angleDiff = currentAngle - startAngle;
        const angleDiffDegrees = angleDiff * (180 / Math.PI);
        const newRotation = initialRotation + angleDiffDegrees;
        updateLayer(layer.id, { rotation: newRotation });
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        takeSnapshot();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const renderLayerContent = () => {
    const renderShapeWithSVG = (path: string, props: ShapeLayerProps) => (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none">
        <path d={path} fill={props.fill} stroke={props.stroke} strokeWidth={props.strokeWidth * (100 / Math.max(layer.width, layer.height))} vectorEffect="non-scaling-stroke" />
      </svg>
    );

    switch (layer.type) {
      case LayerType.Text: {
        const props = layer.properties as TextLayerProps;
        const textStyles: React.CSSProperties = {
            fontFamily: `'${props.fontFamily}', Arial, sans-serif`,
            fontSize: `${props.fontSize}px`,
            fontWeight: props.fontWeight,
            fontStyle: props.fontStyle,
            textDecoration: props.textDecoration,
            color: props.color,
            textAlign: props.textAlign,
            letterSpacing: `${props.letterSpacing}px`,
            lineHeight: props.lineHeight,
            textTransform: props.textTransform,
        };

        if (isEditing) {
            return (
                <textarea
                    ref={textareaRef}
                    value={props.text}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    className="w-full h-full p-0 m-0 border-none resize-none bg-transparent outline-none overflow-hidden"
                    style={textStyles}
                />
            );
        }
        return (
          <div
            ref={textContentRef}
            style={{
              ...textStyles,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {props.text}
          </div>
        );
      }
      case LayerType.Image: {
        const { src, flipHorizontal, flipVertical, filters } = layer.properties as ImageLayerProps;
        return <img 
            src={src} 
            alt="" 
            className="w-full h-full object-cover pointer-events-none" 
            draggable="false"
            style={{ 
              transform: `scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
              filter: generateFilterString(filters),
            }}
        />;
      }
      case LayerType.Rectangle:
      case LayerType.Square: {
        const rectProps = layer.properties as ShapeLayerProps;
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: rectProps.fill,
              border: `${rectProps.strokeWidth}px solid ${rectProps.stroke}`,
              borderRadius: rectProps.cornerRadius ? rectProps.cornerRadius.map(r => `${r}px`).join(' ') : '0px',
            }}
          />
        );
      }
      case LayerType.Ellipse:
      case LayerType.Circle: {
        const ellipseProps = layer.properties as ShapeLayerProps;
        return (
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundColor: ellipseProps.fill,
              border: `${ellipseProps.strokeWidth}px solid ${ellipseProps.stroke}`,
            }}
          />
        );
      }
      case LayerType.Triangle:
        return renderShapeWithSVG(predefinedPaths.triangle, layer.properties as ShapeLayerProps);
      case LayerType.Arrow:
        return renderShapeWithSVG(predefinedPaths.arrow, layer.properties as ShapeLayerProps);
      case LayerType.Heart:
        return renderShapeWithSVG(predefinedPaths.heart, layer.properties as ShapeLayerProps);
      case LayerType.Diamond:
        return renderShapeWithSVG(predefinedPaths.diamond, layer.properties as ShapeLayerProps);
      case LayerType.Parallelogram:
        return renderShapeWithSVG(predefinedPaths.parallelogram, layer.properties as ShapeLayerProps);
      case LayerType.Trapezoid:
        return renderShapeWithSVG(predefinedPaths.trapezoid, layer.properties as ShapeLayerProps);
      case LayerType.Polygon: {
        const { points = 6 } = layer.properties as ShapeLayerProps;
        return renderShapeWithSVG(getPolygonPath(points), layer.properties as ShapeLayerProps);
      }
      case LayerType.Star: {
        const { points = 5, innerRadiusRatio = 0.5 } = layer.properties as ShapeLayerProps;
        return renderShapeWithSVG(getStarPath(points, innerRadiusRatio), layer.properties as ShapeLayerProps);
      }
      case LayerType.Group: {
        const { children } = layer.properties as GroupLayerProps;
        return (
            <div className="w-full h-full relative pointer-events-none">
                {children.map((child) => (
                    <LayerComponent key={child.id} layer={child} index={-1} setSnapGuides={setSnapGuides} />
                ))}
            </div>
        )
      }
      default:
        return null;
    }
  };

  const selectionOutlineClass = isSelected
    ? isLocked
      ? 'outline-dashed outline-1 outline-red-500'
      : 'outline-dashed outline-1 outline-nutshel-blue'
    : '';

  return (
    <div
      ref={layerRef}
      className={`absolute ${!isLocked && layer.type !== LayerType.Group ? 'cursor-move' : ''} ${isLocked ? 'cursor-not-allowed' : ''} ${selectionOutlineClass}`}
      style={{
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        transform: `rotate(${layer.rotation}deg)`,
        opacity: layer.opacity,
        zIndex: index,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {renderLayerContent()}
      {isSelected && isLocked && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
            <LockIcon className="w-6 h-6 text-red-500 bg-nutshel-gray rounded-full p-1 shadow-md" style={{ transform: `scale(${1 / zoom})` }} />
        </div>
      )}
      {showControls && (
        <>
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-nutshel-gray border border-nutshel-blue rounded-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleRotateMouseDown}
            title="Rotate layer"
            style={{ transform: `scale(${1 / zoom})`}}
          >
             <div className="absolute h-3 w-px bg-nutshel-blue left-1/2 -translate-x-1/2 -bottom-3"></div>
          </div>
          {corners.map(({ name, cursor, position }) => (
            <div
                key={name}
                title={cornerTitles[name]}
                className={`${position} ${cursor} w-3 h-3 bg-nutshel-gray border border-nutshel-blue rounded-full`}
                onMouseDown={(e) => handleResizeMouseDown(e, name)}
                style={{ transform: `scale(${1 / zoom})`}}
            ></div>
          ))}
        </>
      )}
    </div>
  );
};

export default LayerComponent;