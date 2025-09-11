import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Sparkles, Lightbulb } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchSuggestions();
    // Add welcome message
    setMessages([
      {
        id: 1,
        type: 'bot',
        message: "Hi! I'm S-GenAi (V1), developed by Shein Htut Oo. I'm your personal AI finance assistant, specialized in helping you manage your money, create budgets, and make smart financial decisions. What would you like to know about your finances?",
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('/api/chat/suggestions');
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: message.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat/message', {
        message: message.trim()
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: response.data.botResponse,
        messageType: response.data.type,
        data: response.data.data,
        categories: response.data.categories,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        message: "Sorry, I'm having trouble right now. Please try again later.",
        messageType: 'error',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const getMessageTypeColor = (messageType) => {
    switch (messageType) {
      case 'warning':
        return 'border-l-orange-500 bg-orange-50';
      case 'tip':
        return 'border-l-blue-500 bg-blue-50';
      case 'analysis':
        return 'border-l-green-500 bg-green-50';
      case 'error':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-300 bg-white';
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-primary-100 rounded-full">
          <MessageCircle className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Financial Assistant</h1>
          <p className="text-gray-600">Get personalized financial advice and insights</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : `border-l-4 ${getMessageTypeColor(message.messageType)}`
                }`}
              >
                {message.type === 'bot' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary-600" />
                    <span className="text-xs font-medium text-primary-600">S-GenAi (V1)</span>
                  </div>
                )}
                
                <p className={`text-sm ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                  {message.message}
                </p>
                
                {message.data && (
                  <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
                    <p>Total: ${message.data.total?.toFixed(2)}</p>
                    <p>Transactions: {message.data.count}</p>
                  </div>
                )}
                
                {message.categories && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.categories.map((cat, idx) => (
                      <span key={idx} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-primary-200' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <LoadingSpinner size="sm" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && suggestions.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Suggested questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-gray-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about budgeting, saving money, or your expenses..."
              className="flex-1 input"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="btn-primary"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
          <h3 className="font-medium text-gray-900 mb-1">Smart Conversations</h3>
          <p className="text-sm text-gray-600">Natural language understanding for financial queries</p>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <h3 className="font-medium text-gray-900 mb-1">Personalized Insights</h3>
          <p className="text-sm text-gray-600">AI-powered advice based on your spending data</p>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 text-purple-600" />
          <h3 className="font-medium text-gray-900 mb-1">Financial Tips</h3>
          <p className="text-sm text-gray-600">Expert advice on budgeting and saving money</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
