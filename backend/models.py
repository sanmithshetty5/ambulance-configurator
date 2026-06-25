import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.types import TypeDecorator
from sqlalchemy.dialects.postgresql import ARRAY
from database import Base

class ChoiceArray(TypeDecorator):
    """
    A type that behaves as ARRAY(Integer) on PostgreSQL,
    and falls back to JSON-serialized String on SQLite.
    """
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(ARRAY(Integer))
        else:
            return dialect.type_descriptor(String)

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if dialect.name == 'postgresql':
            return value
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if dialect.name == 'postgresql':
            return value
        try:
            return json.loads(value)
        except Exception:
            return []

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    base_cost = Column(Numeric(precision=12, scale=2), nullable=False)

    configurations = relationship("SavedConfiguration", back_populates="vehicle")

class AmbulancePackage(Base):
    __tablename__ = "ambulance_packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    package_cost = Column(Numeric(precision=12, scale=2), nullable=False)

    configurations = relationship("SavedConfiguration", back_populates="package")

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mount_point = Column(String, nullable=False)
    unit_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    model_file = Column(String, nullable=False)

class SavedConfiguration(Base):
    __tablename__ = "saved_configurations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    package_id = Column(Integer, ForeignKey("ambulance_packages.id"), nullable=False)
    equipment_ids = Column(ChoiceArray, nullable=False)
    total_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="configurations")
    package = relationship("AmbulancePackage", back_populates="configurations")
