import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { 
  FolderKanban, 
  CheckSquare, 
  Users, 
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  Settings
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { formatDate, getStatusColor } from '../lib/utils';
import type { Project, Task, Activity } from '../types';
import CompanyBanner from '../components/CompanyBanner';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  title: string;
  component: JSX.Element;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    myTasks: 0,
    overdueTasks: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<any>({});

  const defaultLayout: Layout[] = [
    { i: 'stats', x: 0, y: 0, w: 12, h: 2, minW: 6, minH: 2 },
    { i: 'projects', x: 0, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'tasks', x: 6, y: 2, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'activity', x: 0, y: 6, w: 12, h: 4, minW: 6, minH: 3 },
  ];

  useEffect(() => {
    fetchDashboardData();
    loadLayout();
  }, []);

  const loadLayout = async () => {
    try {
      const response = await api.get('/users/dashboard-layout');
      if (response.data) {
        setLayouts(response.data);
      }
    } catch (error) {
      console.error('Failed to load layout:', error);
    }
  };

  const saveLayout = async (newLayouts: any) => {
    try {
      await api.put('/users/dashboard-layout', { layout: newLayouts });
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  const handleLayoutChange = (layout: Layout[], layouts: any) => {
    setLayouts(layouts);
    if (isEditMode) {
      saveLayout(layouts);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [projectsRes, tasksRes, activitiesRes] = await Promise.all([
        api.get('/projects'),
        api.get(`/tasks?assigneeId=${user?.id}`),
        api.get('/activities/feed?limit=10'),
      ]);

      const projects = projectsRes.data;
      const tasks = tasksRes.data;

      setRecentProjects(projects.slice(0, 5));
      setMyTasks(tasks.slice(0, 10));
      setActivities(activitiesRes.data);

      const activeProjects = projects.filter((p: Project) => p.status === 'IN_PROGRESS');
      const completedTasks = tasks.filter((t: Task) => t.status === 'COMPLETED');
      const overdueTasks = tasks.filter(
        (t: Task) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
      );

      setStats({
        totalProjects: projects.length,
        activeProjects: activeProjects.length,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        myTasks: tasks.length,
        overdueTasks: overdueTasks.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const widgets: DashboardWidget[] = [
    {
      id: 'stats',
      title: 'Statistics',
      component: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <FolderKanban className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{stats.activeProjects}</p>
            <p className="text-sm opacity-90">Active Projects</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <CheckSquare className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{stats.myTasks}</p>
            <p className="text-sm opacity-90">My Tasks</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{stats.completedTasks}</p>
            <p className="text-sm opacity-90">Completed</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
            <AlertCircle className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{stats.overdueTasks}</p>
            <p className="text-sm opacity-90">Overdue</p>
          </div>
        </div>
      ),
    },
    {
      id: 'projects',
      title: 'Recent Projects',
      component: (
        <div className="space-y-3">
          {recentProjects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}
                >
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {project.deadline ? formatDate(project.deadline) : 'No deadline'}
                </span>
                <span>{project.progress}% Complete</span>
              </div>
            </Link>
          ))}
          {recentProjects.length === 0 && (
            <p className="text-center text-gray-500 py-8">No projects yet</p>
          )}
        </div>
      ),
    },
    {
      id: 'tasks',
      title: 'My Tasks',
      component: (
        <div className="space-y-3">
          {myTasks.map((task) => (
            <Link
              key={task.id}
              to={`/tasks/${task.id}`}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(task.dueDate)}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded ${
                  task.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                  task.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                  task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.priority}
                </span>
              </div>
            </Link>
          ))}
          {myTasks.length === 0 && (
            <p className="text-center text-gray-500 py-8">No tasks assigned</p>
          )}
        </div>
      ),
    },
    {
      id: 'activity',
      title: 'Recent Activity',
      component: (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(activity.createdAt)}</p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your projects today.</p>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            isEditMode
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>{isEditMode ? 'Done Editing' : 'Customize Dashboard'}</span>
        </button>
      </div>

      {/* Company Banner */}
      <CompanyBanner />

      {/* Draggable Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={Object.keys(layouts).length > 0 ? layouts : { lg: defaultLayout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
      >
        {widgets.map((widget) => (
          <div key={widget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${isEditMode ? 'drag-handle cursor-move bg-gray-50' : ''}`}>
              <h2 className="text-lg font-semibold text-gray-900">{widget.title}</h2>
              {isEditMode && <span className="text-gray-400 text-xs">Drag to reposition</span>}
            </div>
            <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 60px)' }}>
              {widget.component}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
