from pydantic import BaseModel


class DashboardStats(BaseModel):
    """Dashboard statistics response"""
    total_recordings: int
    total_letters: int
    total_transcriptions: int
    this_week_recordings: int
    this_week_letters: int
    estimated_time_saved_hours: float
    
    class Config:
        from_attributes = True
