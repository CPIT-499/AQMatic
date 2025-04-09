from typing import Union, List
from fastapi import FastAPI, Depends
import os
from .database import get_db
from .models import Location

app = FastAPI()


@app.get("/")
def read_root():
    # You'll need to modify this since POSTGRES_USER won't be defined anymore
    return {"Hello": "AQMatic API"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.get("/Location")
def get_all_locations(db=Depends(get_db)):
    """
    Retrieve all locations from the database
    """
    locations = db.query(Location).all()
    # Convert location objects to dictionaries
    return [
        {
            "location_id": location.location_id,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "altitude": location.altitude,
            "city": location.city,
            "region": location.region,
            "country": location.country
        }
        for location in locations
    ]