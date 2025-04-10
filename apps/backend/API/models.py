from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from .database import Base

class hourly_measurement_summary_View_graph(Base):
    __tablename__ = "hourly_measurement_summary_View_graph"
    __table_args__ = {'schema': 'public'}
    measurement_id = Column(Integer, primary_key=True)
    measurement_time = Column(DateTime)
    attribute_name = Column(String)
    value = Column(Float)
    unit = Column(String)
    organization_name = Column(String)
    role = Column(String)