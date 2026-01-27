"""API route definitions."""

from fastapi import APIRouter

from .chat import router as chat_router

router = APIRouter(prefix="/api/v1")

# Include sub-routers
router.include_router(chat_router, tags=["chat"])
