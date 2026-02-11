from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.exceptions import (
    DuplicateError,
    AuthenticationError,
    NotFoundError,
    DatabaseError
)
from app.core.logger import setup_logger

logger = setup_logger(__name__)

class AuthService:
    """Service class for authentication operations"""
    
    @staticmethod
    def create_user(db: Session, user_data: UserCreate) -> User:
        """
        Create a new user account.
        
        Args:
            db: Database session
            user_data: User creation data
            
        Returns:
            User: Created user object
            
        Raises:
            DuplicateError: If email already exists
            DatabaseError: If database operation fails
        """
        try:
            # Check if user exists
            existing_user = db.query(User).filter(User.email == user_data.email).first()
            if existing_user:
                logger.warning(f"Attempt to register duplicate email: {user_data.email}")
                raise DuplicateError("Email already registered")
            
            # Create new user
            hashed_password = get_password_hash(user_data.password)
            db_user = User(
                email=user_data.email,
                password_hash=hashed_password,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                specialization=user_data.specialization
            )
            
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            
            logger.info(f"User created successfully: {db_user.email}")
            return db_user
            
        except DuplicateError:
            db.rollback()
            raise
        except IntegrityError as e:
            db.rollback()
            logger.error(f"Database integrity error: {str(e)}")
            raise DuplicateError("Email already registered")
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Database error during user creation: {str(e)}")
            raise DatabaseError("Failed to create user")
    
    @staticmethod
    def authenticate_user(db: Session, login_data: UserLogin) -> str:
        """
        Authenticate user and return JWT token.
        
        Args:
            db: Database session
            login_data: Login credentials
            
        Returns:
            str: JWT access token
            
        Raises:
            AuthenticationError: If credentials are invalid
            DatabaseError: If database operation fails
        """
        try:
            # Find user
            user = db.query(User).filter(User.email == login_data.email).first()
            if not user:
                logger.warning(f"Login attempt with non-existent email: {login_data.email}")
                raise AuthenticationError("Incorrect email or password")
            
            # Verify password
            if not verify_password(login_data.password, user.password_hash):
                logger.warning(f"Failed login attempt for user: {login_data.email}")
                raise AuthenticationError("Incorrect email or password")
            
            # Create access token
            access_token = create_access_token(data={"sub": str(user.id)})
            
            logger.info(f"User authenticated successfully: {user.email}")
            return access_token
            
        except AuthenticationError:
            raise
        except SQLAlchemyError as e:
            logger.error(f"Database error during authentication: {str(e)}")
            raise DatabaseError("Authentication failed due to database error")
    
    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> User:
        """
        Get user by ID.
        
        Args:
            db: Database session
            user_id: User UUID
            
        Returns:
            User: User object
            
        Raises:
            NotFoundError: If user not found
            DatabaseError: If database operation fails
        """
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.warning(f"User not found: {user_id}")
                raise NotFoundError("User not found")
            return user
            
        except NotFoundError:
            raise
        except SQLAlchemyError as e:
            logger.error(f"Database error while fetching user: {str(e)}")
            raise DatabaseError("Failed to fetch user")
