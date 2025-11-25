import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Briefcase, Calendar, Users, CheckSquare } from 'lucide-react';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import type { User, Task, Team } from '../../types';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const fetchMemberData = async () => {
    try {
      const [memberRes, tasksRes, teamsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/tasks?assigneeId=${id}`),
        api.get(`/teams?memberId=${id}`),
      ]);
      setMember(memberRes.data);
      setTasks(tasksRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Failed to fetch member data:', error);
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

  if (!member) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Member not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/members')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
          {member.firstName[0]}
          {member.lastName[0]}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-gray-600 mt-1">{member.role.replace('_', ' ')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Assigned Tasks ({tasks.length})
            </h2>

            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 mt-2">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          task.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-700'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No tasks assigned</p>
            )}
          </div>

          {/* Teams */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Teams ({teams.length})
            </h2>

            {teams.length > 0 ? (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                    )}
                    {team.department && (
                      <p className="text-xs text-gray-500 mt-2">{team.department.name}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Not a member of any teams</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="text-gray-900 mt-1">{member.email}</p>
              </div>

              {member.department && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Department
                  </label>
                  <p className="text-gray-900 mt-1">{member.department.name}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined
                </label>
                <p className="text-gray-900 mt-1">{formatDate(member.createdAt || new Date())}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Tasks</span>
                <span className="text-2xl font-bold text-gray-900">{tasks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="text-2xl font-bold text-green-600">
                  {tasks.filter((t) => t.status === 'COMPLETED').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Teams</span>
                <span className="text-2xl font-bold text-blue-600">{teams.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
