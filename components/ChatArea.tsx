
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import { streamChat } from '../services/gemini';

interface ChatAreaProps {
  activeSessionId: string;
  messages: Message[];
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ activeSessionId, messages, setMessages }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const aiMsgId = (Date.now() + 1).toString();
      const initialAiMsg: Message = {
        id: aiMsgId,
        role: Role.MODEL,
        content: '',
        timestamp: new Date(),
        isStreaming: true
      };

      setMessages(prev => [...prev, initialAiMsg]);

      let fullContent = '';
      const stream = streamChat(messages, userText);

      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => 
          prev.map(m => m.id === aiMsgId ? { ...m, content: fullContent } : m)
        );
      }

      setMessages(prev => 
        prev.map(m => m.id === aiMsgId ? { ...m, isStreaming: false } : m)
      );
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.MODEL,
        content: "Error: I encountered an issue processing that. Check your API key or connection.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <h2 className="font-semibold text-slate-100 uppercase text-xs tracking-widest">Active Pulse Engine</h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-slate-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
          </button>
        </div>
      </header>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth bg-gradient-to-b from-slate-950 to-slate-900"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-30 select-none">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-500 mb-4 animate-spin-slow"></div>
            <p className="text-lg font-medium">Start a new conversation</p>
          </div>
        )}
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === Role.USER ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === Role.USER ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${
                msg.role === Role.USER ? 'bg-slate-700' : 'bg-indigo-600'
              }`}>
                {msg.role === Role.USER ? 'U' : 'G'}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm ${
                msg.role === Role.USER 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                  {msg.isStreaming && (
                    <span className="inline-block w-1 h-4 ml-1 bg-indigo-400 animate-pulse"></span>
                  )}
                </div>
                <div className={`text-[10px] mt-2 opacity-40 ${msg.role === Role.USER ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isTyping && !messages[messages.length-1]?.isStreaming && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-slate-800 p-3 rounded-2xl flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-slate-900/50 border-t border-slate-800 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto relative group">
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message to Gemini..."
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-500 rounded-2xl py-4 pl-6 pr-24 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all focus:bg-slate-700/50 shadow-lg"
          />
          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            </button>
            <button 
              onClick={handleSend}
              disabled={isTyping || !inputValue.trim()}
              className={`p-3 rounded-xl transition-all ${
                !inputValue.trim() || isTyping 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 shadow-lg shadow-indigo-600/20'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-center text-slate-600 mt-3 font-medium uppercase tracking-widest">
          Powered by Gemini 3 Flash • End-to-end encrypted
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
