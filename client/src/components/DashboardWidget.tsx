import { useState, useRef, useEffect } from 'react';
import { Grip, X, Maximize2, Minimize2, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface DashboardWidgetProps {
  onClose: () => void;
}

export default function DashboardWidget({ onClose }: DashboardWidgetProps) {
  const [position, setPosition] = useState({ x: 50, y: 100 });
  const [size, setSize] = useState({ width: 320, height: 420 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  const [stats] = useState({
    activeProjects: 12,
    tasksToday: 8,
    completedTasks: 148,
    overdueTasks: 3,
  });

  const handleMouseDown = (e: React.MouseEvent, action: 'drag' | 'resize') => {
    if (action === 'drag') {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    } else {
      setIsResizing(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: Math.max(28, e.clientY - dragStart.y),
        });
      }
      if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        setSize({
          width: Math.max(280, size.width + deltaX),
          height: Math.max(350, size.height + deltaY),
        });
        setDragStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      globalThis.window.addEventListener('mousemove', handleMouseMove);
      globalThis.window.addEventListener('mouseup', handleMouseUp);
      return () => {
        globalThis.window.removeEventListener('mousemove', handleMouseMove);
        globalThis.window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, position, size]);

  if (isMinimized) {
    return null;
  }

  return (
    <div
      ref={widgetRef}
      className="absolute bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: 200,
      }}
    >
      {/* Header */}
      <div
        className="h-10 bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-xl flex items-center justify-between px-4 cursor-move"
        onMouseDown={(e) => handleMouseDown(e, 'drag')}
      >
        <div className="flex items-center gap-2 text-white">
          <Grip className="w-4 h-4" />
          <span className="font-semibold text-sm">Dashboard Widget</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            className="w-6 h-6 hover:bg-white/20 rounded flex items-center justify-center transition"
          >
            <Minimize2 className="w-3 h-3 text-white" />
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 hover:bg-white/20 rounded flex items-center justify-center transition"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-auto" style={{ height: `calc(${size.height}px - 40px)` }}>
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-700">{stats.activeProjects}</span>
            </div>
            <p className="text-xs text-blue-600 font-medium">Active Projects</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-700">{stats.completedTasks}</span>
            </div>
            <p className="text-xs text-green-600 font-medium">Completed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-700">{stats.tasksToday}</span>
            </div>
            <p className="text-xs text-purple-600 font-medium">Today's Tasks</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-700">{stats.overdueTasks}</span>
            </div>
            <p className="text-xs text-red-600 font-medium">Overdue</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-600 uppercase">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition">
              Create Task
            </button>
            <button className="w-full px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition">
              New Project
            </button>
            <button className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition">
              View Calendar
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-600 uppercase">Recent Activity</h3>
          <div className="space-y-2">
            {[
              { text: 'Task completed in Project Alpha', time: '5m ago', color: 'green' },
              { text: 'New team member joined', time: '1h ago', color: 'blue' },
              { text: 'Deadline approaching', time: '2h ago', color: 'red' },
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg">
                <div className={`w-2 h-2 bg-${activity.color}-500 rounded-full mt-1.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 truncate">{activity.text}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => handleMouseDown(e, 'resize')}
      >
        <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-slate-400" />
      </div>
    </div>
  );
}
