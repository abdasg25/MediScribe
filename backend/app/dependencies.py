from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import verify_token
from app.core.exceptions import AuthenticationError
from app.core.logger import setup_logger
from app.models.user import User
from app.services.auth_service import AuthService

logger = setup_logger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        credentials: Bearer token from request header
        db: Database session
        
    Returns:
        User: Current authenticated user
        
    Raises:
        AuthenticationError: If token is invalid or user not found
    """
    try:
        token = credentials.credentials
        
        # Verify token
        user_id = verify_token(token)
        if user_id is None:
            logger.warning("Invalid JWT token provided")
            raise AuthenticationError("Could not validate credentials")
        
        # Get user
        user = AuthService.get_user_by_id(db, user_id)
        
        return user
        
    except AuthenticationError:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_user: {str(e)}")
        raise AuthenticationError("Could not validate credentials")
