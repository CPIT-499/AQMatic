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
from .endpoints import (
    get_hourly_measurement_summary_handler,
    get_map_data_handler,
    get_summary_stats_handler,
    get_forecast_summary_handler# New import
)
from .services.firebase_admin import initialize_firebase_admin # Import the initialization function




# http://localhost:8000


# --- Initialize Firebase Admin SDK ---
# Explicitly call initialization here to ensure it runs when the app starts.
if not initialize_firebase_admin():
    # Log a critical error if initialization fails.
    # The application might still run but Firebase-dependent features will fail.
    raise RuntimeError("CRITICAL ERROR: Firebase Admin SDK failed to initialize! Application cannot start.")


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
)

# Home route
@app.get("/")
def read_root():
    return {"Hello": "AQMatic API"}


####### data retrieval endpoints ########
@app.get("/hourly_measurement_summary_View_graph")
async def get_hourly_measurement_summary(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get hourly measurement summary data filtered by organization
    """
    print(request.headers)
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
    print(f"Current user: {type(current_user)} {current_user}")
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
        return get_summary_stats_handler(db, organization_id)
    except Exception as e:
        print(f"Error in get_summary_stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch summary statistics"
        )


@app.get("/forecast_summary")
async def get_forecast_summary(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Get forecast summary data filtered by organization
    """
    current_user = await get_current_user(request)
    organization_id = current_user.get('organization_id') if current_user else None
    
    try:
        return get_forecast_summary_handler(db, organization_id)
    except Exception as e:
        print(f"Error in get_forecast_summary: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch forecast summary"
        )














# Authentication endpoints
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
            print(f"Request body: {body}")
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
        print(f"Query result: {type(result)}{result}")
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
    