
import React from 'react';
import { AppView, ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onNewChat, 
  currentView, 
  onViewChange 
}) => {
  return (
    <aside className="w-80 h-full border-r border-slate-800 bg-slate-900/50 flex flex-col shrink-0 hidden md:flex">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">G</div>
          <span className="font-bold text-lg tracking-tight">Gemini Pulse</span>
        </div>
      </div>

      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700 text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Conversation
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Recent Chats
        </div>
        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => {
              onSelectSession(session.id);
              onViewChange('chat');
            }}
            className={`w-full text-left p-3 rounded-xl flex flex-col gap-1 transition-all ${
              activeSessionId === session.id && currentView === 'chat'
                ? 'bg-indigo-600/10 border border-indigo-600/30 text-indigo-100'
                : 'hover:bg-slate-800/50 text-slate-400 border border-transparent'
            }`}
          >
            <span className="text-sm font-medium truncate">{session.title}</span>
            <span className="text-xs opacity-50 truncate">{session.lastMessage || 'No messages yet'}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={() => onViewChange('analytics')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'analytics' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <span className="text-sm font-medium">Chat Analytics</span>
        </button>
        <button 
          onClick={() => onViewChange('voice')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${currentView === 'voice' ? 'bg-slate-800 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          <span className="text-sm font-medium">Gemini Live</span>
        </button>
      </div>

      <div className="p-4 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <img src="https://picsum.photos/seed/user123/40/40" className="w-10 h-10 rounded-full border border-slate-700" alt="Avatar" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Senior Engineer</span>
            <span className="text-xs text-green-500">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
