import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const InterviewChat = () => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setFile(file);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/interview/upload-resume', formData);
      setSessionId(response.data.session_id);
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.data.message
      }]);
    } catch (error) {
      console.error('Error uploading resume:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: inputText
    }]);

    try {
      const response = await axios.post('http://localhost:8000/api/v1/interview/respond', {
        session_id: sessionId,
        response: inputText
      });

      // Add bot response
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.data.question
      }]);

      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h2>AI Interview Assistant</h2>
      </ChatHeader>
      
      {!sessionId && (
        <UploadSection>
          <label htmlFor="resume">Upload your resume to start the interview:</label>
          <input
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
          />
        </UploadSection>
      )}

      <MessagesContainer>
        {messages.map((message, index) => (
          <Message key={index} $isUser={message.type === 'user'}>
            {message.content}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <form onSubmit={handleSubmit}>
        <InputContainer>
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your response..."
            disabled={!sessionId}
          />
          <SendButton type="submit" disabled={!sessionId || !inputText.trim()}>
            Send
          </SendButton>
        </InputContainer>
      </form>
    </ChatContainer>
  );
};

// Styled Components
const ChatContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const ChatHeader = styled.div`
  text-align: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px 10px 0 0;
`;

const UploadSection = styled.div`
  padding: 20px;
  text-align: center;
  background-color: #f9f9f9;
  margin-bottom: 20px;
  border-radius: 5px;
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const Message = styled.div`
  margin: 10px 0;
  padding: 10px 15px;
  border-radius: 10px;
  max-width: 70%;
  ${props => props.$isUser ? `
    background-color: #007bff;
    color: white;
    margin-left: auto;
  ` : `
    background-color: #f1f1f1;
    margin-right: auto;
  `}
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Input = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }
`;

export default InterviewChat; 