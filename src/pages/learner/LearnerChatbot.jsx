import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Loader, MessageCircle } from 'lucide-react';

const GEMINI_API_KEY = 'AIzaSyBwpj29WKt9WLpDF2sTxE-RWLnBylBgZwA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const LearnerChatbot = () => {
  const { courses, enrollments, currentUser } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${currentUser?.name || 'learner'}! 👋 I'm your learning assistant. I can help you with:
- Information about your courses and enrollments
- Tips for studying effectively
- Questions about course content
- Your progress and achievements
- General learning advice

What would you like to know?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prepare context from app data
  const getContextData = () => {
    const enrolledCount = enrollments.length;
    const coursesList = courses
      .slice(0, 5)
      .map((c) => `${c.title} (Level: ${c.level})`)
      .join(', ');
    const userStats = enrollments.length > 0 ? `${enrolledCount} courses enrolled` : 'No courses enrolled yet';

    return `
User: ${currentUser?.name || 'Learner'} (Role: ${currentUser?.role || 'learner'})
Enrolled Courses: ${userStats}
Available Courses: ${coursesList}
Total Courses Available: ${courses.length}
${currentUser?.bio ? `Bio: ${currentUser.bio}` : ''}
    `.trim();
  };

  const buildSystemPrompt = () => {
    const context = getContextData();
    return `You are a helpful learning assistant for LearnSphere, an e-learning platform. 
You have the following information about the user and platform:

${context}

You should:
1. Be encouraging and supportive
2. Provide helpful information about courses and learning
3. Give practical study tips
4. Help with motivation and learning strategies
5. Answer questions about the platform and available courses
6. Keep responses concise and friendly
7. Use emojis occasionally to make responses engaging
8. If asked about specific courses, provide accurate information based on the context
9. Help track progress and suggest next steps

Keep responses helpful, encouraging, and focused on learning.`;
  };

  const callGeminiAPI = async (userMessage) => {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildSystemPrompt() + '\n\nUser message: ' + userMessage,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const userMsgObj = {
      id: messages.length + 1,
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsgObj]);
    setLoading(true);

    try {
      // Get bot response
      const botResponse = await callGeminiAPI(userMessage);
      const botMsgObj = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsgObj]);
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = {
        id: messages.length + 2,
        text: 'Oops! Something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What courses should I take next?",
    "How can I improve my study habits?",
    "Tell me about available courses",
    "How is my learning progress?",
    "What are effective study tips?",
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    setTimeout(() => {
      document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-md overflow-hidden flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-cyan-500 to-sky-500 text-white rounded-br-none'
                      : 'bg-slate-700/70 text-slate-100 border border-cyan-500/20 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="bg-slate-700/70 text-slate-100 border border-cyan-500/20 px-4 py-3 rounded-xl rounded-bl-none">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length === 1 && !loading && (
            <div className="px-6 py-4 border-t border-cyan-500/10">
              <p className="text-xs text-cyan-200/50 mb-3 uppercase tracking-wider">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-2 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 border border-cyan-500/20 rounded-full transition-all hover:scale-105"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-cyan-500/10 p-4 bg-slate-700/30">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your learning..."
                disabled={loading}
                className="flex-1 bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 bg-gradient-to-br from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          <style>{`
            @keyframes fade-in-up {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .animate-fade-in-up {
              animation: fade-in-up 0.3s ease-out;
            }
          `}</style>
        </div>
  );
};

export default LearnerChatbot;
