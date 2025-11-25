import { useState, useRef, useEffect } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, 
  Users, UserPlus, Settings as SettingsIcon, MessageSquare,
  Maximize2, Volume2, VolumeX, Grid3x3, LayoutGrid
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
}

export default function VideoCall() {
  const { user } = useAuthStore();
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Mock participants
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Alice Johnson', isAudioOn: true, isVideoOn: true, isScreenSharing: false },
    { id: '2', name: 'Bob Smith', isAudioOn: true, isVideoOn: false, isScreenSharing: false },
    { id: '3', name: 'Carol Davis', isAudioOn: false, isVideoOn: true, isScreenSharing: false },
  ]);

  const [availableMembers] = useState([
    { id: '4', name: 'David Wilson', avatar: '', department: 'Engineering' },
    { id: '5', name: 'Emma Brown', avatar: '', department: 'Marketing' },
    { id: '6', name: 'Frank Miller', avatar: '', department: 'Sales' },
    { id: '7', name: 'Grace Lee', avatar: '', department: 'HR' },
  ]);

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Alice Johnson', message: 'Hello everyone!', time: '10:30 AM' },
    { id: 2, sender: 'You', message: 'Hi team!', time: '10:31 AM' },
  ]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    if (isInCall && isVideoOn) {
      startLocalVideo();
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInCall]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: isAudioOn 
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error('Unable to access camera/microphone');
      console.error('Media access error:', error);
    }
  };

  const startCall = async (type: 'group' | 'individual', participantId?: string) => {
    setIsInCall(true);
    if (type === 'individual' && participantId) {
      toast.success(`Starting call with ${availableMembers.find(m => m.id === participantId)?.name}`);
    } else {
      toast.success('Starting group meeting...');
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setIsInCall(false);
    setIsScreenSharing(false);
    toast.success('Call ended');
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(!isVideoOn);
      }
    } else {
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(!isAudioOn);
      }
    } else {
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          toast.success('Screen sharing stopped');
        };
      } catch (error) {
        toast.error('Unable to share screen');
      }
    } else {
      setIsScreenSharing(false);
      toast.success('Screen sharing stopped');
    }
  };

  const inviteParticipant = (memberId: string) => {
    const member = availableMembers.find(m => m.id === memberId);
    if (member && participants.length < 10) {
      setParticipants([...participants, {
        id: member.id,
        name: member.name,
        isAudioOn: true,
        isVideoOn: true,
        isScreenSharing: false
      }]);
      toast.success(`${member.name} invited to the meeting`);
    } else if (participants.length >= 10) {
      toast.error('Maximum 10 participants allowed');
    }
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        sender: 'You',
        message: messageInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setMessageInput('');
    }
  };

  if (!isInCall) {
    return (
      <div className="h-full overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-6xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Video Conferencing</h1>
            <p className="text-gray-600">Connect with your team through video calls</p>
          </div>

          {/* Quick Start Group Meeting */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  Start Group Meeting
                </h2>
                <p className="text-gray-600 mt-1">Host a meeting with up to 10 participants</p>
              </div>
              <button
                onClick={() => startCall('group')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-2 shadow-lg"
              >
                <Video className="w-5 h-5" />
                Start Meeting
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Up to 10 People</p>
                <p className="text-xs text-gray-500 mt-1">Invite team members</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <Monitor className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Screen Sharing</p>
                <p className="text-xs text-gray-500 mt-1">Share your screen</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <MessageSquare className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Live Chat</p>
                <p className="text-xs text-gray-500 mt-1">Message during calls</p>
              </div>
            </div>
          </div>

          {/* Individual Calls */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Video className="w-6 h-6 text-purple-600" />
              Quick Call
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableMembers.map(member => (
                <div
                  key={member.id}
                  className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold mb-3">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{member.department}</p>
                    <button
                      onClick={() => startCall('individual', member.id)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Video className="w-4 h-4" />
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`h-full ${viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-4'}`}>
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-xl overflow-hidden group">
            {isVideoOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              <span className="text-white text-sm font-medium">You</span>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-2">
              {!isAudioOn && (
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <MicOff className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Participants */}
          {participants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-xl overflow-hidden group">
              {participant.isVideoOn ? (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <span className="text-white text-sm font-medium">{participant.name}</span>
              </div>
              <div className="absolute bottom-4 right-4 flex gap-2">
                {!participant.isAudioOn && (
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <MicOff className="w-4 h-4 text-white" />
                  </div>
                )}
                {participant.isScreenSharing && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
                isVideoOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
                isAudioOn 
                  ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
                isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>
          </div>

          {/* Center - End Call */}
          <button
            onClick={endCall}
            className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center gap-2 transition"
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'speaker' : 'grid')}
              className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-xl flex items-center justify-center transition"
            >
              {viewMode === 'grid' ? <LayoutGrid className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition relative ${
                showParticipants ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {participants.length + 1}
              </span>
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${
                showChat ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center justify-between">
              <span>Participants ({participants.length + 1}/10)</span>
              <button className="text-blue-600 hover:text-blue-700">
                <UserPlus className="w-5 h-5" />
              </button>
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {/* Current User */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">You (Host)</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <div className="flex gap-1">
                  {isAudioOn ? (
                    <Mic className="w-4 h-4 text-green-600" />
                  ) : (
                    <MicOff className="w-4 h-4 text-red-600" />
                  )}
                  {isVideoOn ? (
                    <Video className="w-4 h-4 text-green-600" />
                  ) : (
                    <VideoOff className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Participants */}
            {participants.map((participant) => (
              <div key={participant.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{participant.name}</p>
                  </div>
                  <div className="flex gap-1">
                    {participant.isAudioOn ? (
                      <Mic className="w-4 h-4 text-green-600" />
                    ) : (
                      <MicOff className="w-4 h-4 text-red-600" />
                    )}
                    {participant.isVideoOn ? (
                      <Video className="w-4 h-4 text-green-600" />
                    ) : (
                      <VideoOff className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invite Section */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Quick Invite</p>
            <div className="space-y-2 max-h-40 overflow-auto">
              {availableMembers.filter(m => !participants.find(p => p.id === m.id)).map(member => (
                <button
                  key={member.id}
                  onClick={() => inviteParticipant(member.id)}
                  className="w-full p-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition text-sm flex items-center justify-between"
                >
                  <span className="text-gray-900">{member.name}</span>
                  <UserPlus className="w-4 h-4 text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat Sidebar */}
      {showChat && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Chat</h3>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`${msg.sender === 'You' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-[80%] ${msg.sender === 'You' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'} rounded-lg px-3 py-2`}>
                  <p className="text-xs font-semibold mb-1">{msg.sender}</p>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
