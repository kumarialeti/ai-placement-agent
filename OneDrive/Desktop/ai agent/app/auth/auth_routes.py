"""
Authentication API routes — Register, Login, Profile.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.jwt_handler import create_access_token, hash_password, verify_password
from app.auth.middleware import get_current_user
from app.database.connection import get_db
from app.database.crud import create_user, get_user_by_email, update_user_profile, get_user_profile
from app.database.models import User
from app.database.schemas import TokenResponse, UserCreate, UserLogin, UserResponse, UserProfileUpdate

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if user exists
    existing = await get_user_by_email(db, user_data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    hashed = hash_password(user_data.password)
    user = await create_user(
        db, email=user_data.email, username=user_data.username,
        hashed_password=hashed, full_name=user_data.full_name,
    )

    # Generate token
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    user = await get_user_by_email(db, credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse.model_validate(current_user)


@router.patch("/profile")
async def update_profile(
    profile_data: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile (target role, experience)."""
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    if update_data:
        await update_user_profile(db, current_user.id, **update_data)
    
    profile = await get_user_profile(db, current_user.id)
    return {
        "target_role": profile.target_role if profile else None,
        "experience_level": profile.experience_level if profile else None
    }
