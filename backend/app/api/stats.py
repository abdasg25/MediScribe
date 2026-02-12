from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.stats import DashboardStats
from app.services.stats_service import StatsService

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for the current user
    
    Returns:
        - total_recordings: Total number of recordings
        - total_letters: Total number of letters generated
        - total_transcriptions: Total completed transcriptions
        - this_week_recordings: Recordings created this week
        - this_week_letters: Letters created this week
        - estimated_time_saved_hours: Estimated time saved in hours
    """
    return StatsService.get_dashboard_stats(db, current_user.id)
