import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import type { Department, User } from '../../types';

interface TeamForm {
  name: string;
  description: string;
  departmentId: string;
}

export default function CreateTeam() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Array<{ userId: string; role: string }>>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<TeamForm>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptsRes, usersRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users'),
      ]);
      setDepartments(deptsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleAddMember = (userId: string) => {
    if (selectedMembers.find(m => m.userId === userId)) {
      toast.error('Member already added');
      return;
    }
    setSelectedMembers([...selectedMembers, { userId, role: 'MEMBER' }]);
  };

  const handleRemoveMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.userId !== userId));
  };

  const handleChangeRole = (userId: string, role: string) => {
    setSelectedMembers(selectedMembers.map(m => 
      m.userId === userId ? { ...m, role } : m
    ));
  };

  const onSubmit = async (data: TeamForm) => {
    setIsLoading(true);
    try {
      await api.post('/teams', {
        ...data,
        members: selectedMembers,
      });
      toast.success('Team created successfully');
      navigate('/teams');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : '';
  };

  const availableUsers = users.filter(u => !selectedMembers.find(m => m.userId === u.id));

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teams" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create New Team</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Team Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
            <input
              type="text"
              {...register('name', { required: 'Team name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter team name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Describe the team's purpose and goals..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              {...register('departmentId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <span className="text-sm text-gray-600">{selectedMembers.length} members</span>
          </div>

          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="space-y-2">
              {selectedMembers.map(member => (
                <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{getUserName(member.userId)}</span>
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleChangeRole(member.userId, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="LEAD">Lead</option>
                      <option value="CONTRIBUTOR">Contributor</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member.userId)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Member */}
          {availableUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Add Member</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddMember(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a member to add...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Team'}
          </button>
          <Link
            to="/teams"
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
