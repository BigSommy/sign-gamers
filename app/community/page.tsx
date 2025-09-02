'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ChatRoom from '@/components/chat/ChatRoom';


interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  participant_count: number;
  last_message_at: string | null;
  is_participant: boolean;
}

export default function CommunityHub() {
  const { user, profile, roles } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user]);

  const fetchChatRooms = async () => {
    try {
      // Fetch all chat rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: true });

      if (roomsError) throw roomsError;

      // For each room, get participant count and check if user is participant
      const roomsWithDetails = await Promise.all(
        (rooms || []).map(async (room) => {
          // Get participant count
          const { count: participantCount } = await supabase
            .from('chat_room_participants')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id);

          // Check if user is participant
          const { data: isParticipant } = await supabase
            .from('chat_room_participants')
            .select('id')
            .eq('room_id', room.id)
            .eq('user_id', user?.id)
            .single();

          // Get last message time
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('created_at')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...room,
            participant_count: participantCount || 0,
            last_message_at: lastMessage?.created_at || null,
            is_participant: !!isParticipant
          };
        })
      );

      setChatRooms(roomsWithDetails);
      
      // Auto-select the first room if none selected
      if (roomsWithDetails.length > 0 && !selectedRoom) {
        setSelectedRoom(roomsWithDetails[0]);
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !user) return;

    setIsCreatingRoom(true);
    try {
      const { data: room, error } = await supabase
        .from('chat_rooms')
        .insert({
          name: newRoomName.trim(),
          description: newRoomDescription.trim() || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Join the room as creator
      await supabase.rpc('join_chat_room', { room_uuid: room.id });

      // Reset form and refresh rooms
      setNewRoomName('');
      setNewRoomDescription('');
      setShowCreateRoom(false);
      await fetchChatRooms();
      
      // Select the new room
      setSelectedRoom(room);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen relative z-10 bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Join the Community</h1>
          <p className="text-gray-400 mb-6">Sign in to access the community hub</p>
          <a
            href="/auth/signin"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-7">
      {/* Header */}
      <div className="bg-gray-800 relative z-10 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">Community Hub</h1>
              <p className="text-gray-400">Connect with fellow gamers</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        {/* Mobile selector: show on small screens instead of sidebar */}
        <div className="mb-4 lg:hidden">
          <div className="flex items-center gap-3">
            <select
              value={selectedRoom?.id || ''}
              onChange={(e) => {
                const r = chatRooms.find(c => c.id === e.target.value);
                setSelectedRoom(r || null);
              }}
              className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700"
            >
              {chatRooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
            {(roles.includes('admin') || roles.includes('moderator')) && (
              <button
                onClick={() => setShowCreateRoom(true)}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                title="Create room"
              >
                ✚
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)]">
          {/* Sidebar - Chat Rooms (desktop only) */}
          <div className="hidden lg:block lg:col-span-1 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Chat Rooms</h2>
              {(roles.includes('admin') || roles.includes('moderator')) && (
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  title="Create new chat room"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {chatRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedRoom?.id === room.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{room.name}</div>
                  <div className="text-sm opacity-75">
                    {room.participant_count} participant{room.participant_count !== 1 ? 's' : ''}
                  </div>
                  {room.last_message_at && (
                    <div className="text-xs opacity-60 mt-1">
                      Last: {new Date(room.last_message_at).toLocaleDateString()}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            {selectedRoom ? (
              <ChatRoom roomId={selectedRoom.id} roomName={selectedRoom.name} />
            ) : (
              <div className="h-full bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p className="text-lg">Select a chat room to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Chat Room</h3>
            <form onSubmit={createRoom}>
              <div className="mb-4">
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
                  Room Name
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter room name"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="roomDescription" className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="roomDescription"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter room description"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim() || isCreatingRoom}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {isCreatingRoom ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
