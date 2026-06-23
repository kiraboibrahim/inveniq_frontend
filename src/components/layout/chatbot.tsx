/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

let messageIdCounter = 0;
const generateId = () => {
  messageIdCounter += 1;
  return `msg-${Date.now()}-${messageIdCounter}`;
};

const getNow = () => new Date();

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hello! I am your AI Inventory Assistant. How can I help you today?\n\nHere are some of the things I can do:\n- **Demand Forecasting**: Ask *'Forecast SKU-12345'*\n- **Supplier Recommendations**: Ask *'Recommend supplier for SKU-12345'*\n- **Loss / Theft Audits**: Ask *'Show stock anomalies'*\n- **Draft Purchase Orders**: Ask *'Restock SKU-12345 with 50 units'*",
      timestamp: getNow(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    if (!textToSend) {
      setInput("");
    }

    const userMsg: Message = {
      id: generateId(),
      sender: "user",
      text: query,
      timestamp: getNow(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream in response");
      }

      const botMsgId = generateId();
      const botMsg: Message = {
        id: botMsgId,
        sender: "bot",
        text: "",
        timestamp: getNow(),
      };
      setMessages((prev) => [...prev, botMsg]);

      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((msg) => (msg.id === botMsgId ? { ...msg, text: msg.text + chunk } : msg))
        );
      }
    } catch (err) {
      let serverError = err instanceof Error ? err.message : "An unexpected error occurred.";
      try {
        if (serverError.startsWith("{") || serverError.startsWith("[")) {
          const parsed = JSON.parse(serverError) as { error?: string; response?: string };
          serverError = parsed.error || parsed.response || serverError;
        }
      } catch {
        // Not a JSON string, keep as is
      }

      const errorMsg: Message = {
        id: generateId(),
        sender: "bot",
        text: `Sorry, I encountered an error: **${serverError}**. Please check your configuration and try again.`,
        timestamp: getNow(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Check Stock Anomalies", query: "Show stock anomalies" },
    { label: "Recommend Supplier", query: "Recommend supplier for " },
    { label: "Demand Forecast", query: "Forecast " },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-accent hover:bg-accent-hover text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center border border-accent/20 cursor-pointer"
        aria-label="Toggle chat assistant"
      >
        {isOpen ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] flex flex-col rounded-2xl border border-border-subtle bg-bg-surface/95 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-bg-elevated border-b border-border-subtle p-4 text-text-primary flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-accent/15 border border-accent/30 p-1.5 rounded-xl">
                <Bot size={18} className="text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5 text-text-primary tracking-tight">
                  InvenIQ Assistant <Sparkles size={13} className="text-amber-500 fill-amber-500/20" />
                </h3>
                <span className="text-[10px] text-text-secondary font-medium">AI-Powered Inventory insights</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-secondary hover:text-text-primary hover:bg-bg-muted p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border-subtle [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {msg.sender === "bot" && (
                  <div className="w-8 h-8 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
                    <Bot size={15} className="text-accent" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-[13px] leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-accent text-white rounded-tr-none shadow-sm"
                      : "bg-bg-elevated border border-border-subtle/50 text-text-primary rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="space-y-1">
                    {msg.sender === "bot" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-base font-bold mt-2 mb-1 text-text-primary" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-2 mb-1 text-text-primary" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-xs font-semibold mt-1.5 mb-0.5 text-text-primary" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-xs font-semibold mt-1.5 mb-0.5 text-accent-text" {...props} />,
                          p: ({node, ...props}) => <p className="mb-1.5 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-1.5 space-y-0.5" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-1.5 space-y-0.5" {...props} />,
                          li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-text-primary" {...props} />,
                          em: ({node, ...props}) => <em className="italic text-text-secondary" {...props} />,
                          table: ({node, ...props}) => <table className="min-w-full border-collapse border border-border-subtle my-1.5 text-xs" {...props} />,
                          th: ({node, ...props}) => <th className="border border-border-subtle px-2 py-1 bg-bg-muted font-semibold text-text-primary" {...props} />,
                          td: ({node, ...props}) => <td className="border border-border-subtle px-2 py-1 text-text-secondary" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                  <span
                    className={`text-[9px] block mt-1.5 opacity-60 text-right font-mono ${
                      msg.sender === "user" ? "text-indigo-100" : "text-text-tertiary"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center shrink-0">
                  <Bot size={15} className="text-accent" />
                </div>
                <div className="p-3 rounded-2xl bg-bg-elevated border border-border-subtle/50 rounded-tl-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions / suggestion pills */}
          <div className="px-4 py-2 border-t border-border-subtle/50 flex gap-1.5 overflow-x-auto shrink-0 bg-bg-surface/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (action.query.endsWith(" ")) {
                    setInput(action.query);
                  } else {
                    handleSend(action.query);
                  }
                }}
                className="px-3 py-1 rounded-full text-xs font-semibold border border-border-subtle bg-bg-elevated text-text-secondary hover:bg-bg-muted hover:text-text-primary active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border-subtle bg-bg-elevated flex gap-2 items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to forecast stock or check loss..."
              className="flex-1 px-3.5 py-2 rounded-xl text-sm border border-border-subtle bg-bg-surface text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:hover:bg-accent transition-colors flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
