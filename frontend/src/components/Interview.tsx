import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import InterviewPanel from './InterviewPanel';
import { interviewService } from '../services/interviewService';
import InterviewSummary from './InterviewSummary';

const Interview: React.FC = () => {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [interviewSummary, setInterviewSummary] = useState<any>(null);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    startInterview();
  }, []);

  const startInterview = async () => {
    try {
      const result = await interviewService.startInterview();
      setSessionId(result.session_id);
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId) return;

    setIsLoading(true);
    try {
      const result = await interviewService.sendResponse(sessionId, response);
      setResponse('');
      
      if (result.stage === 'closing') {
        await fetchInterviewSummary(sessionId);
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInterviewSummary = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/interview/${sessionId}/summary`);
      const data = await response.json();
      setInterviewSummary(data);
    } catch (error) {
      console.error('Error fetching interview summary:', error);
    }
  };

  const handleViewSummary = async () => {
    if (sessionId) {
      await fetchInterviewSummary(sessionId);
      setShowSummary(true);
    }
  };

  const handleExit = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await interviewService.endInterview(sessionId);
      if (response.summary) {
        setInterviewSummary(response.summary);
        setShowSummary(true);
      }
    } catch (error) {
      console.error('Error ending interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <h2>AI Interview Session</h2>
        <Button
          variant="contained"
          color="error"
          onClick={handleExit}
          disabled={!sessionId || isLoading}
        >
          End Interview
        </Button>
      </Box>

      <InterviewPanel />
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your response here..."
          disabled={isLoading}
        />
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !response.trim() || !sessionId}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Send Response'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleViewSummary}
            disabled={!sessionId || isLoading}
          >
            View Progress
          </Button>
        </Box>
      </Box>

      {showSummary && interviewSummary && (
        <Box sx={{ mt: 3 }}>
          <InterviewSummary
            overall_score={interviewSummary.overall_score}
            stage_scores={interviewSummary.stage_scores}
            detailed_scores={interviewSummary.detailed_scores}
            summary={interviewSummary.summary}
          />
        </Box>
      )}
    </Box>
  );
};

export default Interview; 