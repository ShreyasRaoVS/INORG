import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Department, Team } from '../../types';

interface ProjectForm {
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  deadline: string;
  teamId: string;
  departmentId: string;
}

export default function CreateProject() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectForm>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptsRes, teamsRes] = await Promise.all([
        api.get('/departments'),
        api.get('/teams'),
      ]);
      setDepartments(deptsRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const onSubmit = async (data: ProjectForm) => {
    setIsLoading(true);
    try {
      await api.post('/projects', data);
      toast.success('Project created successfully');
      navigate('/projects');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/projects" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        <div>
          <label className="label">Project Name *</label>
          <input
            type="text"
            {...register('name', { required: 'Project name is required' })}
            className="input"
            placeholder="Enter project name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            {...register('description')}
            className="input"
            rows={4}
            placeholder="Describe the project..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Status *</label>
            <select {...register('status', { required: true })} className="input">
              <option value="PLANNING">Planning</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="label">Priority *</label>
            <select {...register('priority', { required: true })} className="input">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Department</label>
            <select {...register('departmentId')} className="input">
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Team</label>
            <select {...register('teamId')} className="input">
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input type="date" {...register('startDate')} className="input" />
          </div>

          <div>
            <label className="label">End Date</label>
            <input type="date" {...register('endDate')} className="input" />
          </div>

          <div>
            <label className="label">Deadline</label>
            <input type="date" {...register('deadline')} className="input" />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
          <Link to="/projects" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
