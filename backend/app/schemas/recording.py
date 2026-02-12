from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class RecordingStatus(str, Enum):
    """Recording processing status"""
    UPLOADING = "uploading"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class RecordingBase(BaseModel):
    """Base recording schema"""
    filename: str = Field(..., description="Original filename of the audio file")


class RecordingCreate(RecordingBase):
    """Schema for creating a new recording"""
    pass


class RecordingUpdate(BaseModel):
    """Schema for updating a recording"""
    status: Optional[RecordingStatus] = None
    transcription: Optional[str] = None
    error_message: Optional[str] = None


class RecordingResponse(RecordingBase):
    """Schema for recording response"""
    id: UUID
    user_id: UUID
    filename: str
    file_path: str
    file_size: int
    duration: Optional[int] = None
    transcription: Optional[str] = None
    status: RecordingStatus
    created_at: datetime
    updated_at: datetime
    transcribed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True


class RecordingListResponse(BaseModel):
    """Schema for list of recordings"""
    recordings: list[RecordingResponse]
    total: int
    page: int
    page_size: int


class TranscriptionRequest(BaseModel):
    """Schema for transcription request"""
    recording_id: UUID = Field(..., description="ID of the recording to transcribe")


class TranscriptionResponse(BaseModel):
    """Schema for transcription response"""
    recording_id: UUID
    transcription: str
    status: RecordingStatus
    transcribed_at: datetime
    
    class Config:
        from_attributes = True
