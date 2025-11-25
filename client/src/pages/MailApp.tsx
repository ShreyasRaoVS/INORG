import { useState } from 'react';
import { 
  Mail, Send, Inbox, Star, Trash2, Archive, Search, 
  Paperclip, MoreVertical, Reply, ReplyAll, Forward,
  Clock, User, Filter, X, Plus, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

interface Email {
  id: number;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  labels: string[];
}

interface Contact {
  id: string;
  name: string;
  email: string;
  department: string;
  avatar?: string;
}

export default function MailApp() {
  const { user } = useAuthStore();
  const [activeView, setActiveView] = useState<'inbox' | 'sent' | 'starred' | 'trash'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Compose form state
  const [composeTo, setComposeTo] = useState<string[]>([]);
  const [composeCc, setComposeCc] = useState<string[]>([]);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactPickerFor, setContactPickerFor] = useState<'to' | 'cc'>('to');

  // Mock data
  const [emails, setEmails] = useState<Email[]>([
    {
      id: 1,
      from: 'alice.johnson@inorg.com',
      to: [`${user?.email || 'admin@inorg.com'}`],
      subject: 'Q4 Project Review Meeting',
      body: 'Hi team,\n\nI hope this email finds you well. I wanted to schedule our Q4 project review meeting for next week. Please let me know your availability.\n\nThe agenda will include:\n- Project milestones review\n- Budget analysis\n- Q1 planning\n\nLooking forward to hearing from you.\n\nBest regards,\nAlice',
      timestamp: '2 hours ago',
      isRead: false,
      isStarred: true,
      hasAttachment: false,
      labels: ['work', 'important']
    },
    {
      id: 2,
      from: 'bob.smith@inorg.com',
      to: [`${user?.email || 'admin@inorg.com'}`],
      cc: ['team@inorg.com'],
      subject: 'Updated Design Mockups',
      body: 'Hello,\n\nI have uploaded the latest design mockups to the shared drive. Please review and provide feedback by end of day.\n\nKey changes:\n- New color scheme\n- Improved navigation\n- Mobile responsive layouts\n\nThanks,\nBob',
      timestamp: '5 hours ago',
      isRead: true,
      isStarred: false,
      hasAttachment: true,
      labels: ['design']
    },
    {
      id: 3,
      from: 'carol.davis@inorg.com',
      to: [`${user?.email || 'admin@inorg.com'}`],
      subject: 'Team Building Event - December 15th',
      body: 'Dear team,\n\nWe are organizing a team building event on December 15th at the Oak Ridge Conference Center.\n\nActivities include:\n- Team challenges\n- Lunch and networking\n- Awards ceremony\n\nPlease RSVP by December 1st.\n\nRegards,\nCarol',
      timestamp: '1 day ago',
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      labels: ['team']
    },
    {
      id: 4,
      from: 'hr@inorg.com',
      to: [`${user?.email || 'admin@inorg.com'}`],
      subject: 'Benefits Enrollment Reminder',
      body: 'Hello,\n\nThis is a friendly reminder that the benefits enrollment period ends on November 30th. Please review your selections in the HR portal.\n\nIf you have any questions, feel free to reach out.\n\nBest,\nHR Team',
      timestamp: '2 days ago',
      isRead: false,
      isStarred: false,
      hasAttachment: true,
      labels: ['hr']
    },
  ]);

  const contacts: Contact[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice.johnson@inorg.com', department: 'Management' },
    { id: '2', name: 'Bob Smith', email: 'bob.smith@inorg.com', department: 'Design' },
    { id: '3', name: 'Carol Davis', email: 'carol.davis@inorg.com', department: 'HR' },
    { id: '4', name: 'David Wilson', email: 'david.wilson@inorg.com', department: 'Engineering' },
    { id: '5', name: 'Emma Brown', email: 'emma.brown@inorg.com', department: 'Marketing' },
    { id: '6', name: 'Frank Miller', email: 'frank.miller@inorg.com', department: 'Sales' },
  ];

  const filteredEmails = emails.filter(email => {
    const matchesView = 
      (activeView === 'inbox' && !email.labels.includes('trash')) ||
      (activeView === 'sent') ||
      (activeView === 'starred' && email.isStarred) ||
      (activeView === 'trash' && email.labels.includes('trash'));
    
    const matchesSearch = searchQuery === '' || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesView && matchesSearch;
  });

  const unreadCount = emails.filter(e => !e.isRead && !e.labels.includes('trash')).length;

  const handleCompose = () => {
    setIsComposing(true);
    setSelectedEmail(null);
    setComposeTo([]);
    setComposeCc([]);
    setComposeSubject('');
    setComposeBody('');
    setShowCc(false);
  };

  const handleSend = () => {
    if (composeTo.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }
    if (!composeSubject.trim()) {
      toast.error('Please add a subject');
      return;
    }

    const newEmail: Email = {
      id: emails.length + 1,
      from: user?.email || 'admin@inorg.com',
      to: composeTo,
      cc: composeCc.length > 0 ? composeCc : undefined,
      subject: composeSubject,
      body: composeBody,
      timestamp: 'Just now',
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      labels: ['sent']
    };

    setEmails([newEmail, ...emails]);
    toast.success('Email sent successfully!');
    setIsComposing(false);
    setComposeTo([]);
    setComposeCc([]);
    setComposeSubject('');
    setComposeBody('');
  };

  const handleReply = (email: Email) => {
    setIsComposing(true);
    setSelectedEmail(null);
    setComposeTo([email.from]);
    setComposeSubject(`Re: ${email.subject}`);
    setComposeBody(`\n\n---\nOn ${email.timestamp}, ${email.from} wrote:\n${email.body}`);
  };

  const handleReplyAll = (email: Email) => {
    setIsComposing(true);
    setSelectedEmail(null);
    setComposeTo([email.from, ...email.to.filter(e => e !== user?.email)]);
    if (email.cc) setComposeCc(email.cc);
    setComposeSubject(`Re: ${email.subject}`);
    setComposeBody(`\n\n---\nOn ${email.timestamp}, ${email.from} wrote:\n${email.body}`);
    setShowCc(true);
  };

  const handleForward = (email: Email) => {
    setIsComposing(true);
    setSelectedEmail(null);
    setComposeTo([]);
    setComposeSubject(`Fwd: ${email.subject}`);
    setComposeBody(`\n\n---\nForwarded message from ${email.from}:\n${email.body}`);
  };

  const toggleStar = (emailId: number) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, isStarred: !e.isStarred } : e
    ));
  };

  const markAsRead = (emailId: number) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, isRead: true } : e
    ));
  };

  const moveToTrash = (emailId: number) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, labels: [...e.labels, 'trash'] } : e
    ));
    setSelectedEmail(null);
    toast.success('Moved to trash');
  };

  const addRecipient = (email: string, type: 'to' | 'cc') => {
    if (type === 'to') {
      if (!composeTo.includes(email)) {
        setComposeTo([...composeTo, email]);
      }
    } else {
      if (!composeCc.includes(email)) {
        setComposeCc([...composeCc, email]);
      }
    }
    setShowContactPicker(false);
  };

  const removeRecipient = (email: string, type: 'to' | 'cc') => {
    if (type === 'to') {
      setComposeTo(composeTo.filter(e => e !== email));
    } else {
      setComposeCc(composeCc.filter(e => e !== email));
    }
  };

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4">
          <button
            onClick={handleCompose}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Compose
          </button>
        </div>

        <nav className="flex-1 px-2">
          <button
            onClick={() => setActiveView('inbox')}
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 mb-1 transition ${
              activeView === 'inbox' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Inbox className="w-5 h-5" />
            <span className="flex-1 text-left">Inbox</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('starred')}
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 mb-1 transition ${
              activeView === 'starred' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Star className="w-5 h-5" />
            <span>Starred</span>
          </button>

          <button
            onClick={() => setActiveView('sent')}
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 mb-1 transition ${
              activeView === 'sent' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Send className="w-5 h-5" />
            <span>Sent</span>
          </button>

          <button
            onClick={() => setActiveView('trash')}
            className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 mb-1 transition ${
              activeView === 'trash' 
                ? 'bg-blue-50 text-blue-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Trash2 className="w-5 h-5" />
            <span>Trash</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-semibold mb-1">Storage</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p>4.5 GB of 10 GB used</p>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-auto">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Mail className="w-16 h-16 mb-4" />
              <p className="text-lg font-medium">No emails</p>
              <p className="text-sm">Your {activeView} is empty</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => {
                  setSelectedEmail(email);
                  setIsComposing(false);
                  markAsRead(email.id);
                }}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition ${
                  selectedEmail?.id === email.id ? 'bg-blue-50' : ''
                } ${!email.isRead ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(email.id);
                    }}
                    className="mt-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        email.isStarred 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-semibold truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {email.from.split('@')[0]}
                      </p>
                      <span className="text-xs text-gray-500 ml-2">{email.timestamp}</span>
                    </div>
                    <p className={`text-sm truncate mb-1 ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-900'}`}>
                      {email.subject}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{email.body.split('\n')[0]}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {email.hasAttachment && (
                        <Paperclip className="w-4 h-4 text-gray-400" />
                      )}
                      {email.labels.filter(l => l !== 'trash').map((label) => (
                        <span
                          key={label}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Email Content / Compose */}
      <div className="flex-1 flex flex-col bg-white">
        {isComposing ? (
          <div className="flex-1 flex flex-col">
            {/* Compose Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">New Message</h2>
              <button
                onClick={() => setIsComposing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Compose Form */}
            <div className="flex-1 flex flex-col p-6 overflow-auto">
              {/* To Field */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700 w-16">To:</label>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {composeTo.map((email) => (
                      <span
                        key={email}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                      >
                        {email}
                        <button onClick={() => removeRecipient(email, 'to')}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        setContactPickerFor('to');
                        setShowContactPicker(true);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      + Add
                    </button>
                  </div>
                  {!showCc && (
                    <button
                      onClick={() => setShowCc(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Cc
                    </button>
                  )}
                </div>
              </div>

              {/* Cc Field */}
              {showCc && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 w-16">Cc:</label>
                    <div className="flex-1 flex flex-wrap gap-2">
                      {composeCc.map((email) => (
                        <span
                          key={email}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                        >
                          {email}
                          <button onClick={() => removeRecipient(email, 'cc')}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={() => {
                          setContactPickerFor('cc');
                          setShowContactPicker(true);
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subject */}
              <div className="mb-4">
                <input
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full px-4 py-2 border-b border-gray-300 focus:border-blue-500 outline-none text-lg"
                />
              </div>

              {/* Body */}
              <div className="flex-1 mb-4">
                <textarea
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full h-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsComposing(false)}
                    className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Picker Modal */}
            {showContactPicker && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-h-[500px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Select Contact</h3>
                    <button
                      onClick={() => setShowContactPicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto space-y-2">
                    {contacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => addRecipient(contact.email, contactPickerFor)}
                        className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition flex items-center gap-3"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : selectedEmail ? (
          <div className="flex-1 flex flex-col">
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEmail.subject}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStar(selectedEmail.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        selectedEmail.isStarred 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => moveToTrash(selectedEmail.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {selectedEmail.from.split('@')[0].substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{selectedEmail.from}</p>
                  <p className="text-sm text-gray-500">
                    To: {selectedEmail.to.join(', ')}
                    {selectedEmail.cc && ` • Cc: ${selectedEmail.cc.join(', ')}`}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{selectedEmail.timestamp}</span>
              </div>
            </div>

            {/* Email Body */}
            <div className="flex-1 p-6 overflow-auto">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">{selectedEmail.body}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => handleReply(selectedEmail)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                <Reply className="w-4 h-4" />
                Reply
              </button>
              <button
                onClick={() => handleReplyAll(selectedEmail)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
              >
                <ReplyAll className="w-4 h-4" />
                Reply All
              </button>
              <button
                onClick={() => handleForward(selectedEmail)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
              >
                <Forward className="w-4 h-4" />
                Forward
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Mail className="w-24 h-24 mx-auto mb-4" />
              <p className="text-xl font-medium">Select an email to read</p>
              <p className="text-sm mt-2">or click Compose to write a new message</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
