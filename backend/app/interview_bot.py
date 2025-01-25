import os
from typing import List, Dict, Tuple, Optional
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
import google.generativeai as genai
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class InterviewBot:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            temperature=0.7,
            google_api_key=os.getenv('GOOGLE_API_KEY')
        )
        
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            input_key="candidate_response"
        )
        
        self.interview_stages = [
            "introduction",
            "technical",
            "experience",
            "behavioral",
            "closing"
        ]
        
        self.current_stage = 0
        self.current_resume = ""
        
        self.interview_prompt = PromptTemplate(
            input_variables=["resume_text", "stage", "candidate_response"],
            template="""
            You are an experienced HR interviewer conducting a technical interview. 
            Current resume:
            {resume_text}
            
            Current interview stage: {stage}
            
            Candidate's last response: {candidate_response}
            
            Based on the current stage and candidate's response, provide the next relevant question.
            For technical questions, dive deeper if the candidate's response shows expertise.
            If the response is unclear, ask for clarification.
            Keep your responses conversational and professional.
            """
        )
        
        self.stage_interaction_count = 0
        self.max_interactions_per_stage = 3
        self.response_scores = []
        self.scoring_weights = {
            "introduction": 0.15,
            "technical": 0.35,
            "experience": 0.25,
            "behavioral": 0.20,
            "closing": 0.05
        }
        self.previous_question = None

    def load_resume(self, file_path: str) -> str:
        """Load and extract text from resume"""
        try:
            if file_path.endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            else:
                raise ValueError("Unsupported file format. Please use PDF")
            
            documents = loader.load()
            return " ".join([doc.page_content for doc in documents])
        except Exception as e:
            raise Exception(f"Error loading resume: {str(e)}")

    def start_interview(self, resume_text: str) -> str:
        """Start the interview with introduction"""
        self.current_resume = resume_text
        return (
            "Hello! I'm your interviewer today. I've reviewed your resume, "
            "and I'd like to learn more about you. Could you tell me about "
            "your background and what interests you about this position?"
        )

    def get_next_question(self, resume_text: str, candidate_response: str) -> str:
        """Get next question based on current stage and candidate response"""
        try:
            current_stage = self.interview_stages[self.current_stage]
            
            # Check if we've reached max interactions for current stage
            if self.stage_interaction_count >= self.max_interactions_per_stage:
                if current_stage != "closing":
                    self.current_stage += 1
                    self.stage_interaction_count = 0
                    current_stage = self.interview_stages[self.current_stage]
                    logger.debug(f"Moving to next stage due to max interactions: {current_stage}")
            
            # Analyze if we should move to the next stage based on response
            stage_transition_prompt = f"""
            You are an AI analyzing interview responses.
            Current stage: {current_stage}
            Candidate's response: {candidate_response}
            
            Determine if we should move to the next stage based on:
            - Introduction stage: Have they covered their background and education?
            - Technical stage: Have they demonstrated their technical knowledge?
            - Experience stage: Have they explained their project implementations?
            - Behavioral stage: Have they shown their soft skills and problem-solving approach?
            
            Respond with ONLY 'yes' to move to next stage, or 'no' to continue current stage.
            """
            
            transition_response = self.llm.invoke(stage_transition_prompt)
            should_transition = transition_response.content.strip().lower() == 'yes'
            
            if should_transition and current_stage != "closing":
                self.current_stage += 1
                self.stage_interaction_count = 0
                current_stage = self.interview_stages[self.current_stage]
                logger.debug(f"Moving to next stage: {current_stage}")

            # Generate question based on current stage and previous response
            stage_prompts = {
                "introduction": """
                You are an HR interviewer named Natasha conducting a professional interview.
                Previous response: {candidate_response}
                
                Generate a natural follow-up question focusing on:
                - Educational background
                - Academic achievements
                - General professional background
                - Career journey and aspirations
                
                RULES:
                - Keep questions professional and focused
                - Make it conversational and natural
                - Don't mention interview stages
                - One clear question at a time
                - Consider the candidate's previous response
                
                Respond with ONLY the question, nothing else.
                """,
                
                "technical": """
                You are a technical interviewer.
                Resume: {resume_text}
                Previous response: {candidate_response}
                
                Generate a technical follow-up question that:
                - Builds upon their previous response
                - Assesses specific technical skills mentioned in their resume
                - Tests depth of technical knowledge
                - Focuses on core technologies they've worked with
                
                Keep questions specific and technical.
                Respond with ONLY the question, nothing else.
                """,
                
                "experience": """
                You are a technical interviewer.
                Resume: {resume_text}
                Previous response: {candidate_response}
                
                Generate a follow-up question about:
                - Specific projects they've mentioned
                - Technical challenges and solutions
                - Implementation details
                - Real-world application of their skills
                - Impact and results of their work
                
                Focus on practical experience and implementation.
                Respond with ONLY the question, nothing else.
                """,
                
                "behavioral": """
                You are an HR interviewer.
                Previous response: {candidate_response}
                
                Generate a natural follow-up behavioral question that assesses:
                - Problem-solving approach
                - Team collaboration
                - Handling challenges
                - Leadership qualities
                - Conflict resolution
                
                Use STAR (Situation, Task, Action, Result) format.
                Consider their previous response for context.
                Respond with ONLY the question, nothing else.
                """,
                
                "closing": """
                You are an HR interviewer wrapping up the interview.
                Previous response: {candidate_response}
                
                Generate a closing question about:
                - Role clarification
                - Company culture
                - Next steps
                - Start date availability
                - Any final questions
                
                Keep it professional and welcoming.
                Respond with ONLY the question, nothing else.
                """
            }

            # Format the prompt with the candidate's response and resume
            prompt = stage_prompts[current_stage].format(
                candidate_response=candidate_response,
                resume_text=resume_text if current_stage in ["technical", "experience"] else ""
            )
            
            response = self.llm.invoke(prompt)
            question = response.content.strip()
            
            # Increment interaction count
            self.stage_interaction_count += 1
            
            logger.debug(f"Current stage: {current_stage}")
            logger.debug(f"Generated question: {question}")
            
            return question
            
        except Exception as e:
            logger.error(f"Error in get_next_question: {str(e)}")
            raise 

    def evaluate_response(self, candidate_response: str, question: str) -> Dict:
        """
        Evaluate candidate response and return scoring details
        """
        current_stage = self.interview_stages[self.current_stage]
        
        scoring_prompt = f"""
        You are an expert interview evaluator. Evaluate the following candidate response:
        
        Stage: {current_stage}
        Question Asked: {question}
        Candidate Response: {candidate_response}
        
        Score the response on these criteria (0-10 scale, use 0 if not applicable):
        1. Relevance: How directly does it answer the question?
        2. Depth: How detailed and thorough is the response?
        3. Clarity: How well-structured and clear is the communication?
        4. Technical Accuracy: How technically sound is the response? (use 0 for non-technical questions)
        
        Provide your evaluation in the following format ONLY:
        RELEVANCE_SCORE: [number between 0-10]
        DEPTH_SCORE: [number between 0-10]
        CLARITY_SCORE: [number between 0-10]
        TECHNICAL_SCORE: [number between 0-10]
        FEEDBACK: [Brief 1-2 sentence feedback]
        """
        
        try:
            response = self.llm.invoke(scoring_prompt)
            eval_text = response.content.strip().split('\n')
            
            scores = {}
            feedback = ""
            
            for line in eval_text:
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip()
                    
                    if key == 'FEEDBACK':
                        feedback = value
                    else:
                        # Convert N/A or any non-numeric value to 0
                        try:
                            score = float(value)
                            # Ensure score is between 0 and 10
                            score = max(0, min(10, score))
                        except (ValueError, TypeError):
                            score = 0.0
                        scores[key.lower().replace('_score', '')] = score
            
            # Ensure all required scores exist
            required_scores = ['relevance', 'depth', 'clarity', 'technical']
            for score_key in required_scores:
                if score_key not in scores:
                    scores[score_key] = 0.0
            
            # Calculate weighted score based on stage
            if current_stage == 'technical':
                weights = {'relevance': 0.25, 'depth': 0.3, 'clarity': 0.15, 'technical': 0.3}
            elif current_stage == 'experience':
                weights = {'relevance': 0.3, 'depth': 0.3, 'clarity': 0.2, 'technical': 0.2}
            else:
                weights = {'relevance': 0.4, 'depth': 0.3, 'clarity': 0.3, 'technical': 0.0}
            
            total_score = sum(scores[k] * v for k, v in weights.items())
            
            evaluation = {
                'stage': current_stage,
                'question': question,
                'detailed_scores': scores,
                'overall_score': round(total_score, 2),
                'feedback': feedback or "No feedback provided"
            }
            
            self.response_scores.append(evaluation)
            logger.debug(f"Evaluation completed: {evaluation}")
            return evaluation
            
        except Exception as e:
            logger.error(f"Error in evaluate_response: {str(e)}")
            # Return a default evaluation in case of error
            default_scores = {
                'relevance': 0.0,
                'depth': 0.0,
                'clarity': 0.0,
                'technical': 0.0
            }
            return {
                'stage': current_stage,
                'question': question,
                'detailed_scores': default_scores,
                'overall_score': 0.0,
                'feedback': f"Error evaluating response: {str(e)}"
            }

    def get_interview_summary(self) -> Dict:
        """
        Generate comprehensive interview summary with scores
        """
        if not self.response_scores:
            return {
                "overall_score": 0,
                "stage_scores": {},
                "summary": "No responses to evaluate"
            }
        
        # Calculate stage averages
        stage_scores = {}
        for stage in self.interview_stages:
            stage_responses = [r for r in self.response_scores if r['stage'] == stage]
            if stage_responses:
                stage_scores[stage] = round(
                    sum(r['overall_score'] for r in stage_responses) / len(stage_responses),
                    2
                )
            else:
                stage_scores[stage] = 0
        
        # Calculate weighted total score
        total_score = sum(
            stage_scores[stage] * self.scoring_weights[stage]
            for stage in self.interview_stages
        )
        
        summary_prompt = f"""
        Generate a brief interview summary based on these scores:
        
        Stage Scores:
        {chr(10).join(f"{stage.capitalize()}: {score}/10" for stage, score in stage_scores.items())}
        
        Overall Score: {round(total_score, 2)}/10
        
        Provide a concise summary with:
        1. Overall assessment (2-3 sentences)
        2. Key strengths (2-3 bullet points)
        3. Areas for improvement (1-2 bullet points)
        """
        
        try:
            response = self.llm.invoke(summary_prompt)
            
            return {
                "overall_score": round(total_score, 2),
                "stage_scores": stage_scores,
                "detailed_scores": self.response_scores,
                "summary": response.content.strip()
            }
            
        except Exception as e:
            logger.error(f"Error generating interview summary: {str(e)}")
            return {
                "overall_score": round(total_score, 2),
                "stage_scores": stage_scores,
                "detailed_scores": self.response_scores,
                "summary": "Error generating summary"
            }

    def process_response(self, resume_text: str, candidate_response: str) -> Dict:
        """
        Process candidate response and return next question with evaluation
        """
        # Evaluate previous response if there was a question
        evaluation = None
        if self.previous_question and candidate_response:
            evaluation = self.evaluate_response(candidate_response, self.previous_question)
        
        # Get next question
        next_question = self.get_next_question(resume_text, candidate_response)
        
        # Store question for next evaluation
        self.previous_question = next_question
        
        return {
            "question": next_question,
            "evaluation": evaluation,
            "stage": self.interview_stages[self.current_stage]
        } 