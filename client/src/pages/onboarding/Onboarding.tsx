import { useState, useEffect } from 'react';
import { Plus, CheckCircle, Clock, AlertCircle, X, UserPlus, Edit2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { formatDate } from '../../lib/utils';
import type { OnboardingProcess, User } from '../../types';

interface ChecklistItem {
  id: number;
  title: string;
  completed: boolean;
}

export default function Onboarding() {
  const [processes, setProcesses] = useState<OnboardingProcess[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assignedBuddy, setAssignedBuddy] = useState('');
  const [editingProcess, setEditingProcess] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [processesRes, usersRes] = await Promise.all([
        api.get('/onboarding'),
        api.get('/users'),
      ]);
      setProcesses(processesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      await api.post('/onboarding', { 
        userId: selectedUserId,
        assignedBuddy: assignedBuddy || undefined
      });
      toast.success('Onboarding process created successfully!');
      setShowCreateForm(false);
      setSelectedUserId('');
      setAssignedBuddy('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create onboarding process');
    }
  };

  const handleToggleChecklistItem = async (processId: string, checklist: ChecklistItem[], itemId: number) => {
    try {
      const updatedChecklist = checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      
      await api.put(`/onboarding/${processId}`, { 
        checklistItems: updatedChecklist 
      });
      
      toast.success('Checklist updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update checklist');
    }
  };

  const handleSaveNotes = async (processId: string) => {
    try {
      await api.put(`/onboarding/${processId}`, { notes: editNotes });
      toast.success('Notes saved');
      setEditingProcess(null);
      setEditNotes('');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save notes');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/onboarding/${id}`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-600 mt-1">Manage employee onboarding processes</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Onboarding</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateProcess} className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Start New Onboarding Process
            </h3>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Employee *
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select an employee...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} - {user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Onboarding Buddy (Optional)
              </label>
              <select
                value={assignedBuddy}
                onChange={(e) => setAssignedBuddy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No buddy assigned</option>
                {users
                  .filter(u => u.id !== selectedUserId)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} - {user.department?.name || 'No Dept'}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setSelectedUserId('');
                setAssignedBuddy('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Onboarding
            </button>
          </div>
        </form>
      )}

      {/* Onboarding Processes */}
      <div className="grid grid-cols-1 gap-6">
        {processes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No onboarding processes. Click "New Onboarding" to get started.</p>
          </div>
        ) : (
          processes.map((process) => {
            const checklist = (process.checklistItems as ChecklistItem[]) || [];
            const completedCount = checklist.filter(item => item.completed).length;
            const progressPercentage = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

            return (
              <div key={process.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                      {process.user?.firstName[0]}
                      {process.user?.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {process.user?.firstName} {process.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{process.user?.email}</p>
                      {process.user?.department && (
                        <p className="text-xs text-gray-500 mt-0.5">{process.user.department.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(process.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(process.status)}`}>
                        {process.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-4 py-3 border-y">
                  <div className="text-sm">
                    <span className="text-gray-600">Started:</span>
                    <p className="font-medium text-gray-900">{formatDate(process.startDate)}</p>
                  </div>
                  {process.assignedBuddy && (
                    <div className="text-sm">
                      <span className="text-gray-600">Buddy:</span>
                      <p className="font-medium text-gray-900\">\n                        {users.find(u => u.id === process.assignedBuddy)?.firstName || 'Assigned'}\n                      </p>
                    </div>
                  )}
                  {process.completedDate && (
                    <div className="text-sm">
                      <span className="text-gray-600">Completed:</span>
                      <p className="font-medium text-gray-900">{formatDate(process.completedDate)}</p>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Onboarding Progress
                    </span>
                    <span className="text-sm text-gray-600">
                      {completedCount} of {checklist.length} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Onboarding Checklist:</h4>
                  <div className="space-y-1.5">
                    {checklist.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition group"
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklistItem(process.id, checklist, item.id)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                          disabled={process.status === 'COMPLETED'}
                        />
                        <span className={`text-sm flex-1 ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {item.title}
                        </span>
                        {item.completed && (
                          <CheckCircle className="w-4 h-4 text-green-600\" />
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="space-y-2\">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 text-sm\">Notes:</h4>
                    {editingProcess !== process.id && (
                      <button
                        onClick={() => {
                          setEditingProcess(process.id);
                          setEditNotes(process.notes || '');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>
                  {editingProcess === process.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        rows={3}
                        placeholder="Add notes about onboarding progress..."
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingProcess(null);
                            setEditNotes('');
                          }}
                          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNotes(process.id)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {process.notes || 'No notes added yet'}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(process.id, 'IN_PROGRESS')}
                    disabled={process.status === 'IN_PROGRESS' || process.status === 'COMPLETED'}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(process.id, 'COMPLETED')}
                    disabled={process.status === 'COMPLETED'}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
