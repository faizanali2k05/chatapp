
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Role, Message, AppView, ChatSession } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Analytics from './components/Analytics';
import LiveVoiceOverlay from './components/LiveVoiceOverlay';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: '1', title: 'General AI Discussion', updatedAt: new Date(), lastMessage: 'Hello! How can I help you today?' },
    { id: '2', title: 'Code Review: React Hooks', updatedAt: new Date(), lastMessage: 'The useEffect cleanup looks solid.' },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>('1');
  const [messages, setMessages] = useState<Record<string, Message[]>>({
    '1': [
      { id: 'm1', role: Role.MODEL, content: 'Hello! I am Gemini Pulse. How can I assist you with your projects today?', timestamp: new Date() }
    ],
    '2': [
      { id: 'm2', role: Role.USER, content: 'Can you look at this code?', timestamp: new Date() },
      { id: 'm3', role: Role.MODEL, content: 'Sure, please paste the snippet here!', timestamp: new Date() }
    ]
  });

  const handleSendMessage = (content: string) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content,
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), newUserMsg]
    }));

    // In a real app, logic to call AI service would be here. 
    // Handled inside ChatArea for easier streaming UI management.
  };

  const createNewSession = () => {
    const id = Date.now().toString();
    const newSession: ChatSession = {
      id,
      title: 'New Conversation',
      updatedAt: new Date(),
    };
    setSessions([newSession, ...sessions]);
    setMessages({ ...messages, [id]: [] });
    setActiveSessionId(id);
    setCurrentView('chat');
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={createNewSession}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className="flex-1 relative flex flex-col h-full overflow-hidden">
        {currentView === 'chat' && (
          <ChatArea 
            activeSessionId={activeSessionId}
            messages={messages[activeSessionId] || []}
            setMessages={(updater) => {
              setMessages(prev => {
                const currentMsgs = prev[activeSessionId] || [];
                const updated = typeof updater === 'function' ? updater(currentMsgs) : updater;
                return { ...prev, [activeSessionId]: updated };
              });
            }}
          />
        )}
        
        {currentView === 'analytics' && <Analytics />}

        {currentView === 'voice' && (
          <LiveVoiceOverlay onClose={() => setCurrentView('chat')} />
        )}

        {/* Global Action Floating Buttons (Mobile optimized) */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 md:hidden">
          <button 
            onClick={() => setCurrentView('voice')}
            className="w-14 h-14 rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/50 flex items-center justify-center hover:bg-indigo-500 transition-all"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
