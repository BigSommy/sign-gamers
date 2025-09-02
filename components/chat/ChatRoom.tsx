'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
}

export default function ChatRoom({ roomId, roomName }: ChatRoomProps) {
  const { user, profile, isAdmin, isModerator } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [profiles, setProfiles] = useState<Record<string, { username?: string; profile_picture_url?: string }>>({});
  const [participants, setParticipants] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const [newMessage, setNewMessage] = useState('');
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const pointerState = useRef<{ startX: number; startY: number; id?: number | null }>({ startX: 0, startY: 0, id: null });

  useEffect(() => {
    fetchMessages();
    joinRoom();
    fetchParticipants();
  }, [roomId, user]);

  // Realtime subscription to new messages and message updates/deletes
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase.channel(`room:${roomId}`)
      // messages
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => {
            // If the real message id already exists, ignore
            if (prev.some((m) => m.id === payload.new.id)) return prev;

            // Look for an optimistic temp message we created with same user & text
            const tempIndex = prev.findIndex(m => m.pending && m.user_id === payload.new.user_id && m.message === payload.new.message);
            if (tempIndex >= 0) {
              const copy = [...prev];
              copy[tempIndex] = payload.new;
              return copy;
            }

            return [...prev, payload.new];
          });

          // ensure we have the sender profile cached
          if (payload.new?.user_id) {
            loadProfilesForUserIds([payload.new.user_id]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? payload.new : m)));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
        }
      )
      // participants
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_room_participants', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setParticipants((prev) => [...prev, payload.new]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_room_participants', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setParticipants((prev) => prev.filter((p) => p.user_id !== payload.old.user_id));
        }
      )
      // typing
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_typing', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setTypingUsers((prev) => ({ ...prev, [payload.new.user_id]: Date.now() }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'chat_typing', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setTypingUsers((prev) => ({ ...prev, [payload.new.user_id]: Date.now() }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_typing', filter: `room_id=eq.${roomId}` },
        (payload) => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[payload.old.user_id];
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // fallback for older clients
        // @ts-ignore
        channel.unsubscribe && channel.unsubscribe();
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // close menus when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (!el.closest || !el.closest('.chat-menu')) {
        setOpenMenuFor(null);
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
      // load profiles for message senders
      const ids = Array.from(new Set((data || []).map((m: any) => m.user_id).filter(Boolean)));
      if (ids.length) await loadProfilesForUserIds(ids);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfilesForUserIds = async (ids: string[]) => {
    const missing = ids.filter(id => id && !profiles[id]);
    if (!missing.length) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, profile_picture_url')
        .in('user_id', missing);
      if (error) throw error;
      const map: Record<string, any> = {};
      (data || []).forEach((p: any) => {
        map[p.user_id] = { username: p.username, profile_picture_url: p.profile_picture_url };
      });
      setProfiles(prev => ({ ...prev, ...map }));
    } catch (e) {
      console.error('Error loading profiles for chat messages', e);
    }
  };

  const joinRoom = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('join_chat_room', { room_uuid: roomId });
      if (error) {
        console.error('Error joining room:', error);
        // If the function doesn't exist, manually insert into participants
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          await supabase.from('chat_room_participants').insert({
            room_id: roomId,
            user_id: user.id
          });
        }
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
        const payload: any = {
          room_id: roomId,
          user_id: user.id,
          message: newMessage.trim(),
          message_type: 'text',
        };
        if (replyTo && replyTo.id) payload.reply_to = replyTo.id;

        const { data: inserted, error } = await supabase.from('chat_messages').insert(payload).select().single();

        if (error) throw error;

        // If we received the inserted row, append immediately (optimistic)
        if (inserted) {
          setMessages(prev => {
            if (prev.some(m => m.id === inserted.id)) return prev;
            return [...prev, inserted];
          });
    } else {
          // Add a temporary optimistic message while waiting for realtime insert
          const temp = {
            id: `temp-${Date.now()}`,
            user_id: user.id,
      message: newMessage.trim(),
            message_type: 'text',
      reply_to: replyTo?.id || null,
            created_at: new Date().toISOString(),
            pending: true,
          };
          setMessages(prev => [...prev, temp]);
          // ensure profile is loaded for the user
          loadProfilesForUserIds([user.id]);
        }
    setNewMessage('');
    setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
      const e:any = error;
      // If PostgREST returns that the column doesn't exist, retry without reply_to
      const missingReplyTo = e?.message?.includes("Could not find the 'reply_to' column") || e?.code === 'PGRST204' || (typeof e?.message === 'string' && e.message.toLowerCase().includes('reply_to'));
      if (missingReplyTo) {
        try {
          const payload2: any = {
            room_id: roomId,
            user_id: user.id,
            message: newMessage.trim(),
            message_type: 'text',
          };
          const { data: inserted2, error: error2 } = await supabase.from('chat_messages').insert(payload2).select().single();
          if (error2) throw error2;
          if (inserted2) {
            setMessages(prev => {
              if (prev.some(m => m.id === inserted2.id)) return prev;
              return [...prev, inserted2];
            });
          } else {
            const temp = {
              id: `temp-${Date.now()}`,
              user_id: user.id,
              message: newMessage.trim(),
              message_type: 'text',
              created_at: new Date().toISOString(),
              pending: true,
            };
            setMessages(prev => [...prev, temp]);
            loadProfilesForUserIds([user.id]);
          }
          setNewMessage('');
          setReplyTo(null);
          // Inform the user that reply linking is unavailable because the DB lacks the column
          alert('Message sent but reply threading is not supported by the server schema (missing reply_to column).');
          return;
        } catch (err2) {
          console.error('Retry without reply_to failed:', err2);
        }
      }

      // Fallback: optimistic temp message so user still sees their text locally
      const temp = {
        id: `temp-${Date.now()}`,
        user_id: user.id,
        message: newMessage.trim(),
        message_type: 'text',
        reply_to: replyTo?.id || null,
        created_at: new Date().toISOString(),
        pending: true,
      };
      setMessages(prev => [...prev, temp]);
      loadProfilesForUserIds([user.id]);
    }
  };

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_room_participants')
        .select('user_id, joined_at')
        .eq('room_id', roomId);
      if (error) throw error;
      setParticipants(data || []);
    } catch (e) {
      console.error('Error fetching participants', e);
    }
  };

  const startTypingHeartbeat = () => {
    if (!user) return;
    (async () => {
      try {
        await supabase
          .from('chat_typing')
          .upsert({ room_id: roomId, user_id: user.id, last_typing_at: new Date().toISOString() }, { onConflict: 'room_id,user_id' });
      } catch (e) {
        console.error('Error upserting typing', e);
      }
    })();
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      (async () => {
        try {
          await supabase.from('chat_typing').delete().match({ room_id: roomId, user_id: user.id });
        } catch (e) {
          console.error('Error deleting typing', e);
        }
      })();
    }, 3000);
  };

  const loadOlderMessages = async () => {
    if (!messages.length) return;
    try {
      const oldest = messages[0].created_at;
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .lt('created_at', oldest)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      if (data && data.length) {
        setMessages((prev) => [...data.reverse(), ...prev]);
      }
    } catch (e) {
      console.error('Error loading older messages', e);
    }
  };

  const editMessage = async (id: string, newText: string) => {
    const backup = messages;
    // Optimistic update: set both legacy `edited` and canonical `is_edited` for compatibility
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, message: newText, edited: true, is_edited: true, edited_at: new Date().toISOString() } : m)));
    try {
      // Use correct schema fields: is_edited (boolean) and edited_at (timestamp)
      const { error } = await supabase
        .from('chat_messages')
        .update({ message: newText, is_edited: true, edited_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      // refresh authoritative message list after successful edit
      await fetchMessages();
    } catch (e: any) {
      console.error('Error editing message', e);
      alert('Failed to edit message: ' + (e?.message || e));
      setMessages(backup);
      // attempt to refresh to get current server state
      await fetchMessages();
    }
  };

  const deleteMessage = async (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    const isMine = user && msg.user_id === user.id;
    const canModerate = (isAdmin && isAdmin()) || (isModerator && isModerator());
    if (!isMine && !canModerate) {
      alert('You do not have permission to delete this message.');
      return;
    }
    const backup = messages;
    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      const { error } = await supabase.from('chat_messages').delete().eq('id', id);
      if (error) throw error;
      // refresh authoritative list
      await fetchMessages();
    } catch (e: any) {
      console.error('Error deleting message', e);
      alert('Failed to delete message: ' + (e?.message || e));
      setMessages(backup);
      await fetchMessages();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
  <div className="flex flex-col h-full bg-gray-900 rounded-lg pb-20 md:pb-0">
      <div className="p-4 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <h3 className="text-lg font-semibold text-white">{roomName}</h3>
        <p className="text-sm text-gray-400">Live Chat • {participants.length} online</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-xs text-gray-400 mb-2">
          {Object.keys(typingUsers).length > 0 && (
            <span>
              {Object.keys(typingUsers).length} user{Object.keys(typingUsers).length > 1 ? 's' : ''} typing...
            </span>
          )}
        </div>
        {messages.map((message) => {
          const prof = message.user_id ? profiles[message.user_id] : null;
          const username = prof?.username || (message.user_id ? `User-${String(message.user_id).slice(0,6)}` : 'Unknown');
          const avatar = prof?.profile_picture_url || '/favicon.ico';
          const isMine = user && message.user_id === user.id;
          const canModerateDelete = isAdmin && isAdmin();
          const canModeratorDelete = isModerator && isModerator();
          const showDelete = isMine || canModerateDelete || canModeratorDelete;

          const renderMessageParts = (text: string) => {
            const nodes: React.ReactNode[] = [];
            let lastIndex = 0;
            const mentionRegex = /@([a-zA-Z0-9_]+)/g;
            let match;
            while ((match = mentionRegex.exec(text)) !== null) {
              const idx = match.index;
              if (idx > lastIndex) {
                nodes.push(text.substring(lastIndex, idx));
              }
              const mention = match[0];
              nodes.push(
                <span key={`${message.id}-${idx}`} className="text-yellow-300 font-semibold">{mention}</span>
              );
              lastIndex = idx + mention.length;
            }
            if (lastIndex < text.length) {
              nodes.push(text.substring(lastIndex));
            }
            return nodes;
          };

          const currentUsername = (typeof profile !== 'undefined' && profile?.username) || (user?.id ? profiles[user.id]?.username : undefined);
          const mentionsCurrentUser = currentUsername && message.message?.includes(`@${currentUsername}`);
          const timeText = message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
          return (
            <div
              key={message.id}
              className={`flex items-start ${isMine ? 'flex-row-reverse' : 'flex-row'} ${mentionsCurrentUser ? 'ring-1 ring-yellow-400/30 rounded-lg p-1' : ''}`}
              onPointerDown={(e) => {
                pointerState.current.startX = (e as any).clientX;
                pointerState.current.startY = (e as any).clientY;
                pointerState.current.id = (e as any).pointerId;
              }}
              onPointerUp={(e) => {
                try {
                  const dx = (e as any).clientX - pointerState.current.startX;
                  const dy = Math.abs((e as any).clientY - pointerState.current.startY);
                  if (Math.abs(dx) > 60 && dy < 50) {
                    setReplyTo(message);
                  }
                } finally {
                  pointerState.current.id = null;
                }
              }}
            >
              {/* avatar + content grouped so username sits next to the pfp and bubble aligns */}
              <Link href={`/profile/${message.user_id}`}> 
                <img src={avatar} alt={username} className="w-8 h-8 rounded-full bg-gray-600 object-cover" />
              </Link>

              <div className={`flex flex-col ${isMine ? 'mr-2 items-end' : 'ml-2 items-start'} max-w-[70%]`}> 
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-white">{username}</div>
                  {(message.is_edited || message.edited) && (
                    <div className="text-xs text-gray-400"> • edited</div>
                  )}
                </div>

                {/* If this message is a reply, try to render a small quoted preview */}
                {message.reply_to && (() => {
                  const ref = messages.find(m => m.id === message.reply_to);
                  if (ref) {
                    const p = profiles[ref.user_id];
                    return (
                      <div className="mb-1 p-2 rounded border-l-2 border-yellow-500 bg-gray-800 text-xs text-gray-300">
                        <div className="font-semibold">{p?.username || `User-${String(ref.user_id).slice(0,6)}`}</div>
                        <div className="truncate max-w-[60%]">{ref.message}</div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {message.message?.startsWith('http') && (message.message.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                  <div className={`inline-block rounded-lg mt-1 ${isMine ? 'bg-orange-600' : 'bg-gray-700'} p-1`}> 
                    <img src={message.message} alt="uploaded" className="max-w-full rounded-md" />
                  </div>
                ) : (
                  <div className={`${isMine ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-200'} px-4 py-2 rounded-lg mt-1 inline-block break-words`}>
                    <p className="text-sm">{renderMessageParts(message.message)}</p>
                  </div>
                )}

                <div className="mt-1 text-xs text-gray-400">{timeText}</div>
              </div>

              {/* 3-dot menu placed outside the header so name and avatar stay close */}
              <div className="ml-2 relative">
                <button onClick={(e) => { e.stopPropagation(); setOpenMenuFor(openMenuFor === message.id ? null : message.id); }} className="text-gray-400 hover:text-white">⋯</button>
                {openMenuFor === message.id && (
                  <div className="chat-menu absolute right-0 mt-2 w-36 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
                    <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); setReplyTo(message); setOpenMenuFor(null); }}>Reply</button>
                    {message.user_id === user?.id && (
                      <button className="w-full text-left px-3 py-2 hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); const newText = prompt('Edit message', message.message); if (newText !== null) editMessage(message.id, newText); setOpenMenuFor(null); }}>Edit</button>
                    )}
                    {(message.user_id === user?.id || (isAdmin && isAdmin()) || (isModerator && isModerator())) && (
                      <button className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); if (confirm('Delete this message?')) deleteMessage(message.id); setOpenMenuFor(null); }}>Delete</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-lg">
        {replyTo && (
          <div className="mb-2 p-2 bg-gray-700 rounded-lg text-sm text-gray-200 flex items-start justify-between">
            <div>
              Replying to <span className="font-semibold">{profiles[replyTo.user_id]?.username || `User-${String(replyTo.user_id).slice(0,6)}`}</span>
              <div className="text-xs text-gray-300 mt-1 truncate max-w-[60vw]">{replyTo.message}</div>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="file"
            accept="image/*"
            id="chat-image-upload"
            className="hidden"
            onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !user) return;
            if (file.size > 5 * 1024 * 1024) {
              alert('Image too large (max 5MB)');
              return;
            }
            setUploading(true);
            try {
              const path = `${roomId}/${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
              const bucket = 'media';
              const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: false });
              if (uploadError) {
                console.error('Upload error', uploadError);
                alert('Upload failed. Make sure bucket "media" exists and is accessible.');
                return; // finally will still run and reset uploading
              }
              const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
              const imageUrl = urlData.publicUrl;
              // Optimistically show the image message
              const temp = {
                id: `temp-${Date.now()}`,
                user_id: user.id,
                room_id: roomId,
                message: imageUrl,
                message_type: 'text',
                created_at: new Date().toISOString(),
                pending: true,
              };
              setMessages(prev => [...prev, temp]);
              loadProfilesForUserIds([user.id]);
              // Insert to DB and replace temp with real row when received
              const { data: inserted, error: insertErr } = await supabase
                .from('chat_messages')
                .insert({ room_id: roomId, user_id: user.id, message: imageUrl, message_type: 'text' })
                .select()
                .single();
              if (inserted) {
                setMessages(prev => prev.map(m => (m.id === temp.id ? inserted : m)));
              }
              if (insertErr) {
                console.error('Insert chat image message error', insertErr);
                alert('Failed to post image message: ' + (insertErr.message || insertErr));
                // rollback optimistic temp
                setMessages(prev => prev.filter(m => m.id !== temp.id));
              }
            } catch (err) {
              console.error('Error uploading image', err);
            } finally {
              setUploading(false);
              (document.getElementById('chat-image-upload') as HTMLInputElement).value = '';
            }
          }}
        />

          <button type="button" onClick={() => (document.getElementById('chat-image-upload') as HTMLInputElement).click()} className="px-3 py-2 bg-gray-700 rounded-lg text-sm text-white hover:bg-gray-600">
            {uploading ? 'Uploading...' : '📷'}
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              startTypingHeartbeat();
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
