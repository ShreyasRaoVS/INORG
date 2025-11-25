import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, Folder, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react';
import api from '../../lib/api';
import type { Team, User } from '../../types';

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    fetchTeam();
    fetchAllUsers();
  }, [id]);

  const fetchTeam = async () => {
    try {
      const response = await api.get(`/teams/${id}`);
      setTeam(response.data);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      await api.post(`/teams/${id}/members`, { userId: selectedUserId });
      setShowAddMember(false);
      setSelectedUserId('');
      fetchTeam();
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member from the team?')) return;
    try {
      await api.delete(`/teams/${id}/members/${userId}`);
      fetchTeam();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      await api.delete(`/teams/${id}`);
      navigate('/teams');
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  const availableUsers = allUsers.filter(
    (user) => !team?.members?.some((member) => member.id === user.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Team not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/teams')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
            {team.description && <p className="text-gray-600 mt-1">{team.description}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddMember(!showAddMember)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddMember}
              disabled={!selectedUserId}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddMember(false)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({team.members?.length || 0})
            </h2>

            {team.members && team.members.length > 0 ? (
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {member.role}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove member"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No members in this team</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Information</h2>
            <div className="space-y-4">
              {team.department && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Department
                  </label>
                  <p className="text-gray-900 mt-1">{team.department.name}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">Total Members</label>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {team.members?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
