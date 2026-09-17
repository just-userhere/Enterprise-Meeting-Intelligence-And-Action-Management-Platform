from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

VALID_ROLES = {"EMPLOYEE", "MANAGER", "ADMIN"}


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: str = Field(default="EMPLOYEE")

    def validated_role(self) -> str:
        r = self.role.upper().strip()
        return r if r in VALID_ROLES else "EMPLOYEE"


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
