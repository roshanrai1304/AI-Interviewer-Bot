import React from 'react';
import {
  Box,
  Card,
  Typography,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

interface StageScores {
  [key: string]: number;
}

interface DetailedScore {
  stage: string;
  question: string;
  detailed_scores: {
    relevance: number;
    depth: number;
    clarity: number;
    technical: number;
  };
  overall_score: number;
  feedback: string;
}

interface InterviewSummaryProps {
  overall_score: number;
  stage_scores: StageScores;
  detailed_scores: DetailedScore[];
  summary: string;
}

const InterviewSummary: React.FC<InterviewSummaryProps> = ({
  overall_score,
  stage_scores,
  detailed_scores,
  summary,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4caf50';
    if (score >= 6) return '#2196f3';
    if (score >= 4) return '#ff9800';
    return '#f44336';
  };

  return (
    <Card sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 2 }}>
      {/* Overall Score */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Interview Summary
        </Typography>
        <Typography variant="h2" sx={{ color: getScoreColor(overall_score) }}>
          {overall_score.toFixed(1)}/10
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Overall Score
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Stage Scores */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Performance by Stage
        </Typography>
        {Object.entries(stage_scores).map(([stage, score]) => (
          <Box key={stage} sx={{ my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                {stage}
              </Typography>
              <Typography variant="body1" sx={{ color: getScoreColor(score) }}>
                {score.toFixed(1)}/10
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={score * 10}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getScoreColor(score),
                },
              }}
            />
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Feedback
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
          {summary}
        </Typography>
      </Box>

      {/* Detailed Scores */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Question-by-Question Breakdown
        </Typography>
        <List>
          {detailed_scores.map((score, index) => (
            <ListItem
              key={index}
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                borderBottom: '1px solid #e0e0e0',
                py: 2,
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                    {score.stage} Stage
                  </Typography>
                }
                secondary={score.question}
              />
              <Box sx={{ width: '100%', mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  {Object.entries(score.detailed_scores).map(([criterion, value]) => (
                    <Box key={criterion} sx={{ minWidth: '120px' }}>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                        {criterion}
                      </Typography>
                      <Typography variant="body2" sx={{ color: getScoreColor(value) }}>
                        {value.toFixed(1)}/10
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {score.feedback}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Box>
    </Card>
  );
};

export default InterviewSummary; 