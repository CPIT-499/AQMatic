"""
Main FastAPI application module for AQMatic API.
"""
from typing import Union, Optional
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

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
    get_aqi_data_handler,
    get_location_aqi_handler,
    get_org_summary_stats_handler,
    get_public_summary_stats_handler  # New import
)

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

# Sample route
@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

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

# AQI data route
@app.get("/aqi_data")
def get_aqi_data(
    db: Session = Depends(get_db), 
    location_id: Optional[int] = None, 
    organization_id: Optional[int] = None
):
    return get_aqi_data_handler(db, location_id, organization_id)

# Location-specific AQI data route
@app.get("/aqi_data/{location_id}")
def get_location_aqi(
    location_id: int, 
    db: Session = Depends(get_db),
    organization_id: Optional[int] = None
):
    return get_location_aqi_handler(location_id, db, organization_id)


# Organization summary stats route
@app.get("/summary_stats")
def get_org_summary_stats(
    db: Session = Depends(get_db),
    organization_id: Optional[int] = None
):
    if organization_id is None:
        # If no organization_id is provided, return public summary stats
        return get_public_summary_stats_handler(db)
    return get_org_summary_stats_handler(organization_id, db)

# Organization summary stats route
@app.get("/summary_stats/{organization_id}")
def get_org_summary_stats(
    organization_id: int,
    db: Session = Depends(get_db)
):
    return get_org_summary_stats_handler(organization_id, db)

# Authentication endpoints
@app.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    return await login_handler(login_data, db)

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Development-only debug endpoint
@app.get("/debug/users")
async def debug_users(db: Session = Depends(get_db)):
    return await debug_users_handler(db)

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