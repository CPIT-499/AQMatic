"""
Main FastAPI application module for AQMatic API.
"""
from typing import Union, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel

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
    get_public_summary_stats_handler
)
from .services.firebase_admin import set_organization_claim, verify_firebase_token

class UserMappingRequest(BaseModel):
    email: str
    id_token: str

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


# Hourly measurements route
@app.get("/hourly_measurement_summary_View_graph")
def get_hourly_measurement_summary(
    db: Session = Depends(get_db),
    organization_id: Optional[int] = None
):
    return get_hourly_measurement_summary_handler(db, organization_id)

# Map data route
@app.get("/map_data")
async def get_map_data(
    db: Session = Depends(get_db),
    organization_id: Optional[int] = None
):
    return await get_map_data_handler(db, organization_id)

# Location measurements route
@app.get("/location_measurements/{location_id}")
async def get_location_measurements(
    location_id: int,
    db: Session = Depends(get_db),
    organization_id: Optional[int] = None
):
    return await get_location_measurements_handler(location_id, db, organization_id)



# Location-specific AQI data route
@app.get("/aqi_data/{location_id}")
def get_location_aqi(
    location_id: int,
    db: Session = Depends(get_db),
    organization_id: Optional[int] = None
):
    return get_location_aqi_handler(location_id, db, organization_id)


# Combined summary stats route
@app.get("/summary_stats")
def get_summary_stats(
    db: Session = Depends(get_db),
    organization_id: Optional[int] = None
):
    if organization_id is None:
        # If no organization_id is provided, return public summary stats
        return get_public_summary_stats_handler(db)
    # If organization_id is provided, return specific org stats
    return get_org_summary_stats_handler(organization_id, db)

# Authentication endpoints
@app.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    return await login_handler(login_data, db)

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user



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

# Firebase User to Organization Mapping Endpoint
@app.post("/map_user_to_organization")
async def map_user_to_organization_endpoint(
    request_data: UserMappingRequest,
    db: Session = Depends(get_db)
):
    # Use request_data.email and request_data.id_token
    email = request_data.email
    id_token = request_data.id_token

    # Verify Firebase token first
    try:
        # Use the verify function from firebase_admin service
        decoded_token = verify_firebase_token(id_token)
        uid = decoded_token['uid']

        # Check if the email in the token matches the provided email
        if decoded_token.get('email') != email:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email mismatch")

        # Extract domain and find organization in the database
        try:
            domain = email.split('@')[1]
            # Extract only the core domain name (e.g., 'apsco' from 'apsco.com')
            org_name = domain.split('.')[0]

            # Use SQLAlchemy text for raw SQL query
            query = text("""
                SELECT organization_id FROM organizations
                WHERE LOWER(organization_name) = LOWER(:org_name)
                LIMIT 1
            """)
            result = db.execute(query, {"org_name": org_name}).fetchone()

            if not result:
                # Organization not found in DB, cannot map
                # Return success=false but not an HTTP error, as the request was valid
                return {"success": False, "error": "Organization not found in database"}

            organization_id = result[0]

            # Set the custom claim using the Firebase Admin SDK function
            if set_organization_claim(email, organization_id):
                # Claim set successfully
                return {"success": True, "organization_id": organization_id}
            else:
                # Error occurred during claim setting (logged in firebase_admin.py)
                # Return success=false, let frontend handle this
                return {"success": False, "error": "Failed to set organization claim"}

        except IndexError:
            # Handle cases where email might not have '@' or domain part
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email format")
        except Exception as db_error:
            # Catch potential database errors during lookup
            print(f"Database error during organization lookup for {email}: {db_error}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error during organization lookup")

    except HTTPException as http_exc:
        # Re-raise HTTPExceptions (like 401 from verify_firebase_token or 403 email mismatch)
        raise http_exc
    except Exception as e:
        # Catch any other unexpected errors during token verification or processing
        print(f"Error in map_user_to_organization endpoint: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Internal server error: {str(e)}")