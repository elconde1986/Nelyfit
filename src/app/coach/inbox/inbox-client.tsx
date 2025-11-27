'use client';

import { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { sendMessage, getMessages } from './actions';
import { Lang } from '@/lib/i18n';

type Client = {
  id: string;
  name: string;
  email: string | null;
  unreadCount: number;
  messages: Array<{
    id: string;
    content: string;
    sender: 'COACH' | 'CLIENT';
    createdAt: Date;
  }>;
};

export default function InboxClient({ clients, coachId, lang }: { clients: Client[]; coachId: string; lang: Lang }) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadMessages = async (clientId: string) => {
    if (!clientId) return;
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

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    loadMessages(client.id);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient) return;

    setLoading(true);
    try {
      await sendMessage(selectedClient.id, coachId, newMessage);
      setNewMessage('');
      await loadMessages(selectedClient.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedClient && messages.length === 0 && !loading) {
    loadMessages(selectedClient.id);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
      {/* Client List */}
      <div className="lg:col-span-1 space-y-2">
        <Card>
          <CardContent className="p-0">
            {clients.length === 0 ? (
              <p className="p-4 text-sm text-slate-400 text-center">No clients yet</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleClientSelect(client)}
                    className={`w-full p-4 text-left hover:bg-slate-900/40 transition-colors ${
                      selectedClient?.id === client.id ? 'bg-slate-900/60' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{client.name}</p>
                          {client.messages[0] && (
                            <p className="text-xs text-slate-400 truncate">
                              {client.messages[0].content.substring(0, 30)}...
                            </p>
                          )}
                        </div>
                      </div>
                      {client.unreadCount > 0 && (
                        <Badge variant="success" className="shrink-0">
                          {client.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        {selectedClient ? (
          <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedClient.name}</p>
                    <p className="text-xs text-slate-400">{selectedClient.email}</p>
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
                      className={`flex ${msg.sender === 'COACH' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-xl px-4 py-2 ${
                          msg.sender === 'COACH'
                            ? 'bg-emerald-500 text-slate-950'
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
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Select a client to start messaging</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

