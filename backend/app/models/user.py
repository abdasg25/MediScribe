from sqlalchemy import Column, String, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    """User roles in the system"""
    DOCTOR = "doctor"
    ADMIN = "admin"

class User(Base):
    """
    User model representing doctors and admins.
    
    Attributes:
        id: Unique identifier (UUID)
        email: User's email (unique)
        password_hash: Hashed password
        first_name: User's first name
        last_name: User's last name
        role: User role (doctor/admin)
        specialization: Medical specialization (optional)
        created_at: Account creation timestamp
        updated_at: Last update timestamp
    """
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.DOCTOR, nullable=False)
    specialization = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User {self.email}>"
