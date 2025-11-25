import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Building2,
  UserPlus,
  UserMinus,
  BarChart3,
  FileText,
  Grid3x3,
  Presentation,
  Sheet,
  Pencil,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  category: 'main' | 'creative' | 'tools';
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems: NavItem[] = [
    // Main Category
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard', category: 'main' },
    { name: 'Projects', icon: <FolderKanban className="w-5 h-5" />, path: '/projects', category: 'main' },
    { name: 'Tasks', icon: <CheckSquare className="w-5 h-5" />, path: '/tasks', category: 'main' },
    { name: 'Teams', icon: <Users className="w-5 h-5" />, path: '/teams', category: 'main' },
    { name: 'Members', icon: <Users className="w-5 h-5" />, path: '/members', category: 'main' },
    { name: 'Departments', icon: <Building2 className="w-5 h-5" />, path: '/departments', category: 'main' },
    
    // HR Category
    { name: 'Onboarding', icon: <UserPlus className="w-5 h-5" />, path: '/onboarding', category: 'main' },
    { name: 'Offboarding', icon: <UserMinus className="w-5 h-5" />, path: '/offboarding', category: 'main' },
    { name: 'Analytics', icon: <BarChart3 className="w-5 h-5" />, path: '/analytics', category: 'main' },
    { name: 'Documents', icon: <FileText className="w-5 h-5" />, path: '/documents', category: 'main' },
    
    // Creative Tools
    { name: 'Whiteboard', icon: <Grid3x3 className="w-5 h-5" />, path: '/whiteboard', category: 'creative' },
    { name: 'Presenter', icon: <Presentation className="w-5 h-5" />, path: '/presenter', category: 'creative' },
    { name: 'Excel', icon: <Sheet className="w-5 h-5" />, path: '/excel', category: 'creative' },
    { name: 'Docs', icon: <Pencil className="w-5 h-5" />, path: '/docs', category: 'creative' },
  ];

  const mainItems = navigationItems.filter(item => item.category === 'main');
  const creativeItems = navigationItems.filter(item => item.category === 'creative');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-lg`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                I
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">INORG</h1>
                <p className="text-xs text-slate-500">ERP System</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Main Section */}
          {sidebarOpen && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">Main</p>}
          {mainItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border-l-4 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.name : ''}
              >
                {item.icon}
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}

          {/* Creative Tools Section */}
          {sidebarOpen && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mt-6">Creative Tools</p>}
          {creativeItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 shadow-sm border-l-4 border-purple-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.name : ''}
              >
                {item.icon}
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 p-4 space-y-2">
          <button
            onClick={() => navigate('/profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all ${!sidebarOpen && 'justify-center'}`}
            title={!sidebarOpen ? 'Profile' : ''}
          >
            <User className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Profile</span>}
          </button>
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-all ${!sidebarOpen && 'justify-center'}`}
            title={!sidebarOpen ? 'Settings' : ''}
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all ${!sidebarOpen && 'justify-center'}`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>

          {/* User Info */}
          {sidebarOpen && user && (
            <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-slate-700">{user.email}</p>
              <p className="text-xs text-slate-500">Admin User</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 shadow-sm px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            {navigationItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.email}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-slate-100">
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
