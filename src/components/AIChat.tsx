import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, Loader2, PlusCircle } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { Todo } from '../types';

interface AIChatProps {
  onAddTask: (todo: Partial<Todo>) => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  isAction?: boolean;
}

export default function AIChat({ onAddTask }: AIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm your AI assistant. Tell me what you need to do, and I'll help you create a task with alarms and priorities!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const createTaskTool = {
        name: "create_task",
        parameters: {
          type: Type.OBJECT,
          description: "Create a new task with title, description, priority, category, due date, and alarm time.",
          properties: {
            title: { type: Type.STRING, description: "The title of the task" },
            description: { type: Type.STRING, description: "Detailed description of the task" },
            priority: { type: Type.STRING, enum: ["low", "medium", "high"], description: "Priority level" },
            category: { type: Type.STRING, description: "Task category (e.g., Work, Personal, Shopping)" },
            dueDate: { type: Type.STRING, description: "Due date in ISO format (YYYY-MM-DDTHH:mm)" },
            alarmTime: { type: Type.STRING, description: "Alarm time in ISO format (YYYY-MM-DDTHH:mm)" },
          },
          required: ["title"],
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat({ role: 'user', text: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "You are a helpful task assistant for 'Alarming Tasks'. Your goal is to help users create tasks. If they mention a task, use the create_task tool. If they are vague, ask for details like priority or due date. Be concise and friendly.",
          tools: [{ functionDeclarations: [createTaskTool] }],
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'create_task') {
            const args = call.args as any;
            onAddTask(args);
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: `Great! I've created the task: "${args.title}"${args.priority ? ` with ${args.priority} priority` : ''}.`,
              isAction: true 
            }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I'm not sure how to help with that. Try asking me to create a task!" }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 transition-transform group"
      >
        <Sparkles size={32} className="group-hover:animate-pulse" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className="fixed bottom-28 right-8 z-50 w-[90vw] max-w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Always Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : msg.isAction 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-tl-none flex items-center gap-2'
                        : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-none'
                  }`}>
                    {msg.isAction && <PlusCircle size={16} className="shrink-0" />}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                    <Loader2 size={18} className="animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me to create a task..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border-transparent focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 rounded-2xl transition-all outline-none text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-widest">
                Powered by Gemini AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
