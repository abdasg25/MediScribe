"""
API routes for medical letter generation and management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from fastapi import status as http_status
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.letter import (
    LetterResponse,
    LetterListResponse,
    GenerateLetterRequest,
    GenerateLetterResponse,
    LetterUpdate,
)
from app.services.letter_service import LetterService
from app.core.logger import logger
from app.core.exceptions import NotFoundError, ValidationError


router = APIRouter(prefix="/api/letters", tags=["letters"])


@router.post("/generate", response_model=GenerateLetterResponse, status_code=http_status.HTTP_201_CREATED)
async def generate_letter(
    request_data: GenerateLetterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate a medical letter using AI (Qwen3 via Ollama).
    
    - **letter_type**: Type of letter to generate (referral, consultation, discharge_summary, etc.)
    - **transcription**: Optional transcription text to use (if not providing recording_id)
    - **recording_id**: Optional recording ID to use transcription from
    - **patient_name**: Patient's name
    - **patient_age**: Patient's age
    - **patient_gender**: Patient's gender
    - **custom_instructions**: Additional context or instructions for the AI
    
    **Note:** Generation may take 10-60 seconds depending on your system and model size.
    """
    try:
        letter = LetterService.generate_letter(
            db=db,
            user_id=current_user.id,
            request_data=request_data
        )
        
        return GenerateLetterResponse(
            letter_id=letter.id,
            content=letter.content,
            status=letter.status,
            created_at=letter.created_at
        )
        
    except (NotFoundError, ValidationError):
        raise
    except Exception as e:
        logger.error(f"Letter generation endpoint error: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/", response_model=LetterListResponse)
async def get_letters(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all letters for the current user with pagination.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (1-100)
    """
    letters, total = LetterService.get_user_letters(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )
    
    page = (skip // limit) + 1 if limit > 0 else 1
    
    return LetterListResponse(
        letters=letters,
        total=total,
        page=page,
        page_size=limit
    )


@router.get("/{letter_id}", response_model=LetterResponse)
async def get_letter(
    letter_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific letter by ID.
    """
    letter = LetterService.get_letter(
        db=db,
        letter_id=letter_id,
        user_id=current_user.id
    )
    return letter


@router.patch("/{letter_id}", response_model=LetterResponse)
async def update_letter(
    letter_id: UUID,
    update_data: LetterUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a letter (e.g., edit content, patient information).
    """
    letter = LetterService.update_letter(
        db=db,
        letter_id=letter_id,
        user_id=current_user.id,
        update_data=update_data
    )
    return letter


@router.delete("/{letter_id}", status_code=http_status.HTTP_204_NO_CONTENT)
async def delete_letter(
    letter_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a letter.
    """
    LetterService.delete_letter(
        db=db,
        letter_id=letter_id,
        user_id=current_user.id
    )
    return None
