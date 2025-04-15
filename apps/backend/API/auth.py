"""
Authentication module for the AQMatic API.
Contains all auth-related functions, models, and endpoints.
"""
from typing import Optional
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text
import os
import traceback

from .database import get_db

# Security configuration
SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-for-development")
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models for request/response
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    organization_id: Optional[int] = None

class User(BaseModel):
    user_id: int
    email: str
    name: str
    organization_id: int
    role: str

class UserInDB(User):
    password_hash: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    user_id: int
    id: str
    email: str
    name: str
    organization_id: int
    organizationId: int  # Duplicate field for camelCase compatibility
    role: str
    access_token: str
    token_type: str

# Helper functions for authentication
def verify_password(plain_password, hashed_password):
    try:
        # Only attempt to verify with passlib if it looks like a valid hash
        if hashed_password and hashed_password.startswith("$2"):
            return pwd_context.verify(plain_password, hashed_password)
        elif hashed_password:
            # For development/testing - direct comparison if not a bcrypt hash
            # This should be removed in production
            print("Warning: Using direct string comparison for password. Not secure for production!")
            return plain_password == hashed_password
        return False
    except Exception as e:
        print(f"Password verification error: {str(e)}")
        # For debugging only - DO NOT log actual passwords in production
        print(f"Hash format: {hashed_password[:10]}... (truncated)")
        # Fallback: direct string comparison for development only
        # This should be removed in production
        try:
            return plain_password == hashed_password
        except:
            return False

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(db: Session, email: str):
    query = "SELECT user_id, email, name, password_hash, organization_id, role FROM users WHERE email = :email"
    result = db.execute(text(query), {"email": email}).fetchone()
    
    if result:
        return UserInDB(
            user_id=result.user_id,
            email=result.email,
            name=result.name if result.name else result.email.split('@')[0],  # Use email username if name is None
            password_hash=result.password_hash,
            organization_id=result.organization_id,
            role=result.role if result.role else "user"  # Default role if None
        )
    return None

def authenticate_user(db: Session, email: str, password: str):
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    user = get_user(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Login endpoint handler function
async def login_handler(login_data: LoginRequest, db: Session):
    """
    User-friendly login endpoint that accepts JSON with optimized performance
    """
    try:
        print(f"Login attempt for email: {login_data.email}")
        
        # Perform single database query with direct SQL for better performance
        query = """
        SELECT user_id, email, name, password_hash, organization_id, role 
        FROM users 
        WHERE email = :email
        LIMIT 1
        """
        result = db.execute(text(query), {"email": login_data.email}).fetchone()
        
        # Early rejection if user doesn't exist
        if not result:
            print(f"User not found: {login_data.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Map DB result to user object
        user = UserInDB(
            user_id=result.user_id,
            email=result.email,
            name=result.name if result.name else result.email.split('@')[0],  # Use email username if name is None
            password_hash=result.password_hash,
            organization_id=result.organization_id,
            role=result.role if result.role else "user"  # Default role if None
        )
        
        print(f"User found, verifying password for: {login_data.email}")
        
        # Debug info for hash format
        hash_format = user.password_hash[:10] + "..." if user.password_hash else "None"
        print(f"Password hash format: {hash_format}")
        
        # Special case for development: if password is plaintext in database (starts with "password")
        # This is temporary for development only - should be removed in production
        if user.password_hash and user.password_hash.startswith("password"):
            # Compare directly for development
            expected_password = user.password_hash[8:]  # Remove "password" prefix
            entered_password = login_data.password
            
            print(f"Debug - Expected password (stored): '{expected_password}'")
            print(f"Debug - Entered password (length): {len(entered_password)} chars")
            
            # Try direct equality with trimmed password_hash
            password_matches = entered_password == expected_password
            
            # If that fails, try checking if the entered password equals the entire hash (including "password" prefix)
            if not password_matches:
                password_matches = entered_password == user.password_hash
                if password_matches:
                    print("Password matched against full stored value")
            
            # If both fail, the password is incorrect
            if not password_matches:
                print(f"Direct password comparison failed: {login_data.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            print(f"Direct password verification successful for: {login_data.email}")
        else:
            # Verify password using bcrypt
            if not verify_password(login_data.password, user.password_hash):
                print(f"Password verification failed for: {login_data.email}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Incorrect email or password",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            print(f"Password verified for: {login_data.email}")
        
        # Generate minimal token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "org": user.organization_id},
            expires_delta=access_token_expires
        )
        
        print(f"Login successful for: {login_data.email}")
        
        # Return response with both snake_case and camelCase keys
        return {
            "user_id": user.user_id,
            "id": str(user.user_id),
            "email": user.email,
            "name": user.name,
            "organization_id": user.organization_id,
            "organizationId": user.organization_id,
            "role": user.role,
            "access_token": access_token,
            "token_type": "bearer"
        }
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error but don't expose details
        print(f"Login error: {str(e)}")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

# Debug users handler
async def debug_users_handler(db: Session):
    """
    DEVELOPMENT ONLY - Lists all users with their login details for debugging
    This endpoint should be removed in production
    """
    try:
        query = """
        SELECT user_id, email, name, password_hash, organization_id, role 
        FROM users 
        ORDER BY user_id
        """
        results = db.execute(text(query)).fetchall()
        
        users = []
        for row in results:
            pwd = row.password_hash
            login_info = ""
            
            # For plaintext passwords (those starting with "password")
            if pwd and pwd.startswith("password"):
                login_info = f"Password: {pwd[8:]}"
            else:
                login_info = "Use bcrypt-hashed password"
            
            users.append({
                "user_id": row.user_id,
                "email": row.email,
                "name": row.name,
                "organization_id": row.organization_id,
                "role": row.role,
                "login_info": login_info
            })
        
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 