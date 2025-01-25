from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import Dict
from pydantic import BaseModel
from .interview_bot import InterviewBot
import json

router = APIRouter()

# Store active interview sessions
interview_sessions: Dict[str, InterviewBot] = {}

class InterviewResponse(BaseModel):
    session_id: str
    response: str

class InterviewQuestion(BaseModel):
    question: str
    stage: str
    evaluation: Dict = None

@router.post("/interview/start", tags=["interview"])
async def start_interview(resume: str):
    """Start a new interview session"""
    try:
        interviewer = InterviewBot()
        session_id = str(len(interview_sessions) + 1)
        interview_sessions[session_id] = interviewer
        
        initial_question = interviewer.start_interview(resume)
        
        return {
            "session_id": session_id,
            "message": initial_question,
            "stage": "introduction"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interview/respond", tags=["interview"])
async def respond_to_question(response: InterviewResponse):
    """Get next interview question based on candidate's response"""
    try:
        interviewer = interview_sessions.get(response.session_id)
        if not interviewer:
            raise HTTPException(status_code=404, detail="Interview session not found")
        
        # Use process_response instead of get_next_question to get evaluation
        result = interviewer.process_response(
            resume_text=interviewer.current_resume,
            candidate_response=response.response
        )
        
        return {
            "question": result["question"],
            "stage": result["stage"],
            "evaluation": result["evaluation"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interview/upload-resume", tags=["interview"])
async def upload_resume(file: UploadFile = File(...)):
    """Upload and process a resume file"""
    try:
        print(f"Received file: {file.filename}")
        contents = await file.read()
        
        temp_path = f"temp_{file.filename}"
        print(f"Saving to temp path: {temp_path}")
        
        with open(temp_path, "wb") as f:
            f.write(contents)
        
        interviewer = InterviewBot()
        resume_text = interviewer.load_resume(temp_path)
        
        import os
        os.remove(temp_path)
        
        session_id = str(len(interview_sessions) + 1)
        interview_sessions[session_id] = interviewer
        interviewer.current_resume = resume_text
        
        initial_question = (
            "Hello! I'm Natasha, your AI interviewer today. "
            "I'd love to get to know you better as a person. "
            "Could you please tell me a bit about yourself?"
        )
        
        print(f"Successfully processed file, session_id: {session_id}")
        
        return {
            "session_id": session_id,
            "message": initial_question,
            "stage": "introduction"
        }
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/interview/{session_id}", tags=["interview"])
async def end_interview(session_id: str):
    """End an interview session and return final summary"""
    try:
        interviewer = interview_sessions.get(session_id)
        if not interviewer:
            raise HTTPException(status_code=404, detail="Interview session not found")
        
        # Get the summary before ending the session
        summary = interviewer.get_interview_summary(early_termination=True)
        
        # Clean up the session
        del interview_sessions[session_id]
        
        return {
            "message": "Interview session ended successfully",
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/interview/{session_id}/summary", tags=["interview"])
async def get_interview_summary(session_id: str):
    """Get the interview summary with scores"""
    try:
        interviewer = interview_sessions.get(session_id)
        if not interviewer:
            raise HTTPException(status_code=404, detail="Interview session not found")
        
        summary = interviewer.get_interview_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 