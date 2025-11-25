import { useState, useEffect, useRef } from 'react';
import { Send, Search, Plus, Users } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
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
  onClose?: () => void;
}

export default function ChatRealtime({ isOpen }: ChatProps) {
  const { user, token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize Socket.IO
  useEffect(() => {
    if (!token || !isOpen) return;

    const newSocket = io('http://localhost:8080', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
    });

    newSocket.on('chat:newMessage', (data) => {
      if (selectedRoom && data.roomId === selectedRoom.id) {
        const newMsg: Message = {
          id: Date.now().toString(),
          content: data.message,
          senderId: data.userId,
          sender: { id: data.userId, firstName: '', lastName: '' },
          createdAt: data.timestamp
        };
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
      loadRooms();
    });

    newSocket.on('chat:userTyping', (data) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));
      } else {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }
    });

    newSocket.on('user:online', (data) => {
      setOnlineUsers((prev) => new Set(prev).add(data.userId));
    });

    newSocket.on('user:offline', (data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadRooms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      if (socket) {
        socket.emit('chat:join', selectedRoom.id);
      }
      
      return () => {
        if (socket) {
          socket.emit('chat:leave', selectedRoom.id);
        }
      };
    }
  }, [selectedRoom, socket]);

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
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !socket) return;

    try {
      await api.post(`/chat/rooms/${selectedRoom.id}/messages`, {
        content: newMessage,
      });

      socket.emit('chat:message', {
        roomId: selectedRoom.id,
        message: newMessage
      });

      setNewMessage('');
      
      if (isTyping && socket) {
        socket.emit('chat:typing', { roomId: selectedRoom.id, isTyping: false });
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!socket || !selectedRoom) return;

    if (value && !isTyping) {
      socket.emit('chat:typing', { roomId: selectedRoom.id, isTyping: true });
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socket && selectedRoom) {
        socket.emit('chat:typing', { roomId: selectedRoom.id, isTyping: false });
        setIsTyping(false);
      }
    }, 2000);
  };

  const searchUsers = async (query: string) => {
    setSearchQuery(query);
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

  const createDirectChat = async (userId: string) => {
    try {
      const response = await api.post('/chat/rooms/direct', { userId });
      setSelectedRoom(response.data);
      setShowNewChat(false);
      setSearchQuery('');
      setSearchResults([]);
      loadRooms();
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.name) return room.name;
    const otherMember = room.members.find((m) => m.user.id !== user?.id);
    return otherMember
      ? `${otherMember.user.firstName} ${otherMember.user.lastName}`
      : 'Chat';
  };

  const getAvatar = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-slate-900 flex flex-col text-white">
      {/* No header needed - parent window has title bar */}

      {/* Content */}
      {!selectedRoom ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-700">
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {showNewChat && (
            <div className="p-3 border-b border-slate-700 bg-slate-800">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => searchUsers(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => createDirectChat(u.id)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-slate-700 rounded text-left"
                    >
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {getAvatar(`${u.firstName} ${u.lastName}`)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto">
            {rooms.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 text-slate-500" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin messaging</p>
              </div>
            ) : (
              rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className="w-full p-3 border-b border-slate-700 hover:bg-slate-800 transition text-left flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {getAvatar(getRoomName(room))}
                    </div>
                    {!room.isGroup && room.members.some(m => m.user.id !== user?.id && onlineUsers.has(m.user.id)) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {getRoomName(room)}
                    </p>
                    {room.messages.length > 0 && (
                      <p className="text-sm text-slate-400 truncate">
                        {room.messages[room.messages.length - 1].content}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-3 border-b border-slate-700 flex items-center gap-3">
            <button
              onClick={() => setSelectedRoom(null)}
              className="text-slate-400 hover:text-white"
            >
              ←
            </button>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getAvatar(getRoomName(selectedRoom))}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{getRoomName(selectedRoom)}</p>
              <p className="text-xs text-slate-400">
                {selectedRoom.isGroup
                  ? `${selectedRoom.members.length} members`
                  : 'Direct message'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-800">
            {messages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg shadow-lg ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-1 text-blue-300">
                        {msg.sender.firstName} {msg.sender.lastName}
                      </p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div className="px-4 py-1 text-xs text-slate-400 italic bg-slate-800">
              Someone is typing...
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 bg-slate-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
