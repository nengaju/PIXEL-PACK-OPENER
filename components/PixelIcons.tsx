import React from 'react';

type IconProps = {
  className?: string;
};

// Simple blocky SVG paths to emulate pixel art style
export const IconGift: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M4 8h16v4h-2v10h-12v-10h-2z M11 2h2v6h-2z M5 4h5v2h-5z M14 4h5v2h-5z" />
  </svg>
);

export const IconCards: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M2 2h14v16h-14z M6 6h14v16h-14z M10 10h14v14h-14v-14" fillOpacity="0.5"/>
    <path d="M10 10h14v14h-14z" />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M8 2h8v4h4v4h4v8h-4v4h-8v-4h-4v-8h4v-4z M10 10h4v4h-4z" />
  </svg>
);

export const IconMusic: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M6 4h12v2h2v10h-2v-8h-8v12h-6v-6h6v-10z M4 14h6v6h-6z" />
  </svg>
);

export const IconLock: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
     <path d="M9 4h6v6h2v10h-10v-10h2v-6z M11 6h2v4h-2z" />
  </svg>
);

export const IconUnlock: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M9 4h6v6h-2v-4h-2v4h-2v-6z M7 10h10v10h-10z" />
  </svg>
);

export const IconCoin: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M8 2h8v2h4v4h2v8h-2v4h-4v2h-8v-2h-4v-4h-2v-8h2v-4h4v-2z M10 6h2v12h-2z" />
  </svg>
);

export const IconTrash: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M4 4h16v4h-2v14h-12v-14h-2z M8 8h2v8h-2z M14 8h2v8h-2z M8 2h8v2h-8z" />
  </svg>
);

export const IconPlay: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M6 4h4v2h4v2h4v2h4v4h-4v2h-4v2h-4v2h-4z" />
  </svg>
);

export const IconPause: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M6 4h4v16h-4z M14 4h4v16h-4z" />
  </svg>
);

export const IconPrev: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
     <path d="M18 4v16h-2v-2h-2v-2h-2v-2h-2v-2h-2v6h-4v-16h4v6h2v-2h2v-2h2v-2h2v-2z" />
  </svg>
);

export const IconNext: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
     <path d="M6 4v16h2v-2h2v-2h2v-2h2v-2h2v6h4v-16h-4v6h-2v-2h-2v-2h-2v-2h-2v-2z" />
  </svg>
);

export const IconClose: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M4 4h4v2h2v2h4v-2h2v-2h4v4h-2v2h-2v2h2v2h2v4h-4v-2h-2v-2h-4v2h-2v2h-4v-4h2v-2h2v-2h-2v-2h-2z" />
  </svg>
);

export const IconImage: React.FC<IconProps> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
    <path d="M2 2h20v20h-20z M4 4v16h16v-16z M6 14h4v-4h4v4h4v4h-12z M14 6h4v4h-4z" />
  </svg>
);

export const IconBattle: React.FC<IconProps> = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} shapeRendering="crispEdges">
        <path d="M4 2h2v2h-2z M8 4h2v2h-2z M12 6h2v2h-2z M16 8h2v2h-2z M20 10h2v4h-2v-2h-2v2h-2v-2h-2v2h-2v-2h-2v2h-2v-2H4v-2h2v2h2v-2h2v2h2v-2h2v2h2v-2h2v2z" />
        <path d="M4 20h16v2h-16z M10 16h4v4h-4z" opacity="0.5" />
    </svg>
);
