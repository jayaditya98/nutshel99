import React from 'react';

interface SnappingGuidesProps {
  guides: {
    horizontal: number[];
    vertical: number[];
  };
}

const SnappingGuides: React.FC<SnappingGuidesProps> = ({ guides }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
      {guides.vertical.map((guide, index) => (
        <div
          key={`v-${index}`}
          className="absolute top-0 h-full border-l border-dashed border-red-500"
          style={{ left: guide }}
        />
      ))}
      {guides.horizontal.map((guide, index) => (
        <div
          key={`h-${index}`}
          className="absolute left-0 w-full border-t border-dashed border-red-500"
          style={{ top: guide }}
        />
      ))}
    </div>
  );
};

export default SnappingGuides;
