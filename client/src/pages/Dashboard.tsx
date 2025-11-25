import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckSquare, 
  Users, 
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { formatDate, getStatusColor } from '../lib/utils';
import type { Project, Task, Activity } from '../types';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    myTasks: 0,
    overdueTasks: 0,
    totalEmployees: 0,
    activeDepartments: 0,
    pendingApprovals: 0,
    teamPerformance: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

      // Calculate stats
      const activeProjects = projects.filter((p: Project) => p.status === 'IN_PROGRESS').length;
      const completedTasks = tasks.filter((t: Task) => t.status === 'COMPLETED').length;
      const overdue = tasks.filter((t: Task) => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
      ).length;

      setStats({
        totalProjects: projects.length,
        activeProjects,
        totalTasks: tasks.length,
        completedTasks,
        myTasks: tasks.length,
        overdueTasks: overdue,
        totalEmployees: Math.floor(Math.random() * 50) + 20, // Mock data
        activeDepartments: 5,
        pendingApprovals: Math.floor(Math.random() * 10) + 1,
        teamPerformance: Math.floor(Math.random() * 30) + 70,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Role-based stat cards configuration
  const getStatCards = () => {
    const isAdmin = user?.role === 'ADMIN';
    const isManager = user?.role === 'MANAGER';

    if (isAdmin) {
      return [
        { title: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'bg-gradient-to-br from-blue-500 to-blue-600', description: 'Active workforce' },
        { title: 'All Projects', value: stats.totalProjects, icon: FolderKanban, color: 'bg-gradient-to-br from-purple-500 to-purple-600', description: 'Company-wide projects' },
        { title: 'Departments', value: stats.activeDepartments, icon: TrendingUp, color: 'bg-gradient-to-br from-green-500 to-green-600', description: 'Active departments' },
        { title: 'Pending Approvals', value: stats.pendingApprovals, icon: AlertCircle, color: 'bg-gradient-to-br from-orange-500 to-orange-600', description: 'Requires attention' },
      ];
    }

    if (isManager) {
      return [
        { title: 'Team Projects', value: stats.activeProjects, icon: FolderKanban, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', description: 'Projects managed' },
        { title: 'Team Tasks', value: stats.totalTasks, icon: CheckSquare, color: 'bg-gradient-to-br from-violet-500 to-violet-600', description: 'Across your team' },
        { title: 'Team Performance', value: `${stats.teamPerformance}%`, icon: TrendingUp, color: 'bg-gradient-to-br from-green-500 to-green-600', description: 'Overall efficiency' },
        { title: 'Overdue Items', value: stats.overdueTasks, icon: AlertCircle, color: 'bg-gradient-to-br from-red-500 to-red-600', description: 'Needs follow-up' },
      ];
    }

    // Regular MEMBER view
    return [
      { title: 'My Tasks', value: stats.myTasks, icon: CheckSquare, color: 'bg-gradient-to-br from-purple-500 to-purple-600', description: 'Assigned to me' },
      { title: 'Completed', value: stats.completedTasks, icon: TrendingUp, color: 'bg-gradient-to-br from-green-500 to-green-600', description: 'Tasks finished' },
      { title: 'In Progress', value: stats.myTasks - stats.completedTasks, icon: Clock, color: 'bg-gradient-to-br from-blue-500 to-blue-600', description: 'Currently working' },
      { title: 'Overdue', value: stats.overdueTasks, icon: AlertCircle, color: 'bg-gradient-to-br from-red-500 to-red-600', description: 'Past deadline' },
    ];
  };

  const statCards = getStatCards();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Role-Based Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold uppercase tracking-wider">
              {user?.role}
            </div>
            <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
              {user?.department?.name || 'No Department'}
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-white/90 text-lg">
            {user?.role === 'ADMIN' 
              ? "You have full system access. Here's your organization overview." 
              : user?.role === 'MANAGER'
              ? "Manage your team and track project progress effectively."
              : "Here's your personal workspace and assigned tasks."}
          </p>
        </div>
      </div>

      {/* Enhanced Stats Grid with Role-Based Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 rounded-2xl transform group-hover:scale-105 transition-transform duration-300 shadow-lg group-hover:shadow-2xl"></div>
            <div className="relative card border-0 bg-transparent">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{stat.title}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`${stat.color} p-4 rounded-xl shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color} rounded-full animate-pulse`} style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
              <Link to="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {recentProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No projects yet</p>
              ) : (
                recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`badge ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                          <span className={`badge ${getStatusColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">Progress</div>
                        <div className="text-2xl font-bold text-primary-600">{project.progress}%</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* My Tasks */}
        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
              <Link to="/tasks" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {myTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No tasks assigned</p>
              ) : (
                myTasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`badge text-xs ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.user && `${activity.user.firstName} ${activity.user.lastName} • `}
                    {formatDate(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
