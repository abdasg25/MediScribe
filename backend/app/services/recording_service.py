"""
Recording service for managing audio recordings and transcriptions.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
import os

from app.models.recording import Recording, RecordingStatus
from app.schemas.recording import RecordingCreate, RecordingUpdate
from app.core.logger import logger
from app.core.exceptions import NotFoundError, DatabaseError
from app.services.transcription_service import TranscriptionService


class RecordingService:
    """Service for managing recordings"""
    
    @staticmethod
    def create_recording(
        db: Session,
        user_id: UUID,
        filename: str,
        file_path: str,
        file_size: int
    ) -> Recording:
        """
        Create a new recording entry in database.
        
        Args:
            db: Database session
            user_id: ID of the user who uploaded the recording
            filename: Original filename
            file_path: Path where file is stored
            file_size: Size of file in bytes
            
        Returns:
            Recording: Created recording object
        """
        try:
            recording = Recording(
                user_id=user_id,
                filename=filename,
                file_path=file_path,
                file_size=file_size,
                status=RecordingStatus.UPLOADING
            )
            
            db.add(recording)
            db.commit()
            db.refresh(recording)
            
            logger.info(f"Recording created: {recording.id} for user {user_id}")
            return recording
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create recording: {str(e)}")
            raise DatabaseError(f"Failed to create recording: {str(e)}")
    
    @staticmethod
    def get_recording(db: Session, recording_id: UUID, user_id: UUID) -> Recording:
        """
        Get a recording by ID (with user ownership check).
        
        Args:
            db: Database session
            recording_id: ID of the recording
            user_id: ID of the user making the request
            
        Returns:
            Recording: Recording object
            
        Raises:
            NotFoundError: If recording not found or doesn't belong to user
        """
        recording = db.query(Recording).filter(
            Recording.id == recording_id,
            Recording.user_id == user_id
        ).first()
        
        if not recording:
            logger.warning(f"Recording {recording_id} not found for user {user_id}")
            raise NotFoundError("Recording not found")
        
        return recording
    
    @staticmethod
    def get_user_recordings(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Recording], int]:
        """
        Get all recordings for a user with pagination.
        
        Args:
            db: Database session
            user_id: ID of the user
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            tuple: (list of recordings, total count)
        """
        query = db.query(Recording).filter(Recording.user_id == user_id)
        total = query.count()
        recordings = query.order_by(Recording.created_at.desc()).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(recordings)} recordings for user {user_id}")
        return recordings, total
    
    @staticmethod
    def update_recording(
        db: Session,
        recording_id: UUID,
        user_id: UUID,
        update_data: RecordingUpdate
    ) -> Recording:
        """
        Update a recording.
        
        Args:
            db: Database session
            recording_id: ID of the recording to update
            user_id: ID of the user making the request
            update_data: Updated data
            
        Returns:
            Recording: Updated recording object
        """
        recording = RecordingService.get_recording(db, recording_id, user_id)
        
        try:
            for field, value in update_data.dict(exclude_unset=True).items():
                setattr(recording, field, value)
            
            recording.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(recording)
            
            logger.info(f"Recording {recording_id} updated")
            return recording
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update recording {recording_id}: {str(e)}")
            raise DatabaseError(f"Failed to update recording: {str(e)}")
    
    @staticmethod
    def delete_recording(db: Session, recording_id: UUID, user_id: UUID) -> bool:
        """
        Delete a recording and its associated file.
        
        Args:
            db: Database session
            recording_id: ID of the recording to delete
            user_id: ID of the user making the request
            
        Returns:
            bool: True if deleted successfully
        """
        recording = RecordingService.get_recording(db, recording_id, user_id)
        
        try:
            # Delete file from disk
            if os.path.exists(recording.file_path):
                os.remove(recording.file_path)
                logger.info(f"Deleted file: {recording.file_path}")
            
            # Delete from database
            db.delete(recording)
            db.commit()
            
            logger.info(f"Recording {recording_id} deleted")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete recording {recording_id}: {str(e)}")
            raise DatabaseError(f"Failed to delete recording: {str(e)}")
    
    @staticmethod
    def transcribe_recording(
        db: Session,
        recording_id: UUID,
        user_id: UUID,
        language: Optional[str] = None
    ) -> Recording:
        """
        Transcribe a recording using Whisper AI.
        
        Args:
            db: Database session
            recording_id: ID of the recording to transcribe
            user_id: ID of the user making the request
            language: Optional language code
            
        Returns:
            Recording: Updated recording with transcription
        """
        recording = RecordingService.get_recording(db, recording_id, user_id)
        
        try:
            # Update status to processing
            recording.status = RecordingStatus.PROCESSING
            db.commit()
            
            logger.info(f"Starting transcription for recording {recording_id}")
            
            # Transcribe using Whisper
            result = TranscriptionService.transcribe_audio(
                recording.file_path,
                language=language
            )
            
            # Update recording with transcription
            recording.transcription = result["text"]
            recording.duration = int(result.get("duration", 0))
            recording.status = RecordingStatus.COMPLETED
            recording.transcribed_at = datetime.utcnow()
            recording.error_message = None
            
            db.commit()
            db.refresh(recording)
            
            logger.info(f"Transcription completed for recording {recording_id}")
            return recording
            
        except Exception as e:
            db.rollback()
            logger.error(f"Transcription failed for recording {recording_id}: {str(e)}")
            
            # Update recording with error
            recording.status = RecordingStatus.FAILED
            recording.error_message = str(e)
            db.commit()
            
            raise DatabaseError(f"Transcription failed: {str(e)}")
