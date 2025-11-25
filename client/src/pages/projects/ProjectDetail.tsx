import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { formatDate, getStatusColor } from '../../lib/utils';
import type { Project } from '../../types';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast.error('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Link to="/projects" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-1">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
              <button className="btn btn-primary btn-sm flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
            <div className="space-y-2">
              {project.tasks && project.tasks.length > 0 ? (
                project.tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <span className={`badge ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.assignee && (
                      <p className="text-sm text-gray-600 mt-1">
                        Assigned to: {task.assignee.firstName} {task.assignee.lastName}
                      </p>
                    )}
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No tasks yet</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Documents</h2>
            <div className="space-y-2">
              {project.documents && project.documents.length > 0 ? (
                project.documents.map((doc) => (
                  <div key={doc.id} className="p-3 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      Uploaded by {doc.uploadedBy?.firstName || 'Unknown'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Project Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`badge mt-1 ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <span className={`badge mt-1 ${getStatusColor(project.priority)}`}>
                  {project.priority}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              {project.deadline && (
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className="font-medium mt-1">{formatDate(project.deadline)}</p>
                </div>
              )}
              {project.team && (
                <div>
                  <p className="text-sm text-gray-500">Team</p>
                  <p className="font-medium mt-1">{project.team.name}</p>
                </div>
              )}
              {project.department && (
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium mt-1">{project.department.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
