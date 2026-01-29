"""Updates API routes for parsing user progress updates."""

import logging
from fastapi import APIRouter, HTTPException

from ...schemas.goals import (
    UpdateParseRequest,
    UpdateParseResponse,
    ParsedActivity,
)
from ...agent.llm import create_llm
from ...experts import parse_llm_json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/updates", tags=["updates"])


@router.post("/parse", response_model=UpdateParseResponse)
async def parse_update(request: UpdateParseRequest) -> UpdateParseResponse:
    """Parse a free-form user update into structured activities.

    The AI will analyze the update text and extract:
    - Individual activities (progress, obstacles, milestones, reflections)
    - Overall sentiment
    - Momentum score
    """
    logger.info(f"Received update parse request for goal: {request.goal_id}")

    try:
        llm = create_llm()

        parse_prompt = f"""You are analyzing a user's progress update for their goal. Extract structured information from their free-form text.

User's Update:
"{request.raw_text}"

Your task:
1. Identify individual activities mentioned (progress made, obstacles encountered, milestones reached, reflections)
2. For each activity, note if there's a quantifiable metric
3. Determine the overall sentiment (positive, neutral, or negative)
4. Assign a momentum score from 1-10 (how much forward progress is indicated)
5. Write a brief summary

Respond in this exact JSON format:
{{
    "activities": [
        {{
            "activity_type": "progress|obstacle|milestone|reflection",
            "description": "<what they did or encountered>",
            "metric": {{"value": <number or null>, "unit": "<unit or null>"}}
        }}
    ],
    "sentiment": "positive|neutral|negative",
    "momentum_score": <1-10>,
    "summary": "<brief 1-2 sentence summary>"
}}

Activity types:
- progress: Forward movement, work completed, steps taken
- obstacle: Challenges, blockers, difficulties encountered
- milestone: Significant achievements, checkpoints reached
- reflection: Thoughts, learnings, realizations

Respond ONLY with valid JSON."""

        response = await llm.ainvoke([
            {"role": "system", "content": "You parse user updates into structured data. Always respond with valid JSON."},
            {"role": "user", "content": parse_prompt},
        ])

        result = parse_llm_json(response.content)

        # Convert activities to ParsedActivity objects
        activities = []
        for act in result.get("activities", []):
            activities.append(ParsedActivity(
                activity_type=act.get("activity_type", "progress"),
                description=act.get("description", ""),
                metric=act.get("metric") if act.get("metric", {}).get("value") else None,
            ))

        return UpdateParseResponse(
            goal_id=request.goal_id,
            activities=activities,
            sentiment=result.get("sentiment", "neutral"),
            momentum_score=max(1, min(10, int(result.get("momentum_score", 5)))),
            summary=result.get("summary", "Update received."),
        )

    except ValueError as e:
        logger.error(f"JSON parsing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        logger.error(f"Error during update parsing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to parse update")
