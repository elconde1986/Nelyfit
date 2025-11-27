'use client';

import { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { sendMessage, getMessages } from './actions';
import { Lang } from '@/lib/i18n';

export default function ChatClient({ clientId, coachId, lang }: { clientId: string; coachId: string; lang: Lang }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = await getMessages(clientId, coachId);
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // Refresh messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [clientId, coachId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await sendMessage(clientId, coachId, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col animate-fade-in">
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold">Your Coach</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading && messages.length === 0 ? (
            <p className="text-center text-slate-400">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-slate-400">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'CLIENT' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-xl px-4 py-2 ${
                    msg.sender === 'CLIENT'
                      ? 'bg-teal-500 text-slate-950'
                      : 'bg-slate-800 text-slate-50'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !newMessage.trim()} variant="secondary">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

