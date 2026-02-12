"""
Ollama service for interacting with local LLM (Qwen3) for letter generation.
"""

import ollama
from typing import Optional, Dict, Any
from app.core.config import settings
from app.core.logger import logger
from app.core.exceptions import DatabaseError


class OllamaService:
    """Service for interacting with Ollama local LLM"""
    
    @staticmethod
    def generate_completion(
        prompt: str,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        system_message: Optional[str] = None
    ) -> str:
        """
        Generate a completion using Ollama.
        
        Args:
            prompt: The prompt to send to the model
            model: Model name (defaults to settings.OLLAMA_MODEL)
            temperature: Sampling temperature (defaults to settings.OLLAMA_TEMPERATURE)
            max_tokens: Maximum tokens to generate (defaults to settings.OLLAMA_MAX_TOKENS)
            system_message: Optional system message to set context
            
        Returns:
            str: Generated text completion
            
        Raises:
            DatabaseError: If generation fails
        """
        model = model or settings.OLLAMA_MODEL
        temperature = temperature if temperature is not None else settings.OLLAMA_TEMPERATURE
        
        try:
            logger.info(f"Generating completion with model: {model}")
            logger.debug(f"Prompt length: {len(prompt)} characters")
            
            # Prepare messages
            messages = []
            if system_message:
                messages.append({
                    "role": "system",
                    "content": system_message
                })
            messages.append({
                "role": "user",
                "content": prompt
            })
            
            # Generate completion
            response = ollama.chat(
                model=model,
                messages=messages,
                options={
                    "temperature": temperature,
                    "num_predict": max_tokens or settings.OLLAMA_MAX_TOKENS,
                }
            )
            
            # Extract generated text
            generated_text = response['message']['content']
            
            logger.info(f"Completion generated successfully. Length: {len(generated_text)} characters")
            logger.debug(f"Generated text preview: {generated_text[:200]}...")
            
            return generated_text.strip()
            
        except Exception as e:
            logger.error(f"Ollama generation failed: {str(e)}")
            raise DatabaseError(f"Failed to generate completion: {str(e)}")
    
    @staticmethod
    def check_model_availability(model: Optional[str] = None) -> bool:
        """
        Check if the specified model is available locally.
        
        Args:
            model: Model name to check (defaults to settings.OLLAMA_MODEL)
            
        Returns:
            bool: True if model is available, False otherwise
        """
        model = model or settings.OLLAMA_MODEL
        
        try:
            logger.info(f"Checking availability of model: {model}")
            models = ollama.list()
            
            available_models = [m['name'] for m in models.get('models', [])]
            is_available = any(model in name for name in available_models)
            
            if is_available:
                logger.info(f"Model {model} is available")
            else:
                logger.warning(f"Model {model} not found. Available models: {available_models}")
            
            return is_available
            
        except Exception as e:
            logger.error(f"Failed to check model availability: {str(e)}")
            return False
    
    @staticmethod
    def pull_model(model: Optional[str] = None) -> bool:
        """
        Pull/download a model from Ollama registry.
        
        Args:
            model: Model name to pull (defaults to settings.OLLAMA_MODEL)
            
        Returns:
            bool: True if successful, False otherwise
        """
        model = model or settings.OLLAMA_MODEL
        
        try:
            logger.info(f"Pulling model: {model}")
            ollama.pull(model)
            logger.info(f"Model {model} pulled successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to pull model {model}: {str(e)}")
            return False
    
    @staticmethod
    def get_model_info(model: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get information about a model.
        
        Args:
            model: Model name (defaults to settings.OLLAMA_MODEL)
            
        Returns:
            dict: Model information or None if not found
        """
        model = model or settings.OLLAMA_MODEL
        
        try:
            logger.info(f"Getting info for model: {model}")
            info = ollama.show(model)
            return info
            
        except Exception as e:
            logger.error(f"Failed to get model info: {str(e)}")
            return None
