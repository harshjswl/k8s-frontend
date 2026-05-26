import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const predefinedQuestions = [
    "What is your name?",
    "How are you?",
    "What can you do?",
    "Tell me a joke",
    "What is the meaning of life?",
    "How does AI work?"
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check backend status periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status');
        if (response.ok) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        setIsConnected(false);
      }
    };

    // Check immediately, then every 5 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendQuestion = async (question) => {
    // Add user message
    const userMessage = { type: 'user', text: question };
    setMessages(prev => [...prev, userMessage]);

    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage = { type: 'bot', text: data.answer };
        setMessages(prev => [...prev, botMessage]);

        // Voice response
        const utterance = new SpeechSynthesisUtterance(data.answer);
        utterance.rate = 0.9;
        utterance.pitch = 0.7;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      } else {
        const errorMessage = { type: 'bot', text: 'Neural link disrupted. Please try again.' };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = { type: 'bot', text: 'Connection to mainframe lost.' };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  return (
    <div className="app-container">
      <h1>Nexus AI Chatbot</h1>

      <div className="status-indicator">
        <div className="traffic-light-container">
          <div className={`traffic-light ${isConnected ? 'green' : 'red'}`}></div>
        </div>
        <span>{isConnected ? 'Neural Link: ACTIVE' : 'Neural Link: DISCONNECTED'}</span>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <p>Welcome to Nexus AI. Select a question below to begin the conversation.</p>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">
                {message.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot typing">
              <div className="message-content">
                <span className="typing-indicator">Nexus is processing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="question-buttons">
          {predefinedQuestions.map((question, index) => (
            <button
              key={index}
              className="question-btn"
              onClick={() => sendQuestion(question)}
              disabled={!isConnected || isTyping}
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
