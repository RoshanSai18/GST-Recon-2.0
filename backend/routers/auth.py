"""
routers/auth.py — Authentication.

POST /auth/login → TokenResponse  (admin username + password → bearer token)
GET  /auth/me    → CurrentUser    (requires Bearer token)

Two auth modes are supported:
  1. Admin password auth — POST /auth/login with ADMIN_USERNAME / ADMIN_PASSWORD.
     Returns JWT_SECRET as the bearer token (easy, stateless, suitable for hackathon).
  2. Clerk JWT auth — when CLERK_JWKS_URL is configured the /me endpoint also
     verifies Clerk RS256 session tokens.
"""

from __future__ import annotations

import logging
from functools import lru_cache

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

import config
from models.schemas import CurrentUser, LoginRequest, TokenResponse

logger = logging.getLogger(__name__)
router = APIRouter()

_bearer = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# JWKS helpers
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def _get_jwks() -> dict:
    """
    Fetch and memory-cache Clerk's JWKS.
    Cache is cleared on process restart (suitable for hackathon use).
    """
    if not config.CLERK_JWKS_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="CLERK_JWKS_URL is not configured on the server.",
        )
    with httpx.Client(timeout=10.0) as client:
        response = client.get(config.CLERK_JWKS_URL)
        response.raise_for_status()
    return response.json()


def _verify_clerk_token(token: str) -> dict:
    """Verify a Clerk session JWT against the JWKS, return the payload."""
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Malformed token header: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    kid = unverified_header.get("kid")
    jwks = _get_jwks()

    # Find the matching public key by key ID
    matching_key: dict | None = next(
        (k for k in jwks.get("keys", []) if k.get("kid") == kid),
        None,
    )
    if matching_key is None:
        # Key not in cache — could be a key rotation; bust the cache and retry
        _get_jwks.cache_clear()
        refreshed = _get_jwks()
        matching_key = next(
            (k for k in refreshed.get("keys", []) if k.get("kid") == kid),
            None,
        )

    if matching_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No matching public key found for this token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token,
            matching_key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk tokens have no `aud` by default
        )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Clerk token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# Dependency: require valid Clerk JWT
# ---------------------------------------------------------------------------

def require_jwt(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    """FastAPI dependency — validates a Clerk Bearer JWT and returns CurrentUser."""
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No credentials provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = _verify_clerk_token(creds.credentials)

    # Clerk tokens use `sub` as the Clerk user ID; email is in `email`
    username: str = (
        payload.get("email")
        or payload.get("primary_email_address")
        or payload.get("sub", "unknown")
    )
    return CurrentUser(username=username, role="admin")


# ---------------------------------------------------------------------------
# POST /auth/login   (admin password → bearer token)
# ---------------------------------------------------------------------------

@router.post(
    "/login",
    summary="Admin Login",
    response_model=TokenResponse,
)
def login(body: LoginRequest) -> TokenResponse:
    """
    Exchange admin credentials for a bearer token.

    The returned ``access_token`` must be sent as
    ``Authorization: Bearer <token>`` on all protected endpoints.
    """
    if (
        body.username != config.ADMIN_USERNAME
        or body.password != config.ADMIN_PASSWORD
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(
        access_token=config.JWT_SECRET,
        token_type="bearer",
        expires_in=config.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------

def require_auth(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    """
    FastAPI dependency — accepts either:
      • A Clerk RS256 JWT (when CLERK_JWKS_URL is configured), or
      • The raw JWT_SECRET value (admin password login flow).
    """
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No credentials provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fast-path: plain admin token (JWT_SECRET)
    if creds.credentials == config.JWT_SECRET:
        return CurrentUser(username=config.ADMIN_USERNAME, role="admin")

    # Fall back to Clerk JWT verification when configured
    if config.CLERK_JWKS_URL:
        return require_jwt(creds)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token.",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.get(
    "/me",
    summary="Current User",
    response_model=CurrentUser,
)
def me(current_user: CurrentUser = Depends(require_auth)) -> CurrentUser:
    """Return the currently authenticated user (requires Bearer token)."""
    return current_user
