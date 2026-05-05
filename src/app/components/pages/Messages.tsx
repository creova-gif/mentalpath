import { useState, useRef, useEffect } from 'react';
import { Search, Lock, Send, ArrowLeft } from 'lucide-react';

type Message = { from: 'client' | 'therapist'; text: string; time: string };

const clients = [
  { id: 1, initials: 'AM', name: 'Amara Mensah', preview: 'Thank you for today\'s session...', time: '2:45 PM', unread: 0, color: 'bg-[#d4e8e4] text-[var(--sage-deep)]' },
  { id: 2, initials: 'JL', name: 'Jamal Lee', preview: 'Can we reschedule next week?', time: '11:20 AM', unread: 2, color: 'bg-[#dde8f5] text-[#0C447C]' },
  { id: 3, initials: 'SM', name: 'Sadia Mohamoud', preview: 'The breathing exercises are...', time: 'Yesterday', unread: 0, color: 'bg-[#faeeda] text-[#633806]' },
  { id: 4, initials: 'PC', name: 'Priya & Chetan Choudhary', preview: 'Both of us would like to...', time: 'Mar 12', unread: 1, color: 'bg-[#EEEDFE] text-[#26215C]' },
  { id: 5, initials: 'RB', name: 'Riya Bhatt', preview: 'I wanted to follow up on...', time: 'Mar 10', unread: 0, color: 'bg-[#d4e8e4] text-[var(--sage-deep)]' },
];

const INITIAL_MESSAGES: Record<number, Message[]> = {
  2: [
    { from: 'client', text: 'Hi Dr. Osei, can we reschedule next week\'s session? I have a work conflict on Thursday.', time: '11:20 AM' },
    { from: 'therapist', text: 'Of course! What day works better for you? I have openings on Tuesday at 2pm or Friday at 10:30am.', time: '11:23 AM' },
    { from: 'client', text: 'Friday at 10:30 would be perfect. Thank you!', time: '11:25 AM' },
    { from: 'therapist', text: 'Great! I\'ve updated your appointment. You\'ll receive a calendar invite shortly. See you Friday!', time: '11:27 AM' },
  ],
  1: [
    { from: 'client', text: 'Thank you for today\'s session. I really appreciated the grounding exercise.', time: '2:45 PM' },
    { from: 'therapist', text: 'So glad it was helpful! Remember to practice the box breathing before bed tonight. See you next week!', time: '2:47 PM' },
  ],
  3: [
    { from: 'client', text: 'The breathing exercises are really helping with my anxiety.', time: 'Yesterday 3:12 PM' },
    { from: 'therapist', text: 'That\'s wonderful progress, Sadia! Keep up the daily practice.', time: 'Yesterday 3:15 PM' },
  ],
};

function nowTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function Messages() {
  const [selectedClient, setSelectedClient] = useState(clients[1]);
  const [messageText, setMessageText] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [threadMap, setThreadMap] = useState<Record<number, Message[]>>(INITIAL_MESSAGES);
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentMessages = threadMap[selectedClient.id] ?? [];

  // Scroll to bottom whenever the active thread changes or a new message is added
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, selectedClient.id]);

  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;
    const newMsg: Message = { from: 'therapist', text, time: nowTime() };
    setThreadMap(prev => ({
      ...prev,
      [selectedClient.id]: [...(prev[selectedClient.id] ?? []), newMsg],
    }));
    setMessageText('');
  };

  const selectClient = (client: typeof clients[0]) => {
    setSelectedClient(client);
    setMobileView('chat');
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 150px)' }}>
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] h-full">
        {/* Client List Sidebar */}
        <div className={`border-r border-[var(--border)] flex flex-col ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
          <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center justify-between">
            <div className="text-sm font-medium text-[var(--ink)]">Messages</div>
            <div className="text-xs text-[var(--sage)]">3 unread</div>
          </div>

          <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center gap-2 bg-[var(--warm)]">
            <Search className="w-3.5 h-3.5 text-[var(--ink-muted)]" />
            <input
              type="text"
              placeholder="Search clients..."
              className="border-none bg-transparent text-[13px] text-[var(--ink)] outline-none flex-1 placeholder:text-[var(--ink-muted)]"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {clients.map((client) => (
              <div
                key={client.id}
                onClick={() => selectClient(client)}
                className={`flex items-center gap-2.5 px-3.5 py-3 cursor-pointer border-b border-[var(--border)] transition-colors ${
                  selectedClient.id === client.id ? 'bg-[var(--sage-pale)]' : 'hover:bg-[var(--warm)]'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${client.color}`}>
                  {client.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--ink)]">{client.name}</div>
                  <div className="text-xs text-[var(--ink-muted)] overflow-hidden whitespace-nowrap text-ellipsis">
                    {client.preview}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[11px] text-[var(--ink-muted)]">{client.time}</div>
                  {client.unread > 0 && (
                    <span className="inline-block bg-[var(--sage)] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1">
                      {client.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Area */}
        <div className={`flex flex-col ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {/* Chat Header */}
          <div className="px-4 py-3.5 border-b border-[var(--border)] flex items-center gap-3">
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden p-1 -ml-1 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${selectedClient.color}`}>
              {selectedClient.initials}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--ink)]">{selectedClient.name}</div>
              <div className="text-xs text-[var(--sage)]">Active client</div>
            </div>
          </div>

          {/* PHIPA Notice */}
          <div className="bg-[var(--sage-pale)] px-5 py-1.5 flex items-center gap-1.5 text-[11px] text-[var(--sage-deep)]">
            <Lock className="w-2.75 h-2.75" />
            End-to-end encrypted · PHIPA compliant · Messages auto-delete after 90 days
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-3.5">
            {currentMessages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-[13px] text-[var(--ink-muted)]">
                No messages yet. Start the conversation.
              </div>
            )}
            {currentMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[70%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                  msg.from === 'therapist'
                    ? 'bg-[var(--sage)] text-white self-end rounded-br-sm'
                    : 'bg-[var(--warm)] text-[var(--ink)] self-start rounded-bl-sm'
                }`}
              >
                {msg.text}
                <div className={`text-[11px] opacity-65 mt-1 ${msg.from === 'therapist' ? 'text-white' : 'text-[var(--ink)]'}`}>
                  {msg.time}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div className="px-5 py-3.5 border-t border-[var(--border)] flex gap-2.5 items-end">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-white text-[var(--ink)] text-sm outline-none resize-none h-11 leading-normal transition-colors focus:border-[var(--sage)]"
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              className="px-4 py-2.5 rounded-lg bg-[var(--sage)] text-white border-none cursor-pointer text-[13px] font-medium transition-colors hover:bg-[var(--sage-deep)] flex-shrink-0 h-11 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
