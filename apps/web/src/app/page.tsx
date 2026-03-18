"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Clock, MessageSquare, ChevronDown, Terminal, Send, Cpu, Moon, Sun, BrainCircuit } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiOllama } from "react-icons/si";
import { BsLightningChargeFill, BsCloudFill } from "react-icons/bs";
import "./page.css";

type Mode = "ask" | "plan" | "agent";
type Theme = "dark" | "light";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStream?: boolean;
  isThinking?: boolean;
}

// Enable TypeScript for Electron Context Bridge
declare global {
  interface Window {
    coreAPI?: {
      executeCLI: (command: string, prompt: string, modelStr: string) => Promise<{ stdout?: string; error?: string; stderr?: string }>;
      triggerCLIStream: (id: string, command: string, prompt: string, modelStr: string) => void;
      onCLIStreamData: (callback: (data: { id: string; chunk: string }) => void) => void;
      onCLIStreamDone: (callback: (data: { id: string; code: number }) => void) => void;
    };
  }
}

const PROVIDERS = [
  { id: "gemini", name: "Google Gemini", icon: FcGoogle },
  { id: "ollama", name: "Ollama", icon: SiOllama },
  { id: "together", name: "Together AI", icon: BsCloudFill },
  { id: "deepseek", name: "DeepSeek AI", icon: Cpu },
  { id: "zai", name: "Z.ai", icon: BsLightningChargeFill },
  { id: "gemini-cli", name: "Gemini CLI", icon: Terminal },
  { id: "codex-cli", name: "Codex CLI", icon: Terminal }
];

const DEFAULT_MODELS: Record<string, { id: string; name: string }[]> = {
  "gemini": [
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash Preview" },
    { id: "gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash-Lite Preview" }
  ],
  "ollama": [{ id: "loading", name: "Fetching Local Models..." }],
  "together": [{ id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B" }],
  "deepseek": [{ id: "deepseek-coder", name: "DeepSeek Coder" }],
  "zai": [{ id: "free", name: "Free Tier" }],
  "gemini-cli": [
    { id: "gemini-3-flash", name: "Gemini 3 Flash" },
    { id: "gemini-3-pro", name: "Gemini 3 Pro" },
    { id: "gemini-3-flash-preview", name: "Gemini 3 Flash Preview" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" }
  ],
  "codex-cli": [{ id: "native", name: "Native Codex" }]
};

export default function Home() {
  const [activeMode, setActiveMode] = useState<Mode>("ask");
  const [theme, setTheme] = useState<Theme>("dark");
  
  const [provider, setProvider] = useState("gemini");
  const [model, setModel] = useState("gemini-3-flash-preview");
  
  const [isProviderOpen, setIsProviderOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);

  const [inputMessage, setInputMessage] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [dynamicModels, setDynamicModels] = useState<Record<string, { id: string; name: string }[]>>(DEFAULT_MODELS);

  // Apply Theme
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
  }, [theme]);

  // IPC Stream listeners and Ollama Fetch
  useEffect(() => {
    // 1. Fetch live Ollama Models
    async function fetchOllama() {
      try {
        const res = await fetch("http://localhost:11434/api/tags");
        if (res.ok) {
          const data = await res.json();
          if (data?.models?.length > 0) {
            setDynamicModels(prev => ({
              ...prev,
              "ollama": data.models.map((m: any) => ({ id: m.name, name: m.name }))
            }));
            return;
          }
        }
      } catch (e) {
        // Silently fail if Ollama is not running locally
      }
      setDynamicModels(prev => ({
        ...prev,
        "ollama": [{ id: "llama3", name: "Llama 3 (Fallback)" }]
      }));
    }
    fetchOllama();

    // 2. Setup Electron IPC Stream listeners
    if (typeof window !== 'undefined' && window.coreAPI?.onCLIStreamData) {
      window.coreAPI.onCLIStreamData((payload) => {
        setHistory(prev => {
          const newHistory = [...prev];
          const streamIdx = newHistory.findIndex(h => h.id === payload.id);
          
          if (streamIdx !== -1) {
            // Check for Reasoning block <think> tag inside raw stream chunk
            let rawChunk = payload.chunk;
            let currentThinking = newHistory[streamIdx].isThinking;

            if (rawChunk.includes("<think>")) currentThinking = true;
            if (rawChunk.includes("</think>")) {
              currentThinking = false;
              // Optionally strip the tag from display UI
              rawChunk = rawChunk.replace(/<\/?think>/g, '');
            }

            newHistory[streamIdx] = {
              ...newHistory[streamIdx],
              content: newHistory[streamIdx].content + rawChunk,
              isThinking: currentThinking
            };
          }
          return newHistory;
        });
      });

      window.coreAPI.onCLIStreamDone((payload) => {
        setHistory(prev => prev.map(msg => 
          msg.id === payload.id ? { ...msg, isStream: false, isThinking: false } : msg
        ));
      });
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Handle provider switch to update default model
  const handleProviderSelect = (pid: string) => {
    setProvider(pid);
    setModel(dynamicModels[pid][0].id);
    setIsProviderOpen(false);
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage
    };
    
    setHistory(prev => [...prev, userMsg]);
    setInputMessage("");

    // ACTUAL CLI NATIVE STREAMING
    if (provider.endsWith('-cli')) {
      const cliCommand = provider === 'gemini-cli' ? 'gemini' : 'codex';
      const streamId = (Date.now() + 1).toString();

      if (typeof window !== 'undefined' && window.coreAPI && window.coreAPI.triggerCLIStream) {
        // Create an empty assistant message slot to stream into
        setHistory(prev => [...prev, {
          id: streamId,
          role: "assistant",
          content: "",
          isStream: true,
          isThinking: true // Show thinking state immediately upon CLI execution delay
        }]);

        window.coreAPI.triggerCLIStream(streamId, cliCommand, userMsg.content, model);
      } else {
        // Fallback for Web Browser Debugging
        setHistory(prev => [...prev, {
          id: streamId,
          role: "assistant",
          content: `[DESKTOP REQUIRED] To execute Native Streaming CLI (${cliCommand} "${userMsg.content}" --model ${model}), please launch the CORECODE Electron app.`
        }]);
      }
      return;
    }

    // INTERNAL API ROUTE INTEGRATION
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          message: userMsg.content,
          mode: activeMode
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      setHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response
      }]);
    } catch (e: unknown) {
      setHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Connection Error: ${e instanceof Error ? e.message : String(e)}`
      }]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeProviderObj = PROVIDERS.find(p => p.id === provider);
  const activeModelObj = dynamicModels[provider]?.find(m => m.id === model);

  return (
    <div className="layout-wrapper">
      
      {/* LEFT SIDEBAR */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className={`brand-orb mode-${activeMode} animate-glow`}></div>
          <span className="brand-text code">CORECODE</span>
        </div>
        
        <div className="sidebar-section">
          <h3 className="section-title">Session History</h3>
          <div className="history-list">
            <button className="history-item active">
              <Clock size={16} />
              <span>Current Session</span>
            </button>
            {history.length > 0 && (
              <button className="history-item" onClick={() => setHistory([])}>
                <MessageSquare size={16} />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-section mt-auto">
          {/* THEME TOGGLE */}
          <button 
            className="history-item theme-toggle mb-3" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          <h3 className="section-title">Workspace</h3>
          <div className="workspace-stat">
            <span className="stat-label">Project:</span>
            <span className="stat-value code">corecode</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-area">

        {/* CHAT DISPLAY */}
        <div className="chat-container" ref={scrollRef}>
          {history.length === 0 ? (
            <div className="empty-state">
              <pre className="ascii-logo code">
{String.raw`   ____ ___  ____  _____  ____ ___  ____  _____ 
  / ___/ _ \|  _ \| ____|/ ___/ _ \|  _ \| ____|
 | |  | | | | |_) |  _| | |  | | | | | | |  _|  
 | |__| |_| |  _ <| |___| |__| |_| | |_| | |___ 
  \____\___/|_| \_\_____/\____\___/|____/|_____|`}
              </pre>
              <div className="ascii-sub code">Harness The Harnesses</div>
            </div>
          ) : (
            <div className="chat-feed">
              {history.map((msg) => (
                <div key={msg.id} className={`message-bubble ${msg.role}`}>
                  <div className="message-header code flex gap-2 items-center">
                    {msg.role === 'assistant' ? 'CORECODE' : 'YOU'}
                    
                    {/* "Thinking" Popup UI for Reasoning Models */}
                    {msg.isThinking && (
                      <span className="thinking-badge animate-fade-in code text-xs flex gap-2 items-center text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20">
                        <BrainCircuit size={12} className="animate-pulse" /> Reasoning in progress...
                      </span>
                    )}
                  </div>
                  
                  <div className="message-content">
                    {msg.content || (msg.isStream && !msg.isThinking ? <span className="animate-pulse">_</span> : '')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROMPT BOX  */}
        <div className="prompt-wrapper">
          <div className="prompt-container glass-panel">
            <textarea 
              className="prompt-input" 
              placeholder={`Message CORECODE in ${activeMode} mode...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            
            <div className="prompt-toolbar">
              <div className="toolbar-left">
                
                {/* Mode Selector */}
                <div className="mode-tabs">
                  <button 
                    className={`mode-tab ${activeMode === 'ask' ? 'active tab-ask' : ''}`}
                    onClick={() => setActiveMode('ask')}
                  >
                    Ask
                  </button>
                  <button 
                    className={`mode-tab ${activeMode === 'plan' ? 'active tab-plan' : ''}`}
                    onClick={() => setActiveMode('plan')}
                  >
                    Plan
                  </button>
                  <button 
                    className={`mode-tab ${activeMode === 'agent' ? 'active tab-agent' : ''}`}
                    onClick={() => setActiveMode('agent')}
                  >
                    Agent
                  </button>
                </div>

                {/* Custom Styled Provider/Model Selector */}
                <div className="custom-routing">
                  
                  {/* Provider Dropdown */}
                  <div className="custom-dropdown">
                    <button 
                      className="dropdown-trigger"
                      onClick={() => setIsProviderOpen(!isProviderOpen)}
                    >
                      {activeProviderObj && <activeProviderObj.icon size={14} />}
                      {activeProviderObj?.name}
                      <ChevronDown size={14} className="dropdown-icon" />
                    </button>
                    {isProviderOpen && (
                      <div className="dropdown-menu">
                        {PROVIDERS.map((p) => (
                          <button 
                            key={p.id} 
                            className={`dropdown-item ${provider === p.id ? 'active' : ''}`}
                            onClick={() => handleProviderSelect(p.id)}
                          >
                            <p.icon size={14} />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Model Dropdown (Unhidden to support full CLI models and standards) */}
                  <span className="routing-divider">/</span>
                  <div className="custom-dropdown">
                    <button 
                      className={`dropdown-trigger highlight text-${activeMode}`}
                      onClick={() => setIsModelOpen(!isModelOpen)}
                    >
                      {activeModelObj?.name || "Loading Models..."}
                      <ChevronDown size={14} className="dropdown-icon" />
                    </button>
                    {isModelOpen && (
                      <div className="dropdown-menu">
                        {dynamicModels[provider]?.map((m) => (
                          <button 
                            key={m.id} 
                            className={`dropdown-item ${model === m.id ? 'active' : ''}`}
                            onClick={() => { setModel(m.id); setIsModelOpen(false); }}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>

              <div className="prompt-actions">
                <span className="shortcut-hint code">Return ↵</span>
                <button 
                  className={`send-btn bg-${activeMode}`}
                  onClick={handleSend}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
