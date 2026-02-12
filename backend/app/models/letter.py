from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database import Base


class LetterType(str, enum.Enum):
    """Types of medical letters"""
    REFERRAL = "referral"
    CONSULTATION = "consultation"
    DISCHARGE_SUMMARY = "discharge_summary"
    MEDICAL_REPORT = "medical_report"
    PRESCRIPTION = "prescription"
    SICK_NOTE = "sick_note"
    OTHER = "other"


class LetterStatus(str, enum.Enum):
    """Letter generation status"""
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class Letter(Base):
    """Letter model for AI-generated medical letters"""
    __tablename__ = "letters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    recording_id = Column(UUID(as_uuid=True), ForeignKey("recordings.id"), nullable=True, index=True)
    
    # Letter information
    letter_type = Column(SQLEnum(LetterType), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    
    # Patient information (optional)
    patient_name = Column(String(255), nullable=True)
    patient_age = Column(String(50), nullable=True)
    patient_gender = Column(String(50), nullable=True)
    
    # Additional metadata
    status = Column(SQLEnum(LetterStatus), default=LetterStatus.GENERATING, nullable=False)
    prompt_used = Column(Text, nullable=True)  # Store the prompt for reference
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="letters")
    recording = relationship("Recording", back_populates="letters")
    
    def __repr__(self):
        return f"<Letter {self.id} - {self.title}>"
