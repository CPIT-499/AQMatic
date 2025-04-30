"""
Main FastAPI application module for AQMatic API.
"""
from typing import Union, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from firebase_admin import auth

from .database import get_db
from .auth import (
    LoginRequest, 
    LoginResponse, 
    User, 
    get_current_user, 
    login_handler,
    debug_users_handler
)
from .endpoints import (
    get_hourly_measurement_summary_handler,
    get_map_data_handler,
    get_location_measurements_handler,
    get_location_aqi_handler,
    get_org_summary_stats_handler,
    get_public_summary_stats_handler  # New import
)
from .services.firebase_admin import set_organization_claim  # Import the new function

# Create FastAPI app
app = FastAPI(
    title="AQMatic API",
    description="API for air quality monitoring and analysis",
    version="1.0.0"
)

# Define allowed origins - be permissive for development
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "*"  # Allow all origins in development
]

# Set up CORS with a very permissive configuration for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Home route
@app.get("/")
def read_root():
    return {"Hello": "AQMatic API"}

async def get_current_user(request: Request):
    """Get the current user from Firebase token and extract organization claims"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    try:
        token = auth_header.split('Bearer ')[1]
        decoded_token = auth.verify_id_token(token)
        return {
            'uid': decoded_token.get('uid'),
            'email': decoded_token.get('email'),
            'organization_id': decoded_token.get('organization_id'),
            'organization_name': decoded_token.get('organization_name')
        }
    except:
        return None

@app.get("/hourly_measurement_summary_View_graph")
async def get_hourly_measurement_summary(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get hourly measurement summary data filtered by organization
    """
    current_user = await get_current_user(request)
    organization_id = current_user.get('organization_id') if current_user else None
    
    try:
        return get_hourly_measurement_summary_handler(db, organization_id)
    except Exception as e:
        print(f"Error in get_hourly_measurement_summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch hourly measurement summary"
        )

@app.get("/map_data")
async def get_map_data(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get map data filtered by organization
    """
    current_user = await get_current_user(request)
    organization_id = current_user.get('organization_id') if current_user else None
    
    try:
        return await get_map_data_handler(db, organization_id)
    except Exception as e:
        print(f"Error in get_map_data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch map data"
        )

@app.get("/summary_stats")
async def get_summary_stats(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get summary statistics filtered by organization
    """
    current_user = await get_current_user(request)
    organization_id = current_user.get('organization_id') if current_user else None
    
    try:
        if organization_id:
            return get_org_summary_stats_handler(organization_id, db)
        else:
            return get_public_summary_stats_handler(db)
    except Exception as e:
        print(f"Error in get_summary_stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch summary statistics"
        )

# Location measurements route
@app.get("/location_measurements/{location_id}")
async def get_location_measurements(
    location_id: int,
    organization_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get measurements for a specific location
    Filtered by organization_id if provided
    """
    try:
        query = """
            SELECT m.*, l.organization_id
            FROM measurements m
            JOIN locations l ON m.location_id = l.id
            WHERE m.location_id = :location_id
        """
        params = {"location_id": location_id}
        
        if organization_id is not None:
            query += " AND l.organization_id = :organization_id"
            params["organization_id"] = organization_id
            
        result = db.execute(text(query), params).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        print(f"Error in get_location_measurements: {str(e)}")
        return []

# Location-specific AQI data route
@app.get("/aqi_data/{location_id}")
async def get_aqi_data(
    location_id: int,
    organization_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get AQI data for a specific location
    Filtered by organization_id if provided
    """
    try:
        query = """
            SELECT a.*, l.organization_id
            FROM aqi_data a
            JOIN locations l ON a.location_id = l.id
            WHERE a.location_id = :location_id
        """
        params = {"location_id": location_id}
        
        if organization_id is not None:
            query += " AND l.organization_id = :organization_id"
            params["organization_id"] = organization_id
            
        result = db.execute(text(query), params).fetchall()
        return [dict(row) for row in result]
    except Exception as e:
        print(f"Error in get_aqi_data: {str(e)}")
        return []

# Authentication endpoints
@app.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    return await login_handler(login_data, db)

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/auth/set-claims-trigger")
async def set_claims_trigger(
    request: Request,
    db: Session = Depends(get_db)
):
    # Get the Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No valid Authorization header found"
        )
    
    # Extract the token
    token = auth_header.split('Bearer ')[1]
    
    try:
        # Verify the Firebase token
        decoded_token = auth.verify_id_token(token)
        email = decoded_token.get('email')
        uid = decoded_token.get('uid')  # Get the Firebase UID
        
        if not email or not uid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email or UID found in token"
            )
        
        # First check if organization name is provided in the request body
        try:
            body = await request.json()
            org_name = body.get('organization_name', '').strip()
        except:
            org_name = None

        # If no organization name provided in body, extract from email domain
        if not org_name:
            domain = email.split('@')[1]
            org_name = domain.split('.')[0]
            
        print(f"Looking up organization: {org_name}")
        
        # Query for organization
        query = """
            SELECT organization_id, organization_name 
            FROM organizations 
            WHERE LOWER(organization_name) = LOWER(:org_name)
            LIMIT 1
        """
        result = db.execute(text(query), {"org_name": org_name}).fetchone()
        
        if not result:
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={"success": False, "error": f"Organization '{org_name}' not found"}
            )
        
        # Set custom claim using the Firebase UID
        organization_id = result[0]
        organization_name = result[1]
        
        try:
            # Set custom claims
            custom_claims = {
                'organization_id': organization_id,
                'organization_name': organization_name
            }
            auth.set_custom_user_claims(uid, custom_claims)
            
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "success": True,
                    "organization_id": organization_id,
                    "organization_name": organization_name
                }
            )
        except Exception as e:
            print(f"Error setting Firebase claims: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"success": False, "error": f"Failed to set organization claim: {str(e)}"}
            )
            
    except Exception as e:
        print(f"Error in set-claims-trigger: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Generic OPTIONS handler for all routes
@app.options("/{full_path:path}")
async def options_route(full_path: str):
    """
    Generic OPTIONS handler to handle any preflight request
    """
    return JSONResponse(
        status_code=200,
        content={}
    )