from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.recording import Recording
from app.models.letter import Letter
from app.schemas.stats import DashboardStats


class StatsService:
    """Service for calculating dashboard statistics"""
    
    @staticmethod
    def get_dashboard_stats(db: Session, user_id: str) -> DashboardStats:
        """
        Get dashboard statistics for a user
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            DashboardStats object
        """
        # Total recordings
        total_recordings = db.query(func.count(Recording.id)).filter(
            Recording.user_id == user_id
        ).scalar() or 0
        
        # Total letters
        total_letters = db.query(func.count(Letter.id)).filter(
            Letter.user_id == user_id
        ).scalar() or 0
        
        # Total transcriptions (completed recordings)
        total_transcriptions = db.query(func.count(Recording.id)).filter(
            Recording.user_id == user_id,
            Recording.transcription.isnot(None)
        ).scalar() or 0
        
        # This week's recordings
        week_ago = datetime.utcnow() - timedelta(days=7)
        this_week_recordings = db.query(func.count(Recording.id)).filter(
            Recording.user_id == user_id,
            Recording.created_at >= week_ago
        ).scalar() or 0
        
        # This week's letters
        this_week_letters = db.query(func.count(Letter.id)).filter(
            Letter.user_id == user_id,
            Letter.created_at >= week_ago
        ).scalar() or 0
        
        # Estimated time saved (assume 10 minutes per letter)
        estimated_time_saved_hours = round((total_letters * 10) / 60, 1)
        
        return DashboardStats(
            total_recordings=total_recordings,
            total_letters=total_letters,
            total_transcriptions=total_transcriptions,
            this_week_recordings=this_week_recordings,
            this_week_letters=this_week_letters,
            estimated_time_saved_hours=estimated_time_saved_hours
        )
