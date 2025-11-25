import { useState, useRef, useEffect } from 'react';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';

interface AppWindowProps {
  window: {
    id: string;
    name: string;
    icon: any;
    component: React.ComponentType;
    color: string;
    isMaximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
  };
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
}

export default function AppWindow({
  window,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
}: AppWindowProps) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const Component = window.component;

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize', direction = '') => {
    if (action === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y,
      });
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeDirection(direction);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
    onFocus();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !window.isMaximized) {
        const newX = e.clientX - dragStart.x;
        const newY = Math.max(32, e.clientY - dragStart.y); // 32px for menu bar
        onPositionChange({ x: newX, y: newY });
      }

      if (isResizing && !window.isMaximized) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        let newWidth = window.size.width;
        let newHeight = window.size.height;
        let newX = window.position.x;
        let newY = window.position.y;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(400, window.size.width + deltaX);
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(300, window.size.height + deltaY);
        }
        if (resizeDirection.includes('w')) {
          newWidth = Math.max(400, window.size.width - deltaX);
          newX = window.position.x + deltaX;
        }
        if (resizeDirection.includes('n')) {
          newHeight = Math.max(300, window.size.height - deltaY);
          newY = window.position.y + deltaY;
        }

        onSizeChange({ width: newWidth, height: newHeight });
        onPositionChange({ x: newX, y: newY });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
    };

    if (isDragging || isResizing) {
      globalThis.window.addEventListener('mousemove', handleMouseMove);
      globalThis.window.addEventListener('mouseup', handleMouseUp);
      return () => {
        globalThis.window.removeEventListener('mousemove', handleMouseMove);
        globalThis.window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, window, onPositionChange, onSizeChange, resizeDirection]);

  const style = window.isMaximized
    ? { left: 0, top: 32, width: '100%', height: 'calc(100% - 112px)' }
    : {
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
      };

  return (
    <div
      ref={windowRef}
      className="absolute bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
      style={{ ...style, zIndex: window.zIndex }}
      onMouseDown={() => onFocus()}
    >
      {/* Title Bar - Sleeker Design */}
      <div
        className="h-10 bg-gradient-to-r from-gray-50/95 to-gray-100/95 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-3 cursor-move select-none"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="flex items-center gap-3">
          {/* Traffic Lights */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 flex items-center justify-center group"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {showControls && <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100" />}
            </button>
            <button
              onClick={onMinimize}
              className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 flex items-center justify-center group"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {showControls && <Minus className="w-2 h-2 text-yellow-900 opacity-0 group-hover:opacity-100" />}
            </button>
            <button
              onClick={onMaximize}
              className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 flex items-center justify-center group"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {showControls && (window.isMaximized ? (
                <Minimize2 className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100" />
              ) : (
                <Maximize2 className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100" />
              ))}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${window.color} rounded-lg flex items-center justify-center`}>
              <window.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-700">{window.name}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-white">
        <Component />
      </div>

      {/* Resize Handles */}
      {!window.isMaximized && (
        <>
          {/* Corners */}
          <div
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'nw')}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'ne')}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'sw')}
          />
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'se')}
          />

          {/* Edges */}
          <div
            className="absolute top-0 left-4 right-4 h-1 cursor-n-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'n')}
          />
          <div
            className="absolute bottom-0 left-4 right-4 h-1 cursor-s-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize', 's')}
          />
          <div
            className="absolute left-0 top-4 bottom-4 w-1 cursor-w-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'w')}
          />
          <div
            className="absolute right-0 top-4 bottom-4 w-1 cursor-e-resize"
            onMouseDown={(e) => handleMouseDown(e, 'resize', 'e')}
          />
        </>
      )}
    </div>
  );
}
