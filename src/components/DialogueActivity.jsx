import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, MessageCircle, CheckCircle, RotateCcw, ChevronRight } from 'lucide-react';

/**
 * DialogueActivity Component
 * AI conversation simulator for interactive learning
 * - Chat-based dialogue interface
 * - AI responses to learner inputs
 * - Learning objectives tracking
 * - Points awarded on completion
 * - Can be retaken
 */
export default function DialogueActivity({
  activityId,
  courseId,
  moduleId,
  userId,
  dialogueTitle = 'Dialogue Activity',
  description = '',
  objectives = [],
  onComplete = () => {},
}) {
  const { updateUserCoursePoints, recordQuizAttempt } = useApp();

  // Dialogue state
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: 'Hello! I\'m here to help you learn. What would you like to discuss?',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const messagesEndRef = useRef(null);
  const [messageCount, setMessageCount] = useState(0);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulated AI responses
  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simulate objective completion based on keywords
    const newCompletedObjectives = [...completedObjectives];
    
    if (objectives && objectives.length > 0) {
      objectives.forEach((objective, idx) => {
        if (!completedObjectives.includes(idx)) {
          // Check if user message contains relevant keywords
          const keywords = objective.keywords || [];
          if (keywords.some((kw) => lowerMessage.includes(kw.toLowerCase()))) {
            newCompletedObjectives.push(idx);
          }
        }
      });
      
      setCompletedObjectives(newCompletedObjectives);
    }

    // Generate contextual responses
    const responses = [
      'That\'s great! Can you tell me more about that?',
      'I understand. How would you apply that in practice?',
      'Excellent point! What else would you like to explore?',
      'Very good! Have you considered the alternative approach?',
      'I see. Let\'s dive deeper into that concept.',
      'That\'s an interesting perspective. Can you give an example?',
      'Good thinking! What are the potential challenges?',
      'Exactly right! How would you improve on that?',
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle message send
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user',
      text: userInput,
    };
    setMessages([...messages, newUserMessage]);
    setUserInput('');
    setMessageCount(messageCount + 1);

    // Simulate AI thinking delay
    setTimeout(() => {
      const aiResponse = getAIResponse(userInput);
      const newAIMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: aiResponse,
      };
      setMessages((prev) => [...prev, newAIMessage]);
      setIsLoading(false);

      // Check if user has completed activity
      if (messageCount >= 5 && completedObjectives.length >= Math.ceil((objectives?.length || 1) * 0.7)) {
        // Auto-complete after sufficient engagement
        setTimeout(() => {
          finishDialogue(newCompletedObjectives);
        }, 2000);
      }
    }, 1000);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Finish dialogue
  const finishDialogue = async (objectives = completedObjectives) => {
    setIsLoading(true);

    try {
      const objectivesCount = objectives.length;
      const totalObjectives = (objectivesList?.length || 1);
      let points = 0;

      if (objectivesCount === totalObjectives) {
        points = 100;
      } else if (objectivesCount >= totalObjectives * 0.8) {
        points = 70;
      } else if (objectivesCount >= totalObjectives * 0.6) {
        points = 40;
      }

      setEarnedPoints(points);

      // Record attempt
      await recordQuizAttempt(userId, activityId, objectivesCount, 1);

      // Award points
      if (points > 0) {
        await updateUserCoursePoints(userId, courseId, points, 'dialogue_completion');
      }

      setIsCompleted(true);

      // Call completion callback
      setTimeout(() => {
        onComplete({
          activityId,
          completedObjectives: objectivesCount,
          totalObjectives,
          earnedPoints: points,
          messageCount,
        });
      }, 500);
    } catch (error) {
      console.error('Error completing dialogue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset dialogue
  const handleReset = () => {
    setMessages([
      {
        id: 1,
        type: 'bot',
        text: 'Hello! I\'m here to help you learn. What would you like to discuss?',
      },
    ]);
    setUserInput('');
    setIsCompleted(false);
    setCompletedObjectives([]);
    setEarnedPoints(0);
    setMessageCount(0);
  };

  // Store objectives list for use in finishDialogue
  const objectivesList = objectives;

  // Completion Screen
  if (isCompleted) {
    const totalObjectives = objectivesList?.length || 1;
    const completedCount = completedObjectives.length;

    return (
      <div className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-cyan-500/20 to-sky-500/20 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-cyan-300 mb-2">Dialogue Complete! 🎉</h2>
          <p className="text-slate-400 text-lg">{dialogueTitle}</p>
        </div>

        {/* Results */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-sky-500/20 border border-sky-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-sky-400 mb-2">{completedCount}/{totalObjectives}</div>
            <div className="text-sm text-slate-400">Objectives Covered</div>
          </div>
          <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{messageCount}</div>
            <div className="text-sm text-slate-400">Messages Exchanged</div>
          </div>
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-2">+{earnedPoints}</div>
            <div className="text-sm text-slate-400">Points Earned</div>
          </div>
        </div>

        {/* Completed Objectives */}
        {objectivesList && objectivesList.length > 0 && (
          <div className="bg-slate-700/50 border border-cyan-500/20 rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold text-cyan-300 mb-4">Learning Objectives</h3>
            <div className="space-y-2">
              {objectivesList.map((objective, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    completedObjectives.includes(idx)
                      ? 'bg-sky-500/10 border border-sky-500/20'
                      : 'bg-slate-600/50 border border-slate-500/20'
                  }`}
                >
                  <CheckCircle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      completedObjectives.includes(idx) ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  />
                  <span className="text-sm text-slate-300">{objective.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-slate-300 transition"
          >
            <RotateCcw className="w-5 h-5" />
            Retry Dialogue
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 rounded-lg font-semibold text-white transition"
          >
            Continue Course
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl p-8">
        <h1 className="text-3xl font-bold text-cyan-300 mb-2 flex items-center gap-3">
          <MessageCircle className="w-8 h-8" />
          {dialogueTitle}
        </h1>
        <p className="text-slate-400 text-lg mb-4">{description}</p>

        {/* Objectives */}
        {objectivesList && objectivesList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 p-4 bg-slate-700/50 rounded-lg border border-cyan-500/20">
            {objectivesList.map((objective, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className={`w-2 h-2 mt-2 flex-shrink-0 ${
                  completedObjectives.includes(idx) ? 'bg-cyan-400' : 'bg-slate-500'
                }`} />
                <span className="text-sm text-slate-300">{objective.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Container */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 shadow-xl overflow-hidden flex flex-col h-96">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white rounded-br-none'
                    : 'bg-slate-700/50 border border-cyan-500/30 text-slate-100 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 bg-slate-700/50 border border-cyan-500/30 text-slate-100 rounded-lg rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ delay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ delay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-cyan-500/20 p-4 bg-slate-900/50">
          <div className="flex gap-3">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              placeholder="Type your response..."
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none disabled:opacity-50"
              rows="2"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !userInput.trim()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 disabled:opacity-50 rounded-lg text-white font-semibold transition flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-cyan-500/50 text-cyan-300 hover:bg-slate-700/50 rounded-lg font-semibold transition"
        >
          Exit Dialogue
        </button>

        {messageCount >= 3 && completedObjectives.length > 0 && (
          <button
            onClick={() => finishDialogue()}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 disabled:opacity-50 rounded-lg font-bold text-white transition"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Finishing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Finish Dialogue
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
