/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Hash, 
  MessageSquare, 
  X, 
  Plus, 
  Pin, 
  Search, 
  Settings, 
  Bell, 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Layout,
  Maximize2,
  Minimize2,
  Clock,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Conversation, 
  ConversationType, 
  Tab, 
  Message
} from './types';
import { 
  MOCK_CHANNELS, 
  MOCK_DMS, 
  INITIAL_MESSAGES 
} from './constants';

const STORAGE_KEY = 'rocket_chat_tabs_v1';

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load tabs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTabs(parsed.tabs);
        setActiveTabId(parsed.activeTabId);
      } catch (e) {
        console.error('Failed to load tabs', e);
      }
    } else {
      // Default tab
      const defaultConv = MOCK_CHANNELS[0];
      const newTab: Tab = {
        id: Math.random().toString(36).substr(2, 9),
        conversationId: defaultConv.id,
        name: defaultConv.name,
        type: defaultConv.type,
        messages: INITIAL_MESSAGES[defaultConv.id as keyof typeof INITIAL_MESSAGES] || [],
        draft: '',
        scrollPosition: 0,
        isPinned: false,
        lastActive: Date.now(),
      };
      setTabs([newTab]);
      setActiveTabId(newTab.id);
    }
  }, []);

  // Save tabs to localStorage
  useEffect(() => {
    if (tabs.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
    }
  }, [tabs, activeTabId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tabs, activeTabId]);

  const openTab = useCallback((conv: Conversation) => {
    setTabs(prev => {
      const existing = prev.find(t => t.conversationId === conv.id);
      if (existing) {
        setActiveTabId(existing.id);
        return prev;
      }
      
      const newTab: Tab = {
        id: Math.random().toString(36).substr(2, 9),
        conversationId: conv.id,
        name: conv.name,
        type: conv.type,
        messages: INITIAL_MESSAGES[conv.id as keyof typeof INITIAL_MESSAGES] || [],
        draft: '',
        scrollPosition: 0,
        isPinned: false,
        lastActive: Date.now(),
      };
      
      setActiveTabId(newTab.id);
      return [...prev, newTab];
    });
  }, []);

  const closeTab = useCallback((tabId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
      }
      return newTabs;
    });
  }, [activeTabId]);

  const togglePin = useCallback((tabId: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, isPinned: !t.isPinned } : t));
  }, []);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim() || !activeTabId) return;
    
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newMessage: Message = {
          id: Date.now().toString(),
          senderId: 'me',
          senderName: 'Me',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: 'https://i.pravatar.cc/150?u=me'
        };
        return { ...t, messages: [...t.messages, newMessage], draft: '' };
      }
      return t;
    }));
  }, [activeTabId]);

  const updateDraft = useCallback((text: string) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, draft: text } : t));
  }, [activeTabId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key >= '1' && e.key <= '9') {
          const index = parseInt(e.key) - 1;
          if (tabs[index]) setActiveTabId(tabs[index].id);
        }
        if (e.key === 'w') {
          if (activeTabId) closeTab(activeTabId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, closeTab]);

  const activeTab = tabs.find(t => t.id === activeTabId);

  const [isNewTabModalOpen, setIsNewTabModalOpen] = useState(false);

  const openNewTabModal = () => setIsNewTabModalOpen(true);
  const closeNewTabModal = () => setIsNewTabModalOpen(false);

  const handleNewTabSelect = (conv: Conversation) => {
    openTab(conv);
    closeNewTabModal();
  };

  return (
    <div className="flex h-screen bg-[#1F2329] text-[#E4E7EA] font-sans overflow-hidden">
      {/* New Tab Modal */}
      <AnimatePresence>
        {isNewTabModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeNewTabModal}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1F2329] w-full max-w-md rounded-xl border border-[#2F343D] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-[#2F343D] flex items-center justify-between">
                <h3 className="font-bold text-lg">Open New Conversation</h3>
                <X className="w-5 h-5 cursor-pointer hover:text-white" onClick={closeNewTabModal} />
              </div>
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EA2A8]" />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search channels or users..."
                    className="w-full bg-[#2F343D] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D74F5]"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-[#9EA2A8] uppercase tracking-wider mb-2">Recent</p>
                    <div className="space-y-1">
                      {[...MOCK_CHANNELS, ...MOCK_DMS].slice(0, 4).map(conv => (
                        <div 
                          key={conv.id}
                          onClick={() => handleNewTabSelect(conv)}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2F343D] cursor-pointer transition-colors"
                        >
                          {conv.type === ConversationType.CHANNEL ? (
                            <div className="w-8 h-8 bg-[#2F343D] rounded flex items-center justify-center">
                              <Hash className="w-4 h-4" />
                            </div>
                          ) : (
                            <img src={conv.avatar} className="w-8 h-8 rounded" referrerPolicy="no-referrer" />
                          )}
                          <span className="text-sm font-medium">{conv.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex flex-col border-r border-[#2F343D] bg-[#1F2329] z-20"
          >
            {/* Sidebar Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#2F343D]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#CB3333] rounded flex items-center justify-center font-bold text-white">R</div>
                <span className="font-semibold text-lg">Rocket.Chat</span>
              </div>
              <Settings className="w-5 h-5 text-[#9EA2A8] cursor-pointer hover:text-white" />
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9EA2A8]" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="w-full bg-[#2F343D] rounded py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#1D74F5]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {/* Channels */}
              <div className="mt-4">
                <div className="px-4 py-1 flex items-center justify-between text-[#9EA2A8] text-xs font-bold uppercase tracking-wider">
                  <span>Channels</span>
                  <Plus className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
                {MOCK_CHANNELS.map(channel => (
                  <div 
                    key={channel.id}
                    onClick={() => openTab(channel)}
                    className={`px-4 py-1.5 flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#2F343D] ${activeTab?.conversationId === channel.id ? 'bg-[#2F343D] text-white' : 'text-[#9EA2A8]'}`}
                  >
                    <Hash className="w-4 h-4" />
                    <span className="text-sm flex-1 truncate">{channel.name}</span>
                    {channel.unreadCount ? (
                      <span className="bg-[#CB3333] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{channel.unreadCount}</span>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Direct Messages */}
              <div className="mt-6">
                <div className="px-4 py-1 flex items-center justify-between text-[#9EA2A8] text-xs font-bold uppercase tracking-wider">
                  <span>Direct Messages</span>
                  <Plus className="w-4 h-4 cursor-pointer hover:text-white" />
                </div>
                {MOCK_DMS.map(dm => (
                  <div 
                    key={dm.id}
                    onClick={() => openTab(dm)}
                    className={`px-4 py-1.5 flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#2F343D] ${activeTab?.conversationId === dm.id ? 'bg-[#2F343D] text-white' : 'text-[#9EA2A8]'}`}
                  >
                    <div className="relative">
                      <img src={dm.avatar} className="w-5 h-5 rounded" referrerPolicy="no-referrer" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-[#1F2329]"></div>
                    </div>
                    <span className="text-sm flex-1 truncate">{dm.name}</span>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="mt-6 px-4">
                <div className="p-3 bg-[#2F343D]/50 rounded-lg border border-[#2F343D]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#9EA2A8] mb-2">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>SUGGESTED</span>
                  </div>
                  <p className="text-[11px] text-[#9EA2A8] mb-2">Based on your activity</p>
                  <div className="flex flex-col gap-1">
                    <button className="text-left text-xs text-[#1D74F5] hover:underline" onClick={() => openTab(MOCK_CHANNELS[3])}>#marketing-sync</button>
                    <button className="text-left text-xs text-[#1D74F5] hover:underline" onClick={() => openTab(MOCK_CHANNELS[2])}>#design-system</button>
                  </div>
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-[#2F343D] flex items-center gap-3">
              <div className="relative">
                <img src="https://i.pravatar.cc/150?u=me" className="w-8 h-8 rounded" referrerPolicy="no-referrer" />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#1F2329]"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Alex Rivera</p>
                <p className="text-xs text-[#9EA2A8] truncate">Online</p>
              </div>
              <Bell className="w-4 h-4 text-[#9EA2A8] cursor-pointer hover:text-white" />
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#1F2329]">
        {/* Tab Bar */}
        <div className="flex items-center bg-[#1F2329] border-b border-[#2F343D] h-10 px-2 gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab, index) => (
            <div 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`
                group relative flex items-center gap-2 px-3 h-8 min-w-[120px] max-w-[200px] rounded-t-md cursor-pointer transition-all
                ${activeTabId === tab.id ? 'bg-[#2F343D] text-white' : 'text-[#9EA2A8] hover:bg-[#2F343D]/50'}
              `}
            >
              {tab.type === ConversationType.CHANNEL ? (
                <Hash className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span className="text-xs font-medium truncate flex-1">{tab.name}</span>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Pin 
                  className={`w-3 h-3 cursor-pointer hover:text-white ${tab.isPinned ? 'text-[#1D74F5] opacity-100' : ''}`} 
                  onClick={(e) => { e.stopPropagation(); togglePin(tab.id); }}
                />
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-white" 
                  onClick={(e) => closeTab(tab.id, e)}
                />
              </div>
              
              {/* Shortcut hint */}
              {index < 9 && activeTabId !== tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] text-[#9EA2A8] opacity-0 group-hover:opacity-100">
                  Ctrl+{index + 1}
                </span>
              )}

              {activeTabId === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1D74F5]"></div>
              )}
            </div>
          ))}
          <button 
            onClick={openNewTabModal}
            className="p-1.5 text-[#9EA2A8] hover:text-white hover:bg-[#2F343D] rounded transition-colors"
            title="New Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <div className="flex-1"></div>

          <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`p-1.5 rounded transition-colors ${isFocusMode ? 'text-[#1D74F5] bg-[#1D74F5]/10' : 'text-[#9EA2A8] hover:text-white hover:bg-[#2F343D]'}`}
            title={isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Chat Window */}
        {activeTab ? (
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* Chat Header */}
            <div className="px-6 py-3 flex items-center justify-between border-b border-[#2F343D] bg-[#1F2329]/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg">{activeTab.name}</h2>
                    <Star className="w-4 h-4 text-[#9EA2A8] cursor-pointer hover:text-yellow-500" />
                  </div>
                  <p className="text-xs text-[#9EA2A8]">
                    {activeTab.type === ConversationType.CHANNEL ? 'Public Channel' : 'Direct Message'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#9EA2A8]">
                <Search className="w-5 h-5 cursor-pointer hover:text-white" />
                <Bell className="w-5 h-5 cursor-pointer hover:text-white" />
                <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {activeTab.messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-[#9EA2A8] space-y-4">
                  <div className="w-16 h-16 bg-[#2F343D] rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">This is the start of your conversation</p>
                    <p className="text-sm">Say hello to get things started!</p>
                  </div>
                </div>
              )}
              {activeTab.messages.map((msg, i) => {
                const isMe = msg.senderId === 'me';
                const showAvatar = i === 0 || activeTab.messages[i-1].senderId !== msg.senderId;
                
                return (
                  <div key={msg.id} className={`flex group ${isMe ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    <div className="w-10 flex-shrink-0">
                      {showAvatar && (
                        <img src={msg.avatar} className="w-10 h-10 rounded" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{msg.senderName}</span>
                          <span className="text-[10px] text-[#9EA2A8]">{msg.timestamp}</span>
                        </div>
                      )}
                      <div className={`
                        px-4 py-2 rounded-2xl text-sm leading-relaxed
                        ${isMe ? 'bg-[#1D74F5] text-white rounded-tr-none' : 'bg-[#2F343D] text-[#E4E7EA] rounded-tl-none'}
                      `}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-6 pt-2">
              <div className="bg-[#2F343D] rounded-xl border border-[#3F444D] focus-within:border-[#1D74F5] transition-colors">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3F444D]/50">
                  <button className="p-1 text-[#9EA2A8] hover:text-white transition-colors"><Smile className="w-5 h-5" /></button>
                  <button className="p-1 text-[#9EA2A8] hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
                  <div className="h-4 w-[1px] bg-[#3F444D] mx-1"></div>
                  <button className="p-1 text-[#9EA2A8] hover:text-white transition-colors font-bold text-xs uppercase">B</button>
                  <button className="p-1 text-[#9EA2A8] hover:text-white transition-colors italic text-xs uppercase">I</button>
                </div>
                <div className="flex items-end p-3 gap-3">
                  <textarea 
                    rows={1}
                    placeholder={`Message ${activeTab.name}`}
                    className="flex-1 bg-transparent border-none focus:outline-none resize-none text-sm py-1.5 custom-scrollbar"
                    value={activeTab.draft}
                    onChange={(e) => updateDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(activeTab.draft);
                      }
                    }}
                  />
                  <button 
                    onClick={() => sendMessage(activeTab.draft)}
                    disabled={!activeTab.draft.trim()}
                    className={`p-2 rounded-lg transition-all ${activeTab.draft.trim() ? 'bg-[#1D74F5] text-white' : 'bg-[#1D74F5]/20 text-[#1D74F5]/50 cursor-not-allowed'}`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-[#9EA2A8]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Draft saved automatically</span>
                </div>
                <div className="flex items-center gap-3">
                  <span><b>Enter</b> to send</span>
                  <span><b>Shift + Enter</b> for new line</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#9EA2A8] space-y-6">
            <div className="relative">
              <div className="w-32 h-32 bg-[#2F343D] rounded-full flex items-center justify-center">
                <Layout className="w-16 h-16 opacity-20" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 border-4 border-[#1D74F5] rounded-full"
              />
            </div>
            <div className="text-center max-w-xs">
              <h3 className="text-xl font-bold text-white mb-2">Welcome to Rocket.Chat</h3>
              <p className="text-sm">Select a conversation from the sidebar or use the search to start a new tab.</p>
            </div>
            <button 
              onClick={() => openTab(MOCK_CHANNELS[0])}
              className="bg-[#1D74F5] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#1D74F5]/90 transition-colors"
            >
              Open General Channel
            </button>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2F343D;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3F444D;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
