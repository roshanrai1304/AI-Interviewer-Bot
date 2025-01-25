import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material';

interface Score {
  relevance: number;
  depth: number;
  clarity: number;
  technical: number;
}

interface Evaluation {
  stage: string;
  detailed_scores: Score;
  overall_score: number;
  feedback: string;
}

interface Message {
  role: 'interviewer' | 'candidate';
  content: string;
  evaluation?: Evaluation;
}

const InterviewPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStage, setCurrentStage] = useState<string>('introduction');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Score display component
  const ScoreDisplay: React.FC<{ evaluation: Evaluation }> = ({ evaluation }) => {
    return (
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6">Response Evaluation</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Overall Score</Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={evaluation.overall_score * 10}
                color={evaluation.overall_score >= 7 ? 'success' : 
                       evaluation.overall_score >= 5 ? 'warning' : 'error'}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" component="div">
                  {evaluation.overall_score.toFixed(1)}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">Detailed Scores</Typography>
            {Object.entries(evaluation.detailed_scores).map(([key, value]) => (
              <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{key}:</Typography>
                <Typography variant="body2">{value.toFixed(1)}/10</Typography>
              </Box>
            ))}
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Feedback</Typography>
            <Typography variant="body2">{evaluation.feedback}</Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Message component
  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: message.role === 'interviewer' ? 'flex-start' : 'flex-end',
        mb: 2,
      }}
    >
      <Paper
        sx={{
          p: 2,
          maxWidth: '70%',
          backgroundColor: message.role === 'interviewer' ? '#f5f5f5' : '#e3f2fd',
        }}
      >
        <Typography>{message.content}</Typography>
      </Paper>
      {message.evaluation && <ScoreDisplay evaluation={message.evaluation} />}
    </Box>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        {/* Chat Area */}
        <Paper sx={{ p: 2, height: '70vh', overflow: 'auto' }}>
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}
          {isLoading && <CircularProgress />}
        </Paper>
      </Grid>
      <Grid item xs={4}>
        {/* Interview Progress */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Interview Progress</Typography>
          <Typography variant="body1">Current Stage: {currentStage}</Typography>
          {/* Add more interview stats here */}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default InterviewPanel; 