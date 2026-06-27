import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Table, Boolean
from sqlalchemy.orm import relationship
from database import Base

# Junction table for default equipment inside an ambulance type (package)
ambulance_type_equipment = Table(
    "ambulance_type_equipment",
    Base.metadata,
    Column("ambulance_type_id", Integer, ForeignKey("ambulance_types.id", ondelete="CASCADE"), primary_key=True),
    Column("equipment_id", Integer, ForeignKey("equipment.id", ondelete="CASCADE"), primary_key=True),
    Column("included_by_default", Boolean, default=True)
)

# Junction table for equipment inside a saved configuration
configuration_equipment = Table(
    "configuration_equipment",
    Base.metadata,
    Column("configuration_id", Integer, ForeignKey("saved_configurations.id", ondelete="CASCADE"), primary_key=True),
    Column("equipment_id", Integer, ForeignKey("equipment.id", ondelete="CASCADE"), primary_key=True),
    Column("added_at", DateTime, default=datetime.utcnow)
)

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    base_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    configurations = relationship("SavedConfiguration", back_populates="vehicle")

class AmbulanceType(Base):
    __tablename__ = "ambulance_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    package_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    description = Column(String, nullable=True)

    configurations = relationship("SavedConfiguration", back_populates="ambulance_type")
    # Relationship to get default equipment
    default_equipment = relationship(
        "Equipment",
        secondary=ambulance_type_equipment,
        back_populates="ambulance_types"
    )

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    mount_point = Column(String(50), nullable=False)
    unit_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    model_url = Column(String(255), nullable=False)
    is_mandatory = Column(Boolean, default=False)
    category = Column(String(50), nullable=True)

    @property
    def model_file(self):
        return self.model_url


    # Back-relationships
    ambulance_types = relationship(
        "AmbulanceType",
        secondary=ambulance_type_equipment,
        back_populates="default_equipment"
    )
    configurations = relationship(
        "SavedConfiguration",
        secondary=configuration_equipment,
        back_populates="equipment"
    )

class SavedConfiguration(Base):
    __tablename__ = "saved_configurations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)
    ambulance_type_id = Column(Integer, ForeignKey("ambulance_types.id"), nullable=False)
    total_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    status = Column(String(20), default="draft", nullable=False)  # "draft" | "shared" | "approved"
    share_token = Column(String(64), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="configurations")
    ambulance_type = relationship("AmbulanceType", back_populates="configurations")
    equipment = relationship(
        "Equipment",
        secondary=configuration_equipment,
        back_populates="configurations"
    )

    @property
    def package_id(self):
        return self.ambulance_type_id

    @property
    def equipment_ids(self):
        return [eq.id for eq in self.equipment]


