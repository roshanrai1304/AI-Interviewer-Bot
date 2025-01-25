interface Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

interface InterviewResponse {
  question: string;
  audio: string; // base64 encoded audio
  stage: string;
  transcript?: string;
}

interface StartInterviewResponse {
  session_id: string;
  message: string;
  audio: string;
  stage: string;
} 