from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserUpdate, PasswordChange
from app.services.auth_service import AuthService
from app.dependencies import get_current_user
from app.models.user import User
from app.core.logger import setup_logger
from app.core.security import verify_password, get_password_hash

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

@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update user profile",
    description="Update user's profile information",
    responses={
        200: {"description": "Profile updated successfully"},
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"}
    }
)
def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile information.
    
    **Requires:**
    - Valid Bearer token in Authorization header
    
    **Fields:**
    - first_name: Optional new first name
    - last_name: Optional new last name
    - specialization: Optional medical specialization
    
    **Returns:**
    - Updated user object
    """
    logger.info(f"Profile update for user: {current_user.email}")
    
    # Update only provided fields
    if update_data.first_name is not None:
        current_user.first_name = update_data.first_name
    if update_data.last_name is not None:
        current_user.last_name = update_data.last_name
    if update_data.specialization is not None:
        current_user.specialization = update_data.specialization
    
    db.commit()
    db.refresh(current_user)
    
    logger.info(f"Profile updated successfully for: {current_user.email}")
    return current_user

@router.post(
    "/change-password",
    status_code=status.HTTP_200_OK,
    summary="Change user password",
    description="Change current user's password",
    responses={
        200: {"description": "Password changed successfully"},
        400: {"description": "Invalid current password"},
        401: {"description": "Not authenticated"},
        422: {"description": "Validation error"}
    }
)
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    
    **Requires:**
    - Valid Bearer token in Authorization header
    
    **Fields:**
    - current_password: Current password for verification
    - new_password: New password (must meet strength requirements)
    
    **Returns:**
    - Success message
    """
    logger.info(f"Password change attempt for user: {current_user.email}")
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        logger.warning(f"Invalid current password for user: {current_user.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Hash and update new password
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    logger.info(f"Password changed successfully for: {current_user.email}")
    return {"message": "Password changed successfully"}
