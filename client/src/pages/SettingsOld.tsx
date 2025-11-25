import { useState } from 'react';
import { Bell, Shield, Eye, Lock, Database, FileText, Smartphone, Monitor } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: <Shield className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Eye className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Monitor className="w-5 h-5" /> },
    { id: 'data', label: 'Data', icon: <Database className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Tabs */}
        <div className="border-b border-slate-200 flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input type="email" defaultValue="admin@inorg.com" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input type="text" defaultValue="Admin User" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Administration</option>
                    <option>HR</option>
                    <option>Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Administrator</option>
                    <option>Manager</option>
                    <option>Employee</option>
                  </select>
                </div>
              </div>

              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Notification Preferences</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive updates via email' },
                  { label: 'Task Reminders', desc: 'Get notified about upcoming tasks' },
                  { label: 'Team Updates', desc: 'Receive team activity notifications' },
                  { label: 'Project Updates', desc: 'Get notified about project changes' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded" />
                  </div>
                ))}
              </div>

              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Save Preferences
              </button>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Privacy Settings</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Profile Visibility', desc: 'Control who can see your profile' },
                  { label: 'Activity Status', desc: 'Show when you are online' },
                  { label: 'Data Collection', desc: 'Allow system to collect usage data' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <select className="px-3 py-1 border border-slate-300 rounded">
                      <option>Public</option>
                      <option>Private</option>
                      <option>Custom</option>
                    </select>
                  </div>
                ))}
              </div>

              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Save Settings
              </button>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Security Settings</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">🔒 Your account is secure</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">Change Password</h3>
                  <input type="password" placeholder="Current password" className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="password" placeholder="New password" className="w-full px-4 py-2 border border-slate-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="password" placeholder="Confirm password" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">Two-Factor Authentication</h3>
                  <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition">
                    Enable 2FA
                  </button>
                </div>
              </div>

              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Update Security
              </button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Appearance</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">Theme</label>
                  <div className="flex gap-4">
                    {['Light', 'Dark', 'Auto'].map((theme) => (
                      <button
                        key={theme}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          theme === 'Light'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-4">Sidebar Style</label>
                  <div className="flex gap-4">
                    {['Compact', 'Normal', 'Expanded'].map((style) => (
                      <button
                        key={style}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${
                          style === 'Normal'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Save Appearance
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Data & Storage</h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-2">Storage Usage</h3>
                  <div className="bg-white rounded border border-slate-200 p-3 mb-2">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-600">2.5 GB of 10 GB used</span>
                      <span className="text-sm font-medium text-slate-900">25%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-4">Export Data</h3>
                  <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition mr-2">
                    Export All Data
                  </button>
                  <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition">
                    Download Backup
                  </button>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">Danger Zone</h3>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Delete All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
