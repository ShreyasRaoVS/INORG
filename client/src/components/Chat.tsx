import { useState, useEffect, useRef } from 'react';
import { X, Send, Search, Plus, Users, MessageSquare } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  createdAt: string;
}

interface ChatRoom {
  id: string;
  name?: string;
  isGroup: boolean;
  members: Array<{
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      status: string;
    };
  }>;
  messages: Message[];
}

interface ChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chat({ isOpen, onClose }: ChatProps) {
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data);
      markAsRead(roomId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markAsRead = async (roomId: string) => {
    try {
      await api.post(`/chat/rooms/${roomId}/read`);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const response = await api.post('/chat/messages', {
        content: newMessage,
        roomId: selectedRoom.id
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      loadRooms(); // Refresh rooms to update last message
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.get(`/chat/users/search?q=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const startChat = async (userId: string) => {
    try {
      const response = await api.post('/chat/rooms/direct', { userId });
      setSelectedRoom(response.data);
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
      loadRooms();
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.isGroup) return room.name || 'Group Chat';
    const otherMember = room.members.find(m => m.user.id !== user?.id);
    return otherMember ? `${otherMember.user.firstName} ${otherMember.user.lastName}` : 'Chat';
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (room.isGroup) return null;
    const otherMember = room.members.find(m => m.user.id !== user?.id);
    return otherMember?.user.avatar;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <h2 className="font-semibold">Messages</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="hover:bg-blue-600 p-2 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="hover:bg-blue-600 p-2 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showNewChat ? (
        /* New Chat Screen */
        <div className="flex-1 flex flex-col p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => startChat(user.id)}
                className="w-full p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    `${user.firstName[0]}${user.lastName[0]}`
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-sm text-gray-500">{user.department?.name || user.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : selectedRoom ? (
        /* Chat View */
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-3 border-b flex items-center space-x-3">
            <button onClick={() => setSelectedRoom(null)} className="hover:bg-gray-100 p-1 rounded">
              ← Back
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {getRoomAvatar(selectedRoom) ? (
                <img src={getRoomAvatar(selectedRoom)!} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                selectedRoom.isGroup ? <Users className="w-4 h-4" /> : getRoomName(selectedRoom)[0]
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{getRoomName(selectedRoom)}</div>
              {!selectedRoom.isGroup && (
                <div className="text-xs text-gray-500">Online</div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user?.id;
              return (
                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    {!isOwn && (
                      <div className="text-xs text-gray-500 mb-1">
                        {message.sender.firstName} {message.sender.lastName}
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-lg ${
                        isOwn
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-900 rounded-bl-none'
                      }`}
                    >
                      {message.content}
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Rooms List */
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Click + to start a new chat</p>
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className="w-full p-4 hover:bg-gray-50 flex items-start space-x-3 border-b transition"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {getRoomAvatar(room) ? (
                    <img src={getRoomAvatar(room)!} alt="" className="w-12 h-12 rounded-full" />
                  ) : room.isGroup ? (
                    <Users className="w-6 h-6" />
                  ) : (
                    getRoomName(room)[0]
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium truncate">{getRoomName(room)}</div>
                  {room.messages[0] && (
                    <div className="text-sm text-gray-500 truncate">
                      {room.messages[0].sender.firstName}: {room.messages[0].content}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  {room.messages[0] &&
                    new Date(room.messages[0].createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
