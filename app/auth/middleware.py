"""
Authentication dependency for FastAPI — extracts and validates JWT from requests.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_handler import decode_access_token
from app.database.connection import get_db
from app.database.crud import get_user_by_id
from app.database.models import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract user from JWT token. Use as FastAPI dependency for protected routes."""
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        print("DEBUG: Payload is None. Token decode failed.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    sub_str = payload.get("sub")
    if sub_str is None:
        print("DEBUG: 'sub' claim is None in payload.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
        
    try:
        user_id = int(sub_str)
    except ValueError:
        print(f"DEBUG: Could not parse sub_str as int: {sub_str}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload format",
        )

    user = await get_user_by_id(db, user_id)
    if user is None:
        print(f"DEBUG: get_user_by_id returned None for user_id={user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user
