from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class LetterType(str, Enum):
    """Types of medical letters"""
    REFERRAL = "referral"
    CONSULTATION = "consultation"
    DISCHARGE_SUMMARY = "discharge_summary"
    MEDICAL_REPORT = "medical_report"
    PRESCRIPTION = "prescription"
    SICK_NOTE = "sick_note"
    OTHER = "other"


class LetterStatus(str, Enum):
    """Letter generation status"""
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class LetterBase(BaseModel):
    """Base letter schema"""
    letter_type: LetterType = Field(..., description="Type of medical letter")
    title: str = Field(..., min_length=1, max_length=255, description="Letter title")
    patient_name: Optional[str] = Field(None, max_length=255, description="Patient name")
    patient_age: Optional[str] = Field(None, max_length=50, description="Patient age")
    patient_gender: Optional[str] = Field(None, max_length=50, description="Patient gender")


class LetterCreate(LetterBase):
    """Schema for creating a new letter"""
    recording_id: Optional[UUID] = Field(None, description="Optional recording ID to use as source")
    custom_prompt: Optional[str] = Field(None, description="Custom prompt/notes for letter generation")


class LetterUpdate(BaseModel):
    """Schema for updating a letter"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    content: Optional[str] = None
    patient_name: Optional[str] = None
    patient_age: Optional[str] = None
    patient_gender: Optional[str] = None


class LetterResponse(BaseModel):
    """Schema for letter response"""
    id: UUID
    user_id: UUID
    recording_id: Optional[UUID]
    letter_type: LetterType
    title: str
    content: str
    patient_name: Optional[str]
    patient_age: Optional[str]
    patient_gender: Optional[str]
    status: LetterStatus
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str]
    
    class Config:
        from_attributes = True


class LetterListResponse(BaseModel):
    """Schema for list of letters"""
    letters: list[LetterResponse]
    total: int
    page: int
    page_size: int


class GenerateLetterRequest(BaseModel):
    """Schema for letter generation request"""
    letter_type: LetterType = Field(..., description="Type of medical letter to generate")
    transcription: Optional[str] = Field(None, description="Transcription text to use")
    recording_id: Optional[UUID] = Field(None, description="Recording ID to use transcription from")
    patient_name: Optional[str] = Field(None, description="Patient name")
    patient_age: Optional[str] = Field(None, description="Patient age")
    patient_gender: Optional[str] = Field(None, description="Patient gender")
    custom_instructions: Optional[str] = Field(None, description="Additional instructions for the AI")
    
    class Config:
        json_schema_extra = {
            "example": {
                "letter_type": "consultation",
                "recording_id": "123e4567-e89b-12d3-a456-426614174000",
                "patient_name": "John Doe",
                "patient_age": "45",
                "patient_gender": "Male",
                "custom_instructions": "Focus on cardiovascular assessment"
            }
        }


class GenerateLetterResponse(BaseModel):
    """Schema for letter generation response"""
    letter_id: UUID
    content: str
    status: LetterStatus
    created_at: datetime
    
    class Config:
        from_attributes = True
