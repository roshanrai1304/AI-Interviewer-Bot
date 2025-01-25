import { FC, useState, useEffect } from 'react';

interface Message {
  text: string;
  isBot: boolean;
}

const InterviewChat: FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Initialize speech synthesis and recognition
  const speechSynthesis = window.speechSynthesis;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  useEffect(() => {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleUserResponse(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
  }, []);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.name.includes('Female')) || null;
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/interview/upload-resume', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const data = await response.json();
      setSessionId(data.session_id);
      
      // Add Natasha's message to chat and speak it
      const botMessage = data.message;
      setMessages(prev => [...prev, { text: botMessage, isBot: true }]);
      speak(botMessage);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleUserResponse = async (transcript: string) => {
    if (!sessionId) return;

    // Add user's message to chat
    setMessages(prev => [...prev, { text: transcript, isBot: false }]);

    try {
      const response = await fetch('http://localhost:8000/api/v1/interview/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          response: transcript,
        }),
      });

      const data = await response.json();
      
      // Add Natasha's response to chat and speak it
      setMessages(prev => [...prev, { text: data.question, isBot: true }]);
      speak(data.question);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const startListening = () => {
    setIsListening(true);
    recognition.start();
  };

  return (
    <div className="interview-chat">
      <h2>Interview with Natasha</h2>
      
      {!sessionId && (
        <div className="upload-section">
          <p>Please upload your resume to begin the interview</p>
          <input 
            type="file" 
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
          />
        </div>
      )}

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isBot ? 'bot' : 'user'}`}>
            <p>{message.isBot ? '🤖 Natasha: ' : '👤 You: '}{message.text}</p>
          </div>
        ))}
      </div>

      {sessionId && (
        <div className="controls">
          <button 
            onClick={startListening}
            disabled={isListening}
          >
            {isListening ? 'Listening...' : 'Click to Speak'}
          </button>
        </div>
      )}

      <style>{`
        .interview-chat {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .chat-messages {
          margin: 20px 0;
          padding: 10px;
          height: 400px;
          overflow-y: auto;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
        .message {
          margin: 10px 0;
          padding: 10px;
          border-radius: 5px;
        }
        .bot {
          background-color: #f0f0f0;
        }
        .user {
          background-color: #e3f2fd;
          text-align: right;
        }
        .controls {
          text-align: center;
        }
        button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:disabled {
          background-color: #ccc;
        }
      `}</style>
    </div>
  );
};

export default InterviewChat;