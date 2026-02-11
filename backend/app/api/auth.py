from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import AuthService
from app.dependencies import get_current_user
from app.models.user import User
from app.core.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post(
    "/signup",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password",
    responses={
        201: {"description": "User created successfully"},
        409: {"description": "Email already registered"},
        422: {"description": "Validation error"}
    }
)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    **Requirements:**
    - **email**: Valid email address
    - **password**: Minimum 8 characters, must include:
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
    - **first_name**: User's first name (letters only)
    - **last_name**: User's last name (letters only)
    - **specialization**: Optional medical specialization
    
    **Returns:**
    - User object with ID, email, name, and creation timestamp
    """
    logger.info(f"Signup attempt for email: {user_data.email}")
    user = AuthService.create_user(db, user_data)
    return user

@router.post(
    "/login",
    response_model=Token,
    summary="Login to get access token",
    description="Authenticate with email and password to receive a JWT token",
    responses={
        200: {"description": "Login successful"},
        401: {"description": "Invalid credentials"},
        422: {"description": "Validation error"}
    }
)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password to get JWT token.
    
    **Requirements:**
    - **email**: Registered email address
    - **password**: Account password
    
    **Returns:**
    - JWT access token (valid for 30 minutes)
    - Token type (bearer)
    
    **Usage:**
    Use the returned access_token in the Authorization header:
    ```
    Authorization: Bearer <access_token>
    ```
    """
    logger.info(f"Login attempt for email: {login_data.email}")
    access_token = AuthService.authenticate_user(db, login_data)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
    description="Get information about the currently authenticated user",
    responses={
        200: {"description": "User information retrieved"},
        401: {"description": "Not authenticated or invalid token"}
    }
)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    
    **Requires:**
    - Valid Bearer token in Authorization header
    
    **Returns:**
    - User object with ID, email, name, role, and specialization
    """
    logger.info(f"User info retrieved for: {current_user.email}")
    return current_user
