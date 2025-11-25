import { useState } from 'react';
import { Bell, Shield, Eye, Lock, Database, Monitor, Check, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);

  // Account Settings
  const [accountData, setAccountData] = useState({
    email: user?.email || 'admin@inorg.com',
    fullName: `${user?.firstName || 'Admin'} ${user?.lastName || 'User'}`,
    department: 'Administration',
    role: 'Administrator',
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskReminders: true,
    teamUpdates: false,
    projectUpdates: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    activityStatus: 'visible',
    dataCollection: 'enabled',
  });

  // Security Settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: 'light',
    sidebarStyle: 'normal',
    fontSize: 'medium',
  });

  // Data Settings
  const [storageUsed] = useState(2.5);
  const [storageTotal] = useState(10);

  const tabs = [
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'data', label: 'Data', icon: Database },
  ];

  const handleSaveAccount = async () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Account settings saved successfully!');
      setIsSaving(false);
    }, 1000);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Notification preferences saved!');
      setIsSaving(false);
    }, 1000);
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Privacy settings updated!');
      setIsSaving(false);
    }, 1000);
  };

  const handleSaveSecurity = async () => {
    if (security.newPassword !== security.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Security settings updated!');
      setSecurity({ ...security, currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsSaving(false);
    }, 1000);
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success('Appearance settings saved!');
      setIsSaving(false);
    }, 1000);
  };

  const handleExportData = () => {
    toast.success('Data export started! You will receive an email when ready.');
  };

  const handleDownloadBackup = () => {
    toast.success('Backup download started!');
  };

  const handleDeleteData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      toast.success('Data deletion scheduled. This may take a few minutes.');
    }
  };

  return (
    <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200 flex overflow-x-auto bg-gradient-to-r from-slate-50 to-white">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 py-4 flex items-center justify-center gap-2 font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                  <p className="text-slate-600 mt-1">Manage your account information</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={accountData.fullName}
                      onChange={(e) => setAccountData({ ...accountData, fullName: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                    <select
                      value={accountData.department}
                      onChange={(e) => setAccountData({ ...accountData, department: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      <option>Administration</option>
                      <option>HR</option>
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <select
                      value={accountData.role}
                      onChange={(e) => setAccountData({ ...accountData, role: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                      <option>Administrator</option>
                      <option>Manager</option>
                      <option>Employee</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveAccount}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Notification Preferences</h2>
                  <p className="text-slate-600 mt-1">Choose what you want to be notified about</p>
                </div>
                
                <div className="space-y-4">
                  {Object.entries({
                    emailNotifications: { label: 'Email Notifications', desc: 'Receive updates via email' },
                    taskReminders: { label: 'Task Reminders', desc: 'Get notified about upcoming tasks' },
                    teamUpdates: { label: 'Team Updates', desc: 'Receive team activity notifications' },
                    projectUpdates: { label: 'Project Updates', desc: 'Get notified about project changes' },
                  }).map(([key, item]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                      <div>
                        <p className="font-medium text-slate-900">{item.label}</p>
                        <p className="text-sm text-slate-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications[key as keyof typeof notifications]}
                          onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Privacy Settings</h2>
                  <p className="text-slate-600 mt-1">Control your privacy and data visibility</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Profile Visibility</label>
                    <select
                      value={privacy.profileVisibility}
                      onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="public">Public - Everyone can view</option>
                      <option value="team">Team Only - Only team members</option>
                      <option value="private">Private - Only you</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Activity Status</label>
                    <select
                      value={privacy.activityStatus}
                      onChange={(e) => setPrivacy({ ...privacy, activityStatus: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="visible">Visible - Show when I'm online</option>
                      <option value="hidden">Hidden - Appear offline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Data Collection</label>
                    <select
                      value={privacy.dataCollection}
                      onChange={(e) => setPrivacy({ ...privacy, dataCollection: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="enabled">Enabled - Help improve the product</option>
                      <option value="minimal">Minimal - Only essential data</option>
                      <option value="disabled">Disabled - No data collection</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSavePrivacy}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Security Settings</h2>
                  <p className="text-slate-600 mt-1">Manage your password and security options</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <Check className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-900">Your account is secure with strong encryption</p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Change Password</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Enable 2FA</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security</p>
                    </div>
                    <button
                      onClick={() => {
                        setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled });
                        toast.success(security.twoFactorEnabled ? '2FA disabled' : '2FA enabled');
                      }}
                      className={`px-4 py-2 rounded-lg transition ${
                        security.twoFactorEnabled
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                      }`}
                    >
                      {security.twoFactorEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveSecurity}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Update Security'}
                </button>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Appearance Settings</h2>
                  <p className="text-slate-600 mt-1">Customize how the app looks</p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['light', 'dark', 'auto'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setAppearance({ ...appearance, theme })}
                          className={`p-4 rounded-lg border-2 transition capitalize ${
                            appearance.theme === theme
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Font Size</label>
                    <div className="grid grid-cols-3 gap-4">
                      {['small', 'medium', 'large'].map((size) => (
                        <button
                          key={size}
                          onClick={() => setAppearance({ ...appearance, fontSize: size })}
                          className={`p-4 rounded-lg border-2 transition capitalize ${
                            appearance.fontSize === size
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-slate-300 hover:border-slate-400'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveAppearance}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Appearance'}
                </button>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Data Management</h2>
                  <p className="text-slate-600 mt-1">Manage your data and storage</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Storage Usage</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Used Storage</span>
                      <span className="font-medium text-slate-900">{storageUsed} GB of {storageTotal} GB</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${(storageUsed / storageTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    onClick={handleExportData}
                    className="w-full px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center justify-center gap-2"
                  >
                    <Database className="w-5 h-5" />
                    Export All Data
                  </button>
                  <button
                    onClick={handleDownloadBackup}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Download Backup
                  </button>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-red-600 mb-3">Danger Zone</h3>
                  <button
                    onClick={handleDeleteData}
                    className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete All Data
                  </button>
                  <p className="text-sm text-slate-500 mt-2">This action is permanent and cannot be undone</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
