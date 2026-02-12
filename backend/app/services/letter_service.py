"""
Letter service for managing medical letters and AI generation.
"""

from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.models.letter import Letter, LetterType, LetterStatus
from app.models.recording import Recording
from app.schemas.letter import LetterCreate, LetterUpdate, GenerateLetterRequest
from app.core.logger import logger
from app.core.exceptions import NotFoundError, DatabaseError, ValidationError
from app.services.ollama_service import OllamaService


class LetterService:
    """Service for managing letters and AI generation"""
    
    # Letter templates and prompts
    LETTER_TEMPLATES = {
        LetterType.REFERRAL: {
            "title": "Referral Letter",
            "system_message": "You are an experienced medical doctor writing a professional referral letter to a specialist. Be concise, factual, and include relevant medical history.",
            "prompt_template": """Write a professional medical referral letter with the following information:

Patient Name: {patient_name}
Patient Age: {patient_age}
Patient Gender: {patient_gender}

Clinical Notes from Consultation:
{transcription}

Additional Instructions: {custom_instructions}

Generate a well-structured referral letter that includes:
1. Patient demographics
2. Reason for referral
3. Relevant medical history
4. Current symptoms/findings
5. Tests/investigations done
6. Specific questions for the specialist

Format the letter professionally with appropriate medical terminology."""
        },
        LetterType.CONSULTATION: {
            "title": "Consultation Note",
            "system_message": "You are an experienced medical doctor documenting a patient consultation. Be thorough, organized, and use proper medical documentation format (SOAP notes when appropriate).",
            "prompt_template": """Write a comprehensive consultation note based on the following information:

Patient Name: {patient_name}
Patient Age: {patient_age}
Patient Gender: {patient_gender}

Consultation Recording Transcription:
{transcription}

Additional Notes: {custom_instructions}

Generate a detailed consultation note that includes:
1. Chief Complaint
2. History of Present Illness
3. Past Medical History (if mentioned)
4. Physical Examination Findings
5. Assessment/Diagnosis
6. Plan/Treatment
7. Follow-up recommendations

Use SOAP (Subjective, Objective, Assessment, Plan) format where appropriate."""
        },
        LetterType.DISCHARGE_SUMMARY: {
            "title": "Discharge Summary",
            "system_message": "You are an experienced medical doctor writing a hospital discharge summary. Be comprehensive and include all relevant information for continuity of care.",
            "prompt_template": """Write a comprehensive discharge summary with the following information:

Patient Name: {patient_name}
Patient Age: {patient_age}
Patient Gender: {patient_gender}

Clinical Information:
{transcription}

Additional Details: {custom_instructions}

Generate a discharge summary that includes:
1. Admission Date and Discharge Date
2. Admitting Diagnosis
3. Discharge Diagnosis
4. Hospital Course
5. Procedures Performed
6. Discharge Medications
7. Follow-up Instructions
8. Discharge Condition

Format professionally and include all relevant medical details."""
        },
        LetterType.MEDICAL_REPORT: {
            "title": "Medical Report",
            "system_message": "You are an experienced medical doctor writing a detailed medical report. Be objective, thorough, and include all relevant clinical findings.",
            "prompt_template": """Write a detailed medical report based on the following information:

Patient Name: {patient_name}
Patient Age: {patient_age}
Patient Gender: {patient_gender}

Clinical Information:
{transcription}

Additional Context: {custom_instructions}

Generate a comprehensive medical report that includes:
1. Patient demographics
2. Medical history
3. Clinical findings
4. Diagnostic test results (if any)
5. Medical opinion/assessment
6. Recommendations

Format professionally with appropriate medical terminology."""
        },
        LetterType.PRESCRIPTION: {
            "title": "Prescription",
            "system_message": "You are an experienced medical doctor writing a prescription. Be clear, specific, and include all necessary details for safe medication dispensing.",
            "prompt_template": """Write a medical prescription based on the following information:

Patient Name: {patient_name}
Patient Age: {patient_age}
Patient Gender: {patient_gender}

Clinical Notes:
{transcription}

Additional Instructions: {custom_instructions}

Generate a clear prescription that includes:
1. Patient demographics
2. Date
3. Diagnosis/Indication
4. Medications (generic and brand names)
5. Dosage and frequency
6. Duration of treatment
7. Special instructions
8. Any warnings or precautions

Format as a professional medical prescription."""
        },
        LetterType.SICK_NOTE: {
            "title": "Medical Certificate / Sick Note",
            "system_message": "You are an experienced medical doctor writing a sick note/medical certificate for an employer or school. Be professional and include only necessary information.",
            "prompt_template": """Write a professional sick note/medical certificate with the following information:

Patient Name: {patient_name}
Patient Age: {patient_age}
Patient Gender: {patient_gender}

Clinical Information:
{transcription}

Additional Details: {custom_instructions}

Generate a medical certificate that includes:
1. Patient name and date of birth
2. Date of consultation
3. Medical condition (can be general if privacy is needed)
4. Recommended period of absence from work/school
5. Any restrictions or recommendations
6. Doctor's credentials

Keep it professional and concise."""
        },
        LetterType.OTHER: {
            "title": "Medical Letter",
            "system_message": "You are an experienced medical doctor writing a professional medical letter. Follow standard medical documentation practices.",
            "prompt_template": """Write a professional medical letter based on the following information:

Patient Name: {patient_name}
Patient Age: {patient_age}
Patient Gender: {patient_gender}

Information:
{transcription}

Specific Requirements: {custom_instructions}

Generate a well-structured medical letter addressing all relevant points professionally."""
        }
    }
    
    @staticmethod
    def create_letter(
        db: Session,
        user_id: UUID,
        letter_data: LetterCreate
    ) -> Letter:
        """
        Create a new letter entry in database.
        
        Args:
            db: Database session
            user_id: ID of the user creating the letter
            letter_data: Letter creation data
            
        Returns:
            Letter: Created letter object
        """
        try:
            letter = Letter(
                user_id=user_id,
                recording_id=letter_data.recording_id,
                letter_type=letter_data.letter_type,
                title=letter_data.title,
                content="",  # Will be filled by generation
                patient_name=letter_data.patient_name,
                patient_age=letter_data.patient_age,
                patient_gender=letter_data.patient_gender,
                status=LetterStatus.GENERATING
            )
            
            db.add(letter)
            db.commit()
            db.refresh(letter)
            
            logger.info(f"Letter created: {letter.id} for user {user_id}")
            return letter
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create letter: {str(e)}")
            raise DatabaseError(f"Failed to create letter: {str(e)}")
    
    @staticmethod
    def get_letter(db: Session, letter_id: UUID, user_id: UUID) -> Letter:
        """
        Get a letter by ID (with user ownership check).
        
        Args:
            db: Database session
            letter_id: ID of the letter
            user_id: ID of the user making the request
            
        Returns:
            Letter: Letter object
            
        Raises:
            NotFoundError: If letter not found or doesn't belong to user
        """
        letter = db.query(Letter).filter(
            Letter.id == letter_id,
            Letter.user_id == user_id
        ).first()
        
        if not letter:
            logger.warning(f"Letter {letter_id} not found for user {user_id}")
            raise NotFoundError("Letter not found")
        
        return letter
    
    @staticmethod
    def get_user_letters(
        db: Session,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[List[Letter], int]:
        """
        Get all letters for a user with pagination.
        
        Args:
            db: Database session
            user_id: ID of the user
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            tuple: (list of letters, total count)
        """
        query = db.query(Letter).filter(Letter.user_id == user_id)
        total = query.count()
        letters = query.order_by(Letter.created_at.desc()).offset(skip).limit(limit).all()
        
        logger.info(f"Retrieved {len(letters)} letters for user {user_id}")
        return letters, total
    
    @staticmethod
    def update_letter(
        db: Session,
        letter_id: UUID,
        user_id: UUID,
        update_data: LetterUpdate
    ) -> Letter:
        """
        Update a letter.
        
        Args:
            db: Database session
            letter_id: ID of the letter to update
            user_id: ID of the user making the request
            update_data: Updated data
            
        Returns:
            Letter: Updated letter object
        """
        letter = LetterService.get_letter(db, letter_id, user_id)
        
        try:
            for field, value in update_data.dict(exclude_unset=True).items():
                setattr(letter, field, value)
            
            letter.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(letter)
            
            logger.info(f"Letter {letter_id} updated")
            return letter
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to update letter {letter_id}: {str(e)}")
            raise DatabaseError(f"Failed to update letter: {str(e)}")
    
    @staticmethod
    def delete_letter(db: Session, letter_id: UUID, user_id: UUID) -> bool:
        """
        Delete a letter.
        
        Args:
            db: Database session
            letter_id: ID of the letter to delete
            user_id: ID of the user making the request
            
        Returns:
            bool: True if deleted successfully
        """
        letter = LetterService.get_letter(db, letter_id, user_id)
        
        try:
            db.delete(letter)
            db.commit()
            
            logger.info(f"Letter {letter_id} deleted")
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to delete letter {letter_id}: {str(e)}")
            raise DatabaseError(f"Failed to delete letter: {str(e)}")
    
    @staticmethod
    def generate_letter(
        db: Session,
        user_id: UUID,
        request_data: GenerateLetterRequest
    ) -> Letter:
        """
        Generate a medical letter using AI.
        
        Args:
            db: Database session
            user_id: ID of the user requesting generation
            request_data: Letter generation request data
            
        Returns:
            Letter: Generated letter object
        """
        try:
            # Get transcription text
            transcription = request_data.transcription or ""
            
            if request_data.recording_id and not transcription:
                # Fetch transcription from recording
                recording = db.query(Recording).filter(
                    Recording.id == request_data.recording_id,
                    Recording.user_id == user_id
                ).first()
                
                if not recording:
                    raise NotFoundError("Recording not found")
                
                if not recording.transcription:
                    raise ValidationError("Recording has no transcription yet")
                
                transcription = recording.transcription
            
            if not transcription:
                raise ValidationError("No transcription provided")
            
            # Get letter template
            template = LetterService.LETTER_TEMPLATES.get(request_data.letter_type)
            if not template:
                raise ValidationError(f"Invalid letter type: {request_data.letter_type}")
            
            # Format prompt
            prompt = template["prompt_template"].format(
                patient_name=request_data.patient_name or "[Patient Name]",
                patient_age=request_data.patient_age or "[Age]",
                patient_gender=request_data.patient_gender or "[Gender]",
                transcription=transcription,
                custom_instructions=request_data.custom_instructions or "None"
            )
            
            # Create letter entry with GENERATING status
            letter = Letter(
                user_id=user_id,
                recording_id=request_data.recording_id,
                letter_type=request_data.letter_type,
                title=template["title"],
                content="",
                patient_name=request_data.patient_name,
                patient_age=request_data.patient_age,
                patient_gender=request_data.patient_gender,
                status=LetterStatus.GENERATING,
                prompt_used=prompt
            )
            
            db.add(letter)
            db.commit()
            db.refresh(letter)
            
            logger.info(f"Generating letter {letter.id} with AI")
            
            # Generate content using Ollama
            generated_content = OllamaService.generate_completion(
                prompt=prompt,
                system_message=template["system_message"]
            )
            
            # Update letter with generated content
            letter.content = generated_content
            letter.status = LetterStatus.COMPLETED
            letter.updated_at = datetime.utcnow()
            
            db.commit()
            db.refresh(letter)
            
            logger.info(f"Letter {letter.id} generated successfully")
            return letter
            
        except (NotFoundError, ValidationError):
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Letter generation failed: {str(e)}")
            
            # Update letter with error if it was created
            if 'letter' in locals():
                letter.status = LetterStatus.FAILED
                letter.error_message = str(e)
                db.commit()
            
            raise DatabaseError(f"Letter generation failed: {str(e)}")
