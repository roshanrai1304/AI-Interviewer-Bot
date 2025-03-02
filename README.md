# AI Interview Bot Backend

An intelligent interview assistant that helps companies conduct consistent, unbiased, and efficient technical interviews. Powered by Google's Gemini Pro AI model, this system provides a structured interview experience while saving time and resources.

## 🛠 Technical Implementation

### Architecture Overview
The project follows a modern client-server architecture:
- Frontend: React + TypeScript + Vite
- Backend: FastAPI + Python
- AI: Google's Gemini Pro LLM

### Key Components

#### 1. Interview Bot Core (Python)
- Implemented a stateful interview system using `InterviewBot` class
- Manages 5 distinct interview stages (introduction → technical → experience → behavioral → closing)
- Uses LangChain for structured interaction with Gemini Pro
- Implements dynamic stage transitions based on response analysis
- Maintains conversation context and scoring history

#### 2. Intelligent Question Generation
- Stage-specific prompt templates for contextual questions
- Dynamic question adaptation based on:
  - Candidate's resume content
  - Previous responses
  - Current interview stage
  - Technical depth shown by candidate

#### 3. Response Evaluation System
- Multi-dimensional scoring system:
  - Relevance (0-10)
  - Depth (0-10)
  - Clarity (0-10)
  - Technical Accuracy (0-10)
- Stage-specific weighted scoring
- Automated feedback generation
- Comprehensive interview summary generation

#### 4. Frontend Implementation
- Real-time interview interface with Material-UI
- Speech recognition for voice responses
- Text-to-speech for interviewer questions
- Dynamic progress tracking
- Detailed score visualization
- Responsive design for optimal user experience

### Technical Features

#### Resume Processing
- PDF resume parsing and text extraction
- Content analysis for technical skill identification
- Context maintenance throughout the interview

#### State Management
- Session-based interview tracking
- Progress persistence across stages
- Score accumulation and aggregation

#### API Integration
- RESTful endpoints for interview flow
- Secure file upload handling
- Real-time response processing
- Summary generation and retrieval

### Performance Optimizations
- Efficient prompt management
- Response caching
- Optimized state transitions
- Minimal API payload size

### Security Considerations
- Secure file handling
- API key protection
- Session management
- Input validation and sanitization

### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Vite for fast development
- FastAPI for efficient API handling

## 🌟 Why Use AI Interview Bot?

### For Companies & HR Teams
- **Save Time & Resources**
  - Conduct initial screening interviews 24/7
  - Process multiple candidates simultaneously
  - Reduce scheduling conflicts and coordination overhead
  - Free up your technical team's time for final interviews

- **Consistent Evaluation**
  - Standardized interview structure for all candidates
  - Objective scoring based on predefined criteria
  - Eliminate interviewer bias and mood variations
  - Compare candidates using consistent metrics

- **Comprehensive Assessment**
  - Automatic resume analysis and skill validation
  - Multi-stage interview process covering all crucial aspects
  - Detailed feedback and scoring for each response
  - Overall candidate evaluation summary

### For Technical Recruiters
- **Smart Question Generation**
  - Questions adapt based on candidate's experience level
  - Deep dive into areas where candidates show expertise
  - Follow-up questions based on previous responses
  - Technical validation of claimed skills

- **Structured Interview Process**
  1. **Introduction Stage**
     - Get to know the candidate
     - Understand career goals
     - Assess communication skills

  2. **Technical Stage**
     - Validate technical knowledge
     - Assess problem-solving abilities
     - Evaluate coding expertise

  3. **Experience Stage**
     - Deep dive into past projects
     - Understanding of best practices
     - Technical decision-making process

  4. **Behavioral Stage**
     - Team collaboration skills
     - Problem-solving approach
     - Leadership potential

  5. **Closing Stage**
     - Career aspirations
     - Company fit assessment
     - Next steps

### For Candidates
- **Consistent Experience**
  - Fair and unbiased evaluation
  - Same opportunity to showcase skills
  - No interviewer mood dependencies

- **Flexible Timing**
  - Complete interviews at their convenience
  - No scheduling constraints
  - Reduced interview anxiety

- **Immediate Feedback**
  - Get instant feedback on responses
  - Understanding of evaluation criteria
  - Areas for improvement

## 🎯 Key Features

### Smart Interview Management
- Resume parsing and analysis
- Dynamic question generation
- Real-time response evaluation
- Comprehensive scoring system
- Detailed interview summaries

### Evaluation Metrics
- Technical knowledge depth
- Problem-solving abilities
- Communication skills
- Experience validation
- Overall candidate fit

### Interview Analytics
- Stage-wise performance breakdown
- Skill-based scoring
- Comparative analysis
- Trend identification

## 🚀 Getting Started

### Quick Setup
1. Get your API credentials
2. Install the system
3. Start conducting interviews

### Basic Usage
1. Upload candidate's resume
2. Start the interview session
3. Record candidate responses
4. Get detailed evaluation and summary

