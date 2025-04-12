from typing import Union, List
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from .database import get_db
from . import utils  # Import the utils module

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # For production, specify your frontend URL instead of "*"
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    # You'll need to modify this since POSTGRES_USER won't be defined anymore
    return {"Hello": "AQMatic API"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}


@app.get("/hourly_measurement_summary_View_graph")
def get_hourly_measurement_summary(db=Depends(get_db)):
    """
    Retrieve data from the hourly_measurement_summary_View_graph
    """
    result = db.execute("SELECT * FROM hourly_measurement_summary_View_graph").fetchall()
    #http://localhost:8000/hourly_measurement_summary_View_graph
    # Format the data using the utils module
    formatted_data = utils.format_hourly_measurement_data(result)

    return formatted_data