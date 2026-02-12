"""
Transcription service using OpenAI Whisper for speech-to-text conversion.
"""

import whisper
import os
from pathlib import Path
from typing import Optional
from app.core.logger import logger
from app.core.exceptions import DatabaseError


class TranscriptionService:
    """Service for transcribing audio files using Whisper AI"""
    
    _model = None
    _model_name = "base"  # Options: tiny, base, small, medium, large
    
    @classmethod
    def get_model(cls):
        """
        Get or load the Whisper model (lazy loading).
        
        Returns:
            whisper.Model: Loaded Whisper model
        """
        if cls._model is None:
            logger.info(f"Loading Whisper model: {cls._model_name}")
            try:
                cls._model = whisper.load_model(cls._model_name)
                logger.info(f"Whisper model '{cls._model_name}' loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load Whisper model: {str(e)}")
                raise DatabaseError(f"Failed to load transcription model: {str(e)}")
        
        return cls._model
    
    @classmethod
    def transcribe_audio(cls, audio_file_path: str, language: Optional[str] = None) -> dict:
        """
        Transcribe an audio file using Whisper.
        
        Args:
            audio_file_path: Path to the audio file
            language: Optional language code (e.g., 'en', 'es'). Auto-detect if None.
            
        Returns:
            dict: Transcription result containing 'text', 'language', 'segments', etc.
            
        Raises:
            FileNotFoundError: If audio file doesn't exist
            DatabaseError: If transcription fails
        """
        if not os.path.exists(audio_file_path):
            logger.error(f"Audio file not found: {audio_file_path}")
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")
        
        try:
            logger.info(f"Starting transcription for: {audio_file_path}")
            model = cls.get_model()
            
            # Transcribe with optional language specification
            transcribe_options = {}
            if language:
                transcribe_options['language'] = language
            
            result = model.transcribe(audio_file_path, **transcribe_options)
            
            logger.info(f"Transcription completed. Language: {result.get('language', 'unknown')}")
            logger.debug(f"Transcription text preview: {result['text'][:100]}...")
            
            return {
                "text": result["text"].strip(),
                "language": result.get("language", "unknown"),
                "segments": result.get("segments", []),
                "duration": result.get("duration", 0),
            }
            
        except Exception as e:
            logger.error(f"Transcription failed for {audio_file_path}: {str(e)}")
            raise DatabaseError(f"Transcription failed: {str(e)}")
    
    @classmethod
    def set_model(cls, model_name: str):
        """
        Change the Whisper model.
        
        Args:
            model_name: Model size (tiny, base, small, medium, large)
        """
        valid_models = ["tiny", "base", "small", "medium", "large"]
        if model_name not in valid_models:
            raise ValueError(f"Invalid model name. Choose from: {valid_models}")
        
        cls._model_name = model_name
        cls._model = None  # Force reload on next use
        logger.info(f"Whisper model changed to: {model_name}")
