import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  FolderKanban,
  CheckSquare,
  Users,
  UserCircle,
  Building2,
  UserPlus,
  UserMinus,
  BarChart3,
  FileText,
  Palette,
  Presentation,
  Table,
  FileEdit,
  Settings,
  User,
  LogOut,
  Grid3x3,
  Video,
  Mail,
} from 'lucide-react';
import AppWindow from './AppWindow';
import DashboardWidget from './DashboardWidget';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/projects/Projects';
import Tasks from '../pages/tasks/Tasks';
import Teams from '../pages/teams/Teams';
import MembersRouter from '../pages/members';
import Departments from '../pages/departments/Departments';
import Onboarding from '../pages/onboarding/Onboarding';
import Offboarding from '../pages/offboarding/Offboarding';
import Analytics from '../pages/Analytics';
import Documents from '../pages/Documents';
import Whiteboard from '../pages/Whiteboard';
import Presenter from '../pages/Presenter';
import Excel from '../pages/Excel';
import Docs from '../pages/Docs';
import Profile from '../pages/Profile';
import SettingsPage from '../pages/Settings';
import VideoCall from '../pages/VideoCall';
import MailApp from '../pages/MailApp';

interface AppConfig {
  id: string;
  name: string;
  icon: any;
  component: React.ComponentType;
  color: string;
}

interface OpenWindow {
  id: string;
  appId: string;
  name: string;
  icon: any;
  component: React.ComponentType;
  color: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export default function OSLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openWindows, setOpenWindows] = useState<OpenWindow[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(100);
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [showWidget, setShowWidget] = useState(false);

  const apps: AppConfig[] = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, component: Dashboard, color: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { id: 'projects', name: 'Projects', icon: FolderKanban, component: Projects, color: 'bg-gradient-to-br from-purple-500 to-purple-600' },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare, component: Tasks, color: 'bg-gradient-to-br from-green-500 to-green-600' },
    { id: 'teams', name: 'Teams', icon: Users, component: Teams, color: 'bg-gradient-to-br from-orange-500 to-orange-600' },
    { id: 'members', name: 'Members', icon: UserCircle, component: MembersRouter, color: 'bg-gradient-to-br from-pink-500 to-pink-600' },
    { id: 'departments', name: 'Departments', icon: Building2, component: Departments, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600' },
    { id: 'onboarding', name: 'Onboarding', icon: UserPlus, component: Onboarding, color: 'bg-gradient-to-br from-teal-500 to-teal-600' },
    { id: 'offboarding', name: 'Offboarding', icon: UserMinus, component: Offboarding, color: 'bg-gradient-to-br from-red-500 to-red-600' },
    { id: 'videocall', name: 'Video Call', icon: Video, component: VideoCall, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
    { id: 'mail', name: 'Mail', icon: Mail, component: MailApp, color: 'bg-gradient-to-br from-sky-500 to-sky-600' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, component: Analytics, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600' },
    { id: 'documents', name: 'Documents', icon: FileText, component: Documents, color: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
    { id: 'whiteboard', name: 'Whiteboard', icon: Palette, component: Whiteboard, color: 'bg-gradient-to-br from-blue-600 to-blue-700' },
    { id: 'presenter', name: 'Presenter', icon: Presentation, component: Presenter, color: 'bg-gradient-to-br from-purple-600 to-purple-700' },
    { id: 'excel', name: 'Excel', icon: Table, component: Excel, color: 'bg-gradient-to-br from-green-600 to-green-700' },
    { id: 'docs', name: 'Docs', icon: FileEdit, component: Docs, color: 'bg-gradient-to-br from-blue-700 to-blue-800' },
    { id: 'profile', name: 'Profile', icon: User, component: Profile, color: 'bg-gradient-to-br from-gray-600 to-gray-700' },
    { id: 'settings', name: 'Settings', icon: Settings, component: SettingsPage, color: 'bg-gradient-to-br from-gray-700 to-gray-800' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Auto-open Dashboard on mount
    if (openWindows.length === 0) {
      const dashboardApp = apps.find(app => app.id === 'dashboard');
      if (dashboardApp) {
        openApp(dashboardApp);
      }
    }
  }, []);

  const openApp = (app: AppConfig) => {
    // Check if app is already open
    const existingWindow = openWindows.find(w => w.appId === app.id);
    if (existingWindow) {
      // Bring to front and restore if minimized
      bringToFront(existingWindow.id);
      if (existingWindow.isMinimized) {
        setOpenWindows(prev =>
          prev.map(w => w.id === existingWindow.id ? { ...w, isMinimized: false } : w)
        );
      }
      return;
    }

    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);

    const offset = openWindows.length * 30;
    const newWindow: OpenWindow = {
      id: `${app.id}-${Date.now()}`,
      appId: app.id,
      name: app.name,
      icon: app.icon,
      component: app.component,
      color: app.color,
      isMinimized: false,
      isMaximized: false,
      position: { x: 100 + offset, y: 80 + offset },
      size: { width: 900, height: 600 },
      zIndex: newZIndex,
    };

    setOpenWindows(prev => [...prev, newWindow]);
    navigate('/dashboard');
  };

  const closeWindow = (windowId: string) => {
    setOpenWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const minimizeWindow = (windowId: string) => {
    setOpenWindows(prev =>
      prev.map(w => w.id === windowId ? { ...w, isMinimized: true } : w)
    );
  };

  const maximizeWindow = (windowId: string) => {
    setOpenWindows(prev =>
      prev.map(w => w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w)
    );
  };

  const bringToFront = (windowId: string) => {
    const newZIndex = maxZIndex + 1;
    setMaxZIndex(newZIndex);
    setOpenWindows(prev =>
      prev.map(w => w.id === windowId ? { ...w, zIndex: newZIndex } : w)
    );
  };

  const updateWindowPosition = (windowId: string, position: { x: number; y: number }) => {
    setOpenWindows(prev =>
      prev.map(w => w.id === windowId ? { ...w, position } : w)
    );
  };

  const updateWindowSize = (windowId: string, size: { width: number; height: number }) => {
    setOpenWindows(prev =>
      prev.map(w => w.id === windowId ? { ...w, size } : w)
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Ultra-Premium Desktop Wallpaper */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
        {/* Layered Animated Orbs with Glow Effect */}
        <div className="absolute inset-0">
          {/* Large glowing orbs */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/30 rounded-full filter blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-purple-500/30 rounded-full filter blur-[120px] animate-pulse" style={{ animationDuration: '10s' }}></div>
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-pink-500/25 rounded-full filter blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
          <div className="absolute bottom-1/3 left-1/4 w-[550px] h-[550px] bg-cyan-500/25 rounded-full filter blur-[100px] animate-pulse" style={{ animationDuration: '14s' }}></div>
          
          {/* Medium accent orbs */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-violet-500/20 rounded-full filter blur-[80px] animate-pulse" style={{ animationDuration: '9s' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-fuchsia-500/20 rounded-full filter blur-[80px] animate-pulse" style={{ animationDuration: '11s' }}></div>
        </div>
        
        {/* Sophisticated Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px),
            linear-gradient(rgba(236,72,153,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236,72,153,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px, 80px 80px, 20px 20px, 20px 20px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0'
        }}></div>
        
        {/* Radial Gradient Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-950/50 to-slate-950/90"></div>
        
        {/* Refined Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 300 300\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          mixBlendMode: 'overlay'
        }}></div>
        
        {/* Subtle Light Rays */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-blue-400 via-transparent to-transparent transform -skew-x-12"></div>
          <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-purple-400 via-transparent to-transparent transform skew-x-12"></div>
        </div>
      </div>

      {/* Menu Bar - Sleeker Design */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-black/30 backdrop-blur-xl border-b border-white/5 flex items-center px-4 z-50">
        <div className="flex items-center gap-4 text-white/90 text-xs font-medium">
          <span className="font-bold text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">INORG</span>
          <button onClick={() => openApp(apps.find(a => a.id === 'dashboard')!)} className="hover:bg-white/10 px-2 py-1 rounded-md transition-all">
            Dashboard
          </button>
          <button onClick={() => setShowLaunchpad(!showLaunchpad)} className="hover:bg-white/10 px-2 py-1 rounded-md transition-all">
            Apps
          </button>
        </div>
        <div className="ml-auto flex items-center gap-4 text-white/80 text-xs">
          <span className="bg-white/5 px-3 py-1 rounded-full">{user?.email}</span>
          <span className="font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          <span className="text-white/60">{currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="absolute inset-0 top-7 bottom-16">
        {openWindows.filter(w => !w.isMinimized).map(window => (
          <AppWindow
            key={window.id}
            window={window}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onFocus={() => bringToFront(window.id)}
            onPositionChange={(pos) => updateWindowPosition(window.id, pos)}
            onSizeChange={(size) => updateWindowSize(window.id, size)}
          />
        ))}
      </div>

      {/* Dashboard Widget */}
      {showWidget && <DashboardWidget onClose={() => setShowWidget(false)} />}

      {/* Launchpad Overlay */}
      {showLaunchpad && (
        <div
          className="absolute inset-0 top-8 bg-black/40 backdrop-blur-lg z-[1000] flex items-center justify-center"
          onClick={() => setShowLaunchpad(false)}
        >
          <div className="grid grid-cols-6 gap-8 p-12" onClick={e => e.stopPropagation()}>
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => {
                  openApp(app);
                  setShowLaunchpad(false);
                }}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={`w-24 h-24 ${app.color} rounded-2xl shadow-2xl flex items-center justify-center transform transition-all duration-200 group-hover:scale-110 group-hover:shadow-3xl`}>
                  <app.icon className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <span className="text-white text-sm font-medium drop-shadow-lg">{app.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dock - Sleeker Design */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl px-2 py-1.5 shadow-2xl">
          <div className="flex items-center gap-1.5">
            {/* Launchpad */}
            <div className="relative group">
              <button
                onClick={() => setShowLaunchpad(!showLaunchpad)}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
                style={{ boxShadow: '0 4px 15px -3px rgba(59,130,246,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Grid3x3 className="w-6 h-6 text-white relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              </button>
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl">
                Launchpad
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            {/* Pinned Apps */}
            {apps.slice(0, 8).map(app => {
              const isOpen = openWindows.some(w => w.appId === app.id);
              return (
                <div key={app.id} className="relative group">
                  <button
                    onClick={() => openApp(app)}
                    className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden ${
                      isOpen ? 'ring-2 ring-white/40 -translate-y-0.5' : ''
                    }`}
                    style={{
                      boxShadow: isOpen ? '0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' : '0 4px 15px -3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                    }}
                  >
                    {/* 3D Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {/* Icon with better shadow */}
                    <app.icon className="w-6 h-6 text-white relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                    {/* Active Indicator */}
                    {isOpen && (
                      <div className="absolute -bottom-0.5 w-1.5 h-1.5 bg-white rounded-full shadow-lg animate-pulse" />
                    )}
                  </button>
                  {/* Enhanced Tooltip */}
                  <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl">
                    {app.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
                  </div>
                </div>
              );
            })}

            <div className="w-px h-10 bg-white/10" />

            {/* Widget Button */}
            <div className="relative group">
              <button
                onClick={() => setShowWidget(!showWidget)}
                className={`w-12 h-12 bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 rounded-xl flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden ${
                  showWidget ? 'ring-2 ring-white/40 -translate-y-0.5' : ''
                }`}
                style={{
                  boxShadow: showWidget ? '0 10px 40px -10px rgba(20,184,166,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' : '0 4px 15px -3px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Grid3x3 className="w-5 h-5 text-white relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                {showWidget && (
                  <div className="absolute -bottom-0.5 w-1.5 h-1.5 bg-white rounded-full shadow-lg animate-pulse" />
                )}
              </button>
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl">
                Widget
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            {/* Profile & Settings */}
            <div className="relative group">
              <button
                onClick={() => openApp(apps.find(a => a.id === 'profile')!)}
                className="w-12 h-12 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 rounded-xl flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
                style={{ boxShadow: '0 4px 15px -3px rgba(71,85,105,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <User className="w-6 h-6 text-white relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              </button>
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl">
                Profile
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>
            <div className="relative group">
              <button
                onClick={() => openApp(apps.find(a => a.id === 'settings')!)}
                className="w-12 h-12 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-xl flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
                style={{ boxShadow: '0 4px 15px -3px rgba(75,85,99,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Settings className="w-6 h-6 text-white relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              </button>
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl">
                Settings
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            {/* Logout */}
            <div className="relative group">
              <button
                onClick={handleLogout}
                className="w-12 h-12 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-xl flex items-center justify-center hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
                style={{ boxShadow: '0 4px 15px -3px rgba(239,68,68,0.5), inset 0 1px 0 rgba(255,255,255,0.2)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <LogOut className="w-6 h-6 text-white relative z-10" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
              </button>
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900/95 backdrop-blur-md text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl">
                Logout
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
