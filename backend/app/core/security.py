"""Password hashing (PBKDF2-HMAC-SHA256, stdlib only) and JWT handling.

Deliberately avoids third-party crypto deps so the project installs cleanly
on any platform. Format: ``pbkdf2$<iterations>$<salt_hex>$<hash_hex>``.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import get_settings

ALGORITHM = "HS256"
_ITERATIONS = 210_000


def hash_password(password: str) -> str:
    if len(password.encode("utf-8")) > 256:
        raise ValueError("Password is too long.")
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _ITERATIONS)
    return f"pbkdf2${_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        prefix, iters, salt_hex, hash_hex = stored.split("$")
        assert prefix == "pbkdf2"
        dk = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), int(iters)
        )
        return secrets.compare_digest(dk.hex(), hash_hex)
    except Exception:
        return False


def create_access_token(subject: str, role: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "role": role, "exp": expire, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
