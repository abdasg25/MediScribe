from fastapi import HTTPException, status

class MediScribeException(Exception):
    """Base exception for MediScribe application"""
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class AuthenticationError(MediScribeException):
    """Raised when authentication fails"""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)

class AuthorizationError(MediScribeException):
    """Raised when user is not authorized"""
    def __init__(self, message: str = "Not authorized to access this resource"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)

class NotFoundError(MediScribeException):
    """Raised when resource is not found"""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)

class ValidationError(MediScribeException):
    """Raised when validation fails"""
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY)

class DuplicateError(MediScribeException):
    """Raised when trying to create duplicate resource"""
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status.HTTP_409_CONFLICT)

class DatabaseError(MediScribeException):
    """Raised when database operation fails"""
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
