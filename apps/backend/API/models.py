from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Organization(Base):
    __tablename__ = "organizations"

    organization_id = Column(Integer, primary_key=True, index=True)
    organization_name = Column(String)
    contact_email = Column(String)
    contact_phone = Column(String)
    address = Column(String)
    website = Column(String)
    
    # Relationships
    users = relationship("User", back_populates="organization")
    stations = relationship("Station", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.organization_id"))
    username = Column(String, unique=True, index=True)
    api_key = Column(String)
    password_hash = Column(String)
    email = Column(String)
    role = Column(String)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")

