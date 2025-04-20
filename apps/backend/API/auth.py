"""
Authentication module for AQMatic API.
"""
from typing import Optional, List
from datetime import datetime, timedelta
import os
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from .database import get_db
from sqlalchemy import select, Table, Column, Integer, String, MetaData

# Load environment variables
load_dotenv()

# Define security scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Define password context for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Get security settings from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "f0de0293fb61a5772c06e3b72edf4002f3624e6e9ac27a77b19c4bcd3a5ebbc5")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Database models
metadata = MetaData()
users_table = Table(
    "users",
    metadata,
    Column("user_id", Integer, primary_key=True),  # Changed from 'id' to 'user_id'
    Column("organization_id", Integer, nullable=False),
    Column("username", String, nullable=False),
    Column("password_hash", String, nullable=False),
    Column("email", String, nullable=True),
    Column("role", String, nullable=True),
    Column("name", String, nullable=True),
)

# Pydantic models for request/response
class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    organization_id: int
    email: Optional[str] = None
    username: str
    role: Optional[str] = None
    name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    organization_id: Optional[int] = None

class User(BaseModel):
    id: int
    organization_id: int
    username: str
    email: Optional[str] = None
    role: Optional[str] = None
    name: Optional[str] = None

# Authentication functions
def verify_password(plain_password, hashed_password):
    """
    Verify a password against a hash.
    For development, if the hash looks like plain text, compare directly.
    """
    if len(hashed_password) < 20:  # Likely a plain text password in development
        return plain_password == hashed_password
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """
    Hash a password.
    """
    return pwd_context.hash(password)

async def get_user_by_email(db: Session, email: str):
    """
    Get a user by email.
    """
    # Using SQLAlchemy Core for direct query
    query = select([users_table]).where(users_table.c.email == email)
    result = await db.execute(query)
    user = result.fetchone()
    if user:
        return dict(user)
    return None

async def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticate a user by email and password.
    """
    # Try direct SQL query for better compatibility
    query = f"SELECT user_id, organization_id, username, password_hash, email, role, name FROM users WHERE email = '{email}'"
    result = db.execute(query)
    user = result.fetchone()
    
    if not user:
        return False
    
    # Convert to dictionary
    user_dict = {
        "id": user[0],
        "organization_id": user[1],
        "username": user[2],
        "password_hash": user[3],
        "email": user[4],
        "role": user[5],
        "name": user[6]
    }
    
    if not verify_password(password, user_dict["password_hash"]):
        return False
    
    return user_dict

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency to get the current user from a JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Extract organization_id from token
        organization_id = payload.get("org")
        token_data = TokenData(user_id=user_id, organization_id=organization_id)
        
    except JWTError:
        raise credentials_exception
    
    # Fetch user from database - fixed to use user_id column name
    query = f"SELECT user_id, organization_id, username, email, role, name FROM users WHERE user_id = {token_data.user_id}"
    result = db.execute(query)
    user = result.fetchone()
    
    if user is None:
        raise credentials_exception
    
    # Convert to User model
    return User(
        id=user[0],
        organization_id=user[1],
        username=user[2],
        email=user[3],
        role=user[4],
        name=user[5]
    )

# API handlers
async def login_handler(login_data: LoginRequest, db: Session):
    """
    Handle login requests, authenticate user and return JWT token.
    """
    user = await authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token with user_id as subject and organization_id as claim
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["id"]), "org": user["organization_id"]}, 
        expires_delta=access_token_expires
    )
    
    # Return token and user info
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user["id"],
        organization_id=user["organization_id"],
        email=user["email"],
        username=user["username"],
        role=user["role"],
        name=user["name"]
    )

async def debug_users_handler(db: Session):
    """
    Development-only debug endpoint to list users in the system.
    """
    result = db.execute("SELECT user_id, organization_id, username, email, role, name FROM users")
    users = result.fetchall()
    return [
        {
            "id": user[0],
            "organization_id": user[1],
            "username": user[2],
            "email": user[3],
            "role": user[4],
            "name": user[5]
        }
        for user in users
    ]