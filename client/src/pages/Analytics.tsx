import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, CheckSquare, FolderKanban, Clock } from 'lucide-react';
import api from '../lib/api';

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  avgTaskCompletionTime: number;
  activeProjects: number;
  tasksByStatus: { status: string; count: number }[];
  projectsByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Failed to load analytics</p>
      </div>
    );
  }

  const completionRate =
    analytics.totalTasks > 0
      ? ((analytics.completedTasks / analytics.totalTasks) * 100).toFixed(1)
      : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-1">Track your organization's performance and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.activeProjects}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Tasks by Status
          </h2>
          <div className="space-y-4">
            {analytics.tasksByStatus.map((item) => {
              const percentage =
                analytics.totalTasks > 0 ? (item.count / analytics.totalTasks) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'COMPLETED'
                          ? 'bg-green-500'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-blue-500'
                          : item.status === 'IN_REVIEW'
                          ? 'bg-purple-500'
                          : item.status === 'BLOCKED'
                          ? 'bg-red-500'
                          : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projects by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Projects by Status
          </h2>
          <div className="space-y-4">
            {analytics.projectsByStatus.map((item) => {
              const percentage =
                analytics.totalProjects > 0 ? (item.count / analytics.totalProjects) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">
                      {item.status.replace('_', ' ')}
                    </span>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'COMPLETED'
                          ? 'bg-green-500'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-blue-500'
                          : item.status === 'ON_HOLD'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tasks by Priority */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Tasks by Priority
          </h2>
          <div className="space-y-4">
            {analytics.tasksByPriority.map((item) => {
              const percentage =
                analytics.totalTasks > 0 ? (item.count / analytics.totalTasks) * 100 : 0;
              return (
                <div key={item.priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{item.priority}</span>
                    <span className="text-gray-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.priority === 'URGENT'
                          ? 'bg-red-500'
                          : item.priority === 'HIGH'
                          ? 'bg-orange-500'
                          : item.priority === 'MEDIUM'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Average Completion Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Performance Metrics
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Avg. Task Completion Time</p>
              <p className="text-4xl font-bold text-gray-900">
                {analytics.avgTaskCompletionTime.toFixed(1)}
                <span className="text-lg font-normal text-gray-600 ml-2">days</span>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Completed Tasks</p>
              <p className="text-4xl font-bold text-green-600">
                {analytics.completedTasks}
                <span className="text-lg font-normal text-gray-600 ml-2">
                  / {analytics.totalTasks}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
