"""Goal-related Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class GoalReviewRequest(BaseModel):
    """Request schema for goal review."""

    goal_id: str = Field(..., description="Unique identifier for the goal")
    title: str = Field(..., description="Goal title")
    description: str = Field(..., description="Detailed goal description")
    target_date: Optional[str] = Field(None, description="Target completion date")


class ExpertFeedback(BaseModel):
    """Feedback from a single expert."""

    expert_type: str = Field(..., description="Type/ID of the expert")
    expert_name: str = Field(..., description="Display name of the expert")
    score: int = Field(..., ge=1, le=10, description="Score from 1-10")
    feedback: str = Field(..., description="Detailed feedback text")
    suggestions: list[str] = Field(default_factory=list, description="Actionable suggestions")


class GoalReviewResponse(BaseModel):
    """Response schema for goal review."""

    goal_id: str
    overall_score: float = Field(..., ge=0, le=10, description="Average score across all experts")
    summary: str = Field(..., description="Synthesized summary from all experts")
    experts: list[ExpertFeedback] = Field(default_factory=list)
    reviewed_at: datetime = Field(default_factory=datetime.utcnow)


class GoalRevisionRequest(BaseModel):
    """Request schema for AI-powered goal revision."""

    title: str = Field(..., description="Goal title")
    description: str = Field(..., description="Goal description to revise")


class GoalRevisionResponse(BaseModel):
    """Response schema for goal revision."""

    original_title: str
    original_description: str
    revised_title: str
    revised_description: str
    improvements: list[str] = Field(default_factory=list, description="List of improvements made")
    specificity_score: int = Field(..., ge=1, le=10, description="How specific/measurable the goal is")


class UpdateParseRequest(BaseModel):
    """Request schema for parsing user updates."""

    goal_id: str
    raw_text: str = Field(..., description="Free-form update text from user")


class ParsedActivity(BaseModel):
    """A single parsed activity from user update."""

    activity_type: str = Field(..., description="Type: progress, obstacle, milestone, reflection")
    description: str
    metric: Optional[dict] = Field(None, description="Quantified metric if applicable")


class UpdateParseResponse(BaseModel):
    """Response schema for parsed update."""

    goal_id: str
    activities: list[ParsedActivity] = Field(default_factory=list)
    sentiment: str = Field(..., description="positive, neutral, or negative")
    momentum_score: int = Field(..., ge=1, le=10, description="Overall momentum/progress score")
    summary: str = Field(..., description="Brief summary of the update")
