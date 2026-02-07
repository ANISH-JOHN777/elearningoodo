import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Loader, MessageCircle, CheckCircle, XCircle, Trophy, RotateCcw, Code } from 'lucide-react';

// NOTE: Replace with your own valid Gemini API key from https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const LearnerChatbot = () => {
  const { courses, enrollments, currentUser } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${currentUser?.name || 'learner'}! 👋 I'm your learning assistant. I can help you with:
- **Mock Tests**: Ask me for a quiz on any programming language (e.g., "Give me a mock test on React")
- Information about your courses and enrollments
- Tips for studying effectively
- Questions about course content
- Your progress and achievements

What would you like to know?`,
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Mock test state
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizTopic, setQuizTopic] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentQuestionIndex, quizSubmitted]);

  // Detect if message is asking for a mock test
  const detectMockTestRequest = (message) => {
    const msg = message.toLowerCase();
    const testKeywords = ['mock test', 'quiz', 'test me', 'practice test', 'mcq', 'questions on', 'test on'];
    const hasTestKeyword = testKeywords.some(kw => msg.includes(kw));
    
    // Extract topic
    const languages = [
      'javascript', 'js', 'react', 'reactjs', 'react.js', 'python', 'java', 'c++', 'cpp', 
      'c#', 'csharp', 'ruby', 'php', 'swift', 'kotlin', 'go', 'golang', 'rust', 
      'typescript', 'ts', 'html', 'css', 'sql', 'node', 'nodejs', 'node.js',
      'angular', 'vue', 'vuejs', 'vue.js', 'django', 'flask', 'spring', 'express',
      'mongodb', 'mysql', 'postgresql', 'redis', 'docker', 'kubernetes', 'aws',
      'git', 'linux', 'bash', 'powershell', 'data structures', 'algorithms', 'oop',
      'machine learning', 'ml', 'ai', 'deep learning', 'neural networks'
    ];
    
    let detectedTopic = null;
    for (const lang of languages) {
      if (msg.includes(lang)) {
        detectedTopic = lang;
        break;
      }
    }
    
    return { isTestRequest: hasTestKeyword && detectedTopic, topic: detectedTopic };
  };

  // Generate quiz using Gemini API
  const generateQuiz = async (topic) => {
    const prompt = `Generate a mock test with exactly 5 multiple choice questions about ${topic} programming/technology.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation, just the JSON):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Rules:
- correctAnswer is the index (0-3) of the correct option
- Questions should be beginner to intermediate level
- Cover different aspects of ${topic}
- Make options realistic (avoid obviously wrong answers)
- Return ONLY the JSON array, nothing else`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON from response (handle potential markdown code blocks)
      let jsonStr = text.trim();
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const questions = JSON.parse(jsonStr);
      return questions;
    } catch (error) {
      console.error('Quiz generation error:', error);
      // Return fallback questions
      return getFallbackQuestions(topic);
    }
  };

  // Fallback questions if API fails
  const getFallbackQuestions = (topic) => {
    const fallbackSets = {
      'react': [
        { question: "What is the virtual DOM in React?", options: ["A lightweight copy of the actual DOM", "A CSS framework", "A database", "A testing library"], correctAnswer: 0, explanation: "The virtual DOM is a lightweight JavaScript representation of the actual DOM that React uses for efficient updates." },
        { question: "Which hook is used for side effects in React?", options: ["useState", "useEffect", "useContext", "useReducer"], correctAnswer: 1, explanation: "useEffect is the hook designed for handling side effects like API calls, subscriptions, or DOM manipulation." },
        { question: "What is JSX?", options: ["A JavaScript XML syntax extension", "A CSS preprocessor", "A database query language", "A testing framework"], correctAnswer: 0, explanation: "JSX is a syntax extension that allows you to write HTML-like code in JavaScript files." },
        { question: "How do you pass data from parent to child component?", options: ["Using state", "Using props", "Using context only", "Using Redux only"], correctAnswer: 1, explanation: "Props (properties) are the standard way to pass data from a parent component to a child component." },
        { question: "What does useState return?", options: ["Only the state value", "An array with state and setter function", "A promise", "An object with methods"], correctAnswer: 1, explanation: "useState returns an array containing the current state value and a function to update it." }
      ],
      'javascript': [
        { question: "What is the output of typeof null?", options: ["'null'", "'undefined'", "'object'", "'number'"], correctAnswer: 2, explanation: "This is a known JavaScript quirk - typeof null returns 'object' due to a historical bug that was kept for backward compatibility." },
        { question: "Which method adds an element to the end of an array?", options: ["unshift()", "push()", "shift()", "pop()"], correctAnswer: 1, explanation: "push() adds one or more elements to the end of an array and returns the new length." },
        { question: "What is a closure in JavaScript?", options: ["A syntax error", "A function with access to its outer scope", "A type of loop", "A CSS property"], correctAnswer: 1, explanation: "A closure is a function that has access to variables from its outer (enclosing) function's scope." },
        { question: "What does '===' operator check?", options: ["Value only", "Type only", "Value and type", "Reference only"], correctAnswer: 2, explanation: "The strict equality operator (===) checks both value and type without type coercion." },
        { question: "Which is NOT a JavaScript data type?", options: ["undefined", "boolean", "float", "symbol"], correctAnswer: 2, explanation: "JavaScript has number (not separate int/float), string, boolean, undefined, null, symbol, bigint, and object." }
      ],
      'python': [
        { question: "What is the correct way to create a list in Python?", options: ["list = {1, 2, 3}", "list = [1, 2, 3]", "list = (1, 2, 3)", "list = <1, 2, 3>"], correctAnswer: 1, explanation: "Lists in Python are created using square brackets []." },
        { question: "Which keyword is used to define a function?", options: ["function", "func", "def", "define"], correctAnswer: 2, explanation: "In Python, functions are defined using the 'def' keyword." },
        { question: "What does len() function return?", options: ["The last element", "The first element", "The number of elements", "The sum of elements"], correctAnswer: 2, explanation: "len() returns the number of items in an object (length)." },
        { question: "How do you start a comment in Python?", options: ["//", "/*", "#", "--"], correctAnswer: 2, explanation: "Single-line comments in Python start with the # symbol." },
        { question: "What is a dictionary in Python?", options: ["An ordered list", "A key-value pair collection", "A text file", "A module"], correctAnswer: 1, explanation: "A dictionary is a collection of key-value pairs, defined using curly braces {}." }
      ]
    };

    // Try to find matching topic or return generic questions
    const topicLower = topic.toLowerCase();
    for (const [key, questions] of Object.entries(fallbackSets)) {
      if (topicLower.includes(key)) {
        return questions;
      }
    }
    
    // Default to JavaScript if no match
    return fallbackSets['javascript'];
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answerIndex
    }));
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Move to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    
    // Calculate score
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / quizQuestions.length) * 100);
    const resultMessage = {
      id: messages.length + 1,
      text: `🎯 **Quiz Results: ${quizTopic}**

Score: **${correct}/${quizQuestions.length}** (${score}%)

${score >= 80 ? '🏆 Excellent work! You have a strong understanding!' : 
  score >= 60 ? '👍 Good job! Keep practicing to improve further.' : 
  '📚 Keep learning! Review the explanations below to improve.'}

Scroll down to review your answers and explanations.`,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, resultMessage]);
  };

  // Reset quiz
  const handleResetQuiz = () => {
    setQuizMode(false);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizTopic('');
  };

  // Call Gemini API for regular chat
  const callGeminiAPI = async (userMessage) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      return getLocalResponse(userMessage);
    }

    try {
      const systemPrompt = `You are a helpful learning assistant for LearnSphere. Be friendly, encouraging, and concise. If the user asks for a mock test or quiz, tell them you're generating it now. Use emojis occasionally.`;
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt + '\n\nUser: ' + userMessage }] }],
        }),
      });

      if (!response.ok) {
        return getLocalResponse(userMessage);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || getLocalResponse(userMessage);
    } catch (error) {
      console.error('Gemini API Error:', error);
      return getLocalResponse(userMessage);
    }
  };

  // Local fallback responses
  const getLocalResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('study') || msg.includes('learn') || msg.includes('habit')) {
      return `📚 Here are some effective study tips:\n\n1. **Pomodoro Technique**: Study for 25 minutes, then take a 5-minute break\n2. **Active Recall**: Test yourself instead of just re-reading\n3. **Spaced Repetition**: Review material at increasing intervals\n\nStay consistent and you'll see great progress! 💪`;
    }
    
    if (msg.includes('course')) {
      return `📖 We have various programming courses available! You can ask me for a mock test on any topic like React, JavaScript, Python, etc.`;
    }
    
    return `Thanks for your message! 😊 I can help with:\n• **Mock Tests** - Ask "Give me a mock test on [topic]"\n• Study tips and techniques\n• Course information\n• Learning motivation\n\nWhat would you like to explore?`;
  };

  // Handle message send
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const userMsgObj = {
      id: messages.length + 1,
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsgObj]);
    setLoading(true);

    // Check if it's a mock test request
    const { isTestRequest, topic } = detectMockTestRequest(userMessage);
    
    if (isTestRequest) {
      // Add bot response about generating quiz
      const preparingMsg = {
        id: messages.length + 2,
        text: `🚀 Great choice! Generating a mock test on **${topic.charAt(0).toUpperCase() + topic.slice(1)}**...\n\nThis will include 5 multiple choice questions to test your knowledge!`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, preparingMsg]);

      // Generate quiz
      const questions = await generateQuiz(topic);
      setQuizQuestions(questions);
      setQuizTopic(topic.charAt(0).toUpperCase() + topic.slice(1));
      setQuizMode(true);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizSubmitted(false);
    } else {
      // Regular chat response
      const botResponse = await callGeminiAPI(userMessage);
      const botMsgObj = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsgObj]);
    }

    setLoading(false);
  };

  const suggestedQuestions = [
    "Give me a mock test on React",
    "Quiz me on JavaScript",
    "Mock test on Python",
    "How can I improve my coding skills?",
    "Test me on data structures",
  ];

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    setTimeout(() => {
      document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 100);
  };

  // Render quiz interface
  const renderQuiz = () => {
    if (!quizQuestions.length) return null;
    
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
    const allAnswered = Object.keys(selectedAnswers).length === quizQuestions.length;

    return (
      <div className="bg-slate-800/80 border border-cyan-500/30 rounded-xl p-6 mx-4 my-4">
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-cyan-300">{quizTopic} Quiz</span>
          </div>
          <span className="text-sm text-slate-400">
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-700 rounded-full mb-6">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
          />
        </div>

        {!quizSubmitted ? (
          <>
            {/* Question */}
            <h3 className="text-lg font-medium text-white mb-4">{currentQuestion.question}</h3>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedAnswers[currentQuestionIndex] === idx
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-100'
                      : 'bg-slate-700/50 border-slate-600 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-700'
                  }`}
                >
                  <span className="font-medium mr-3">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-sm border border-cyan-500/50 text-cyan-300 rounded-lg hover:bg-cyan-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              <div className="flex gap-2">
                {quizQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                      idx === currentQuestionIndex
                        ? 'bg-cyan-500 text-white'
                        : selectedAnswers[idx] !== undefined
                        ? 'bg-cyan-500/30 text-cyan-300'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex < quizQuestions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={!isAnswered}
                  className="px-4 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </>
        ) : (
          /* Quiz Results */
          <div className="space-y-4">
            {quizQuestions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div key={idx} className={`p-4 rounded-lg border ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200 mb-2">Q{idx + 1}: {q.question}</p>
                      <p className="text-xs text-slate-400 mb-1">
                        Your answer: <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>{q.options[userAnswer]}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-emerald-400">
                          Correct answer: {q.options[q.correctAnswer]}
                        </p>
                      )}
                      <p className="text-xs text-cyan-300 mt-2 italic">{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleResetQuiz}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                New Quiz
              </button>
              <button
                onClick={() => {
                  handleResetQuiz();
                  setInput(`Give me another mock test on ${quizTopic}`);
                  setTimeout(() => {
                    document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }));
                  }, 100);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 text-white rounded-lg hover:from-cyan-600 hover:to-sky-600 transition-all"
              >
                <Trophy className="w-4 h-4" />
                Retry {quizTopic}
              </button>
            </div>
          </div>
        )}
      </div>
    );
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

        {/* Quiz Interface */}
        {quizMode && renderQuiz()}

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
      {messages.length === 1 && !loading && !quizMode && (
        <div className="px-6 py-4 border-t border-cyan-500/10">
          <p className="text-xs text-cyan-200/50 mb-3 uppercase tracking-wider">Try asking:</p>
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
            placeholder={quizMode && !quizSubmitted ? "Complete the quiz above..." : "Ask for a mock test on any topic..."}
            disabled={loading || (quizMode && !quizSubmitted)}
            className="flex-1 bg-slate-700/50 border border-cyan-500/30 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || (quizMode && !quizSubmitted)}
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
