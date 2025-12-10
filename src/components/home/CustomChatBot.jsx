'use client';
import { useState } from 'react';
import './CustomChatBot.css';
import Image from 'next/image';
import supportIcon from '/public/assets/sp.png';

const CustomChatBot = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [issue, setIssue] = useState('');
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([
    { sender: 'bot', text: '👋 Hi! What is your name?' }
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userInput = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userInput }]);
    setInput('');

    if (step === 1) {
      setName(userInput);
      setMessages(prev => [...prev, { sender: 'bot', text: '📝 Please describe your issue.' }]);
      setStep(2);
    } else if (step === 2) {
      setIssue(userInput);
      setMessages(prev => [...prev, { sender: 'bot', text: '⏳ Submitting your issue...' }]);
      setStep(3);

      const res = await fetch('/api/supportchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, issue: userInput }),
      });

      if (res.ok) {
        setMessages(prev => [...prev, { sender: 'bot', text: '✅ Thank you! Our team will contact you soon.' }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: '❌ Something went wrong. Please try again later.' }]);
      }
    }
  };

  return (
    <div className="custom-fab-position">
      {isOpen && (
        <div className="chatbot-container">
          <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>

          <div className="chat-window">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {step < 3 && (
            <div className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          )}
        </div>
      )}

      {!isOpen && (
        <button className="support-btn" onClick={() => setIsOpen(true)}>
          <Image src={supportIcon} alt="support" width={20} height={20} />
          Support
        </button>
      )}
    </div>
  );
};

export default CustomChatBot;
