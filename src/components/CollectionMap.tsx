import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import type { CollectionItem, Exhibition } from '../../shared/types';
import { cn } from '@/lib/utils';

interface CollectionMapProps {
  collections: CollectionItem[];
  exhibitions: Exhibition[];
  onCollectionClick?: (collection: CollectionItem) => void;
}

interface HoveredItem {
  collection: CollectionItem;
  x: number;
  y: number;
}

const HALL_WIDTH = 800;
const HALL_HEIGHT = 500;

export default function CollectionMap({ collections, exhibitions, onCollectionClick }: CollectionMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<CollectionItem | null>(null);

  const getMaintenanceStatus = (collection: CollectionItem) => {
    const daysUntil = dayjs(collection.nextMaintenanceDate).diff(dayjs(), 'day');
    if (daysUntil <= 0) return 'urgent';
    if (daysUntil <= 7) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'urgent':
        return '#A63B33';
      case 'warning':
        return '#C9A962';
      default:
        return '#558080';
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 2));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleCollectionClick = (collection: CollectionItem) => {
    setSelectedCollection(collection);
    onCollectionClick?.(collection);
  };

  const renderExhibitionHall = (exhibition: Exhibition, index: number) => {
    const cols = Math.ceil(Math.sqrt(exhibitions.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const hallWidth = (HALL_WIDTH - 80) / cols - 20;
    const hallHeight = (HALL_HEIGHT - 80) / Math.ceil(exhibitions.length / cols) - 20;
    const x = 40 + col * (hallWidth + 20);
    const y = 40 + row * (hallHeight + 20);

    return (
      <g key={exhibition.id}>
        <rect
          x={x}
          y={y}
          width={hallWidth}
          height={hallHeight}
          fill="#152E2E"
          stroke="#C9A962"
          strokeWidth="2"
          rx="8"
          className="transition-all duration-300 hover:fill-primary-700"
        />
        <text
          x={x + hallWidth / 2}
          y={y + 28}
          textAnchor="middle"
          fill="#D7BA71"
          fontSize="14"
          fontWeight="bold"
          className="pointer-events-none"
        >
          {exhibition.name}
        </text>
        <text
          x={x + hallWidth / 2}
          y={y + 48}
          textAnchor="middle"
          fill="#8C8578"
          fontSize="11"
          className="pointer-events-none"
        >
          {exhibition.location}
        </text>
      </g>
    );
  };

  const renderCollectionMarker = (collection: CollectionItem) => {
    const status = getMaintenanceStatus(collection);
    const color = getStatusColor(status);
    const x = collection.locationX || HALL_WIDTH / 2;
    const y = collection.locationY || HALL_HEIGHT / 2;

    return (
      <g
        key={collection.id}
        className="cursor-pointer"
        onClick={() => handleCollectionClick(collection)}
        onMouseEnter={(e) => {
          const rect = svgRef.current?.getBoundingClientRect();
          if (rect) {
            setHoveredItem({
              collection,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }
        }}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {status === 'urgent' && (
          <circle
            cx={x}
            cy={y}
            r="18"
            fill="none"
            stroke={color}
            strokeWidth="2"
            opacity="0.6"
            className="animate-ping"
          />
        )}
        {status === 'warning' && (
          <circle
            cx={x}
            cy={y}
            r="14"
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity="0.4"
            className="animate-pulse-slow"
          />
        )}
        <circle
          cx={x}
          cy={y}
          r="10"
          fill={color}
          stroke="#C9A962"
          strokeWidth="2"
          className="transition-all duration-300 hover:r-12 hover:stroke-gold-400"
        />
        <circle
          cx={x}
          cy={y}
          r="4"
          fill="#FAF7EF"
          className="pointer-events-none"
        />
      </g>
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedCollection(null);
        setHoveredItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-full bg-primary-900 rounded-xl overflow-hidden border border-gold-500/30">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-primary-800/80 backdrop-blur border border-gold-500/30 rounded-lg text-gold-400 hover:bg-primary-700 hover:border-gold-400 transition-all"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-primary-800/80 backdrop-blur border border-gold-500/30 rounded-lg text-gold-400 hover:bg-primary-700 hover:border-gold-400 transition-all"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-primary-800/80 backdrop-blur border border-gold-500/30 rounded-lg text-gold-400 hover:bg-primary-700 hover:border-gold-400 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 flex items-center gap-4 bg-primary-800/80 backdrop-blur px-4 py-2 rounded-lg border border-gold-500/30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-600" />
          <span className="text-xs text-cream-300">正常</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-xs text-cream-300">预警</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600" />
          <span className="text-xs text-cream-300">紧急</span>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`0 0 ${HALL_WIDTH} ${HALL_HEIGHT}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1A3A3A" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <g
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {exhibitions.map((exhibition, index) => renderExhibitionHall(exhibition, index))}
          {collections.map(renderCollectionMarker)}
        </g>
      </svg>

      {hoveredItem && (
        <div
          className="absolute z-20 bg-primary-800/95 backdrop-blur border border-gold-500/50 rounded-lg p-4 shadow-xl pointer-events-none animate-fade-in"
          style={{
            left: Math.min(hoveredItem.x + 16, window.innerWidth - 300),
            top: Math.min(hoveredItem.y + 16, window.innerHeight - 200),
            minWidth: '240px',
          }}
        >
          <div className="flex items-start gap-3">
            <img
              src={hoveredItem.collection.image}
              alt={hoveredItem.collection.name}
              className="w-16 h-16 rounded-lg object-cover border border-gold-500/30"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gold-400 truncate">{hoveredItem.collection.name}</h4>
              <p className="text-xs text-cream-400 mt-1">{hoveredItem.collection.era} · {hoveredItem.collection.category}</p>
              <div className="flex items-center gap-1 mt-2">
                <MapPin className="w-3 h-3 text-cream-500" />
                <span className="text-xs text-cream-500 truncate">
                  {hoveredItem.collection.exhibition?.name || '未分配展厅'}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3 text-cream-500" />
                <span className="text-xs text-cream-500">
                  下次养护: {dayjs(hoveredItem.collection.nextMaintenanceDate).format('YYYY-MM-DD')}
                </span>
              </div>
              <div className={cn(
                'mt-2 px-2 py-1 rounded text-xs font-medium inline-flex items-center gap-1',
                getMaintenanceStatus(hoveredItem.collection) === 'urgent'
                  ? 'bg-accent-900/50 text-accent-400'
                  : getMaintenanceStatus(hoveredItem.collection) === 'warning'
                  ? 'bg-gold-900/50 text-gold-400'
                  : 'bg-primary-700/50 text-green-400'
              )}>
                {getMaintenanceStatus(hoveredItem.collection) === 'urgent' && (
                  <AlertTriangle className="w-3 h-3" />
                )}
                {getMaintenanceStatus(hoveredItem.collection) === 'urgent' ? '紧急养护' :
                 getMaintenanceStatus(hoveredItem.collection) === 'warning' ? '临近养护' : '状态正常'}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedCollection && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-primary-900/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedCollection(null)}
        >
          <div
            className="bg-primary-800 border-2 border-gold-500/50 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-gold-500/20 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-serif font-bold text-gold-400">{selectedCollection.name}</h3>
              <button
                onClick={() => setSelectedCollection(null)}
                className="text-cream-500 hover:text-cream-300 transition-colors"
              >
                ×
              </button>
            </div>
            <img
              src={selectedCollection.image}
              alt={selectedCollection.name}
              className="w-full h-48 object-cover rounded-lg mb-4 border border-gold-500/30"
            />
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-cream-500">年代</span>
                <span className="text-cream-200">{selectedCollection.era}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream-500">类别</span>
                <span className="text-cream-200">{selectedCollection.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream-500">所属展厅</span>
                <span className="text-cream-200">{selectedCollection.exhibition?.name || '未分配'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream-500">上次养护</span>
                <span className="text-cream-200">{dayjs(selectedCollection.lastMaintenanceDate).format('YYYY-MM-DD')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream-500">下次养护</span>
                <span className={cn(
                  getMaintenanceStatus(selectedCollection) === 'urgent' ? 'text-accent-400 font-bold' :
                  getMaintenanceStatus(selectedCollection) === 'warning' ? 'text-gold-400' : 'text-cream-200'
                )}>
                  {dayjs(selectedCollection.nextMaintenanceDate).format('YYYY-MM-DD')}
                </span>
              </div>
              <p className="text-cream-400 mt-4 pt-4 border-t border-gold-500/20">
                {selectedCollection.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
