"""
API routes for audio recordings and transcriptions.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, BackgroundTasks
from fastapi import status as http_status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import os
import shutil
from pathlib import Path

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.recording import (
    RecordingResponse,
    RecordingListResponse,
    TranscriptionRequest,
    TranscriptionResponse,
)
from app.services.recording_service import RecordingService
from app.core.logger import logger
from app.core.exceptions import NotFoundError, ValidationError
from app.core.config import settings


router = APIRouter(prefix="/api/recordings", tags=["recordings"])

# Allowed audio file extensions
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB


@router.post("/upload", response_model=RecordingResponse, status_code=http_status.HTTP_201_CREATED)
async def upload_recording(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload an audio recording.
    
    - **file**: Audio file (mp3, wav, m4a, ogg, flac, webm)
    - Maximum file size: 100MB
    """
    # Validate file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        logger.warning(f"Invalid file type attempted: {file_extension}")
        raise ValidationError(
            f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    try:
        # Create uploads directory if it doesn't exist
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        filename = f"{current_user.id}_{file.filename}"
        file_path = upload_dir / filename
        
        # Save file
        logger.info(f"Saving uploaded file: {filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            os.remove(file_path)
            raise ValidationError(f"File size exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB")
        
        # Create recording entry
        recording = RecordingService.create_recording(
            db=db,
            user_id=current_user.id,
            filename=file.filename,
            file_path=str(file_path),
            file_size=file_size
        )
        
        logger.info(f"Recording uploaded successfully: {recording.id}")
        return recording
        
    except ValidationError:
        raise
    except Exception as e:
        # Clean up file if database operation fails
        if file_path.exists():
            os.remove(file_path)
        logger.error(f"Upload failed: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload failed: {str(e)}"
        )


@router.get("/", response_model=RecordingListResponse)
async def get_recordings(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all recordings for the current user with pagination.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (1-100)
    """
    recordings, total = RecordingService.get_user_recordings(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    page = (skip // limit) + 1 if limit > 0 else 1
    
    return RecordingListResponse(
        recordings=recordings,
        total=total,
        page=page,
        page_size=limit
    )


@router.get("/{recording_id}", response_model=RecordingResponse)
async def get_recording(
    recording_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific recording by ID.
    """
    recording = RecordingService.get_recording(
        db=db,
        recording_id=recording_id,
        user_id=current_user.id
    )
    return recording


@router.post("/{recording_id}/transcribe", response_model=TranscriptionResponse)
async def transcribe_recording(
    recording_id: UUID,
    language: Optional[str] = Query(None, description="Language code (e.g., 'en', 'es')"),
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Transcribe an audio recording using Whisper AI.
    
    - **recording_id**: ID of the recording to transcribe
    - **language**: Optional language code for transcription
    
    Note: Transcription may take a few seconds to minutes depending on file size.
    """
    try:
        recording = RecordingService.transcribe_recording(
            db=db,
            recording_id=recording_id,
            user_id=current_user.id,
            language=language
        )
        
        return TranscriptionResponse(
            recording_id=recording.id,
            transcription=recording.transcription,
            status=recording.status,
            transcribed_at=recording.transcribed_at
        )
        
    except NotFoundError:
        raise
    except Exception as e:
        logger.error(f"Transcription endpoint error: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete("/{recording_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_recording(
    recording_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a recording and its associated audio file.
    """
    RecordingService.delete_recording(
        db=db,
        recording_id=recording_id,
        user_id=current_user.id
    )
    return None
