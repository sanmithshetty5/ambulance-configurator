# <<<<<<< HEAD
import uuid
import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Table, Boolean, Float, Text
from sqlalchemy.orm import relationship
from database import Base

# --- Junction Tables ---

# Junction for Conversion Specification to Conversion Features
conversion_spec_features = Table(
    "conversion_spec_features",
    Base.metadata,
    Column("conversion_spec_id", Integer, ForeignKey("conversion_specs.id", ondelete="CASCADE"), primary_key=True),
    Column("feature_id", Integer, ForeignKey("conversion_features.id", ondelete="CASCADE"), primary_key=True)
)

# Junction for Equipment to Certifications
equipment_certifications = Table(
    "equipment_certifications",
    Base.metadata,
    Column("equipment_id", Integer, ForeignKey("equipment.id", ondelete="CASCADE"), primary_key=True),
    Column("certification_id", Integer, ForeignKey("certifications.id", ondelete="CASCADE"), primary_key=True)
)

# Junction for Conversion Specs to default bundled equipment
conversion_default_equipment = Table(
    "conversion_default_equipment",
    Base.metadata,
    Column("conversion_spec_id", Integer, ForeignKey("conversion_specs.id", ondelete="CASCADE"), primary_key=True),
    Column("equipment_id", Integer, ForeignKey("equipment.id", ondelete="CASCADE"), primary_key=True),
    Column("included_by_default", Boolean, default=True)
)

# Junction for Saved Configurations to chosen optional equipment
configuration_equipment = Table(
    "configuration_equipment",
    Base.metadata,
    Column("configuration_id", Integer, ForeignKey("saved_configurations.id", ondelete="CASCADE"), primary_key=True),
    Column("equipment_id", Integer, ForeignKey("equipment.id", ondelete="CASCADE"), primary_key=True),
    Column("added_at", DateTime, default=datetime.utcnow)
)


# --- Core Entities ---

class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    country = Column(String(100), nullable=False)
    website = Column(String(255), nullable=True)

    vehicles = relationship("Vehicle", back_populates="manufacturer")

# =======
# from datetime import datetime
# from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, Float, JSON
# from sqlalchemy.orm import relationship
# from database import Base

# >>>>>>> 80be7fd (Updated ambulance model and oxygen cylinder positioning)
class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id"), nullable=False)
    base_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    
    # Exterior Dimensions
    length_mm = Column(Float, nullable=True)
    width_mm = Column(Float, nullable=True)
    height_mm = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    manufacturer = relationship("Manufacturer", back_populates="vehicles")
    conversion_specs = relationship("ConversionSpec", back_populates="vehicle")

class AmbulanceType(Base):
    __tablename__ = "ambulance_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(20), nullable=False, unique=True)  # PTA, BLS, ALS
    description = Column(String, nullable=True)

    conversion_specs = relationship("ConversionSpec", back_populates="ambulance_type")

class ConversionSpec(Base):
    """
    Represents the unique combination of Vehicle x AmbulanceType.
    E.g. Tata Winger BLS conversion vs Maruti Eeco PTA conversion.
    """
    __tablename__ = "conversion_specs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    ambulance_type_id = Column(Integer, ForeignKey("ambulance_types.id", ondelete="CASCADE"), nullable=False)
    
    # Compartment cargo space (separate from vehicle exterior sizes)
    patient_length_mm = Column(Float, nullable=False)
    patient_width_mm = Column(Float, nullable=False)
    patient_height_mm = Column(Float, nullable=False)
    patient_volume_liters = Column(Float, nullable=True)
    
    conversion_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    payload_capacity_kg = Column(Float, nullable=True)
    electrical_capacity_ah = Column(Float, nullable=True)
    oxygen_mounting_capacity_liters = Column(Float, nullable=True)
    hvac_type = Column(String(100), nullable=True)
    description = Column(String, nullable=True)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="conversion_specs")
    ambulance_type = relationship("AmbulanceType", back_populates="conversion_specs")
    saved_configurations = relationship("SavedConfiguration", back_populates="conversion_spec")
    
    features = relationship(
        "ConversionFeature",
        secondary=conversion_spec_features,
        back_populates="conversion_specs"
    )
    default_equipment = relationship(
        "Equipment",
        secondary=conversion_default_equipment,
        back_populates="conversion_specs"
    )

class ConversionFeature(Base):
    __tablename__ = "conversion_features"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String, nullable=True)

    conversion_specs = relationship(
        "ConversionSpec",
        secondary=conversion_spec_features,
        back_populates="features"
    )

class EquipmentCategory(Base):
    __tablename__ = "equipment_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String, nullable=True)

    equipment = relationship("Equipment", back_populates="category")

class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(String, nullable=True)

    equipment = relationship("Equipment", back_populates="brand")

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    authority = Column(String(100), nullable=True)

    equipment = relationship(
        "Equipment",
        secondary=equipment_certifications,
        back_populates="certifications"
    )

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category_id = Column(Integer, ForeignKey("equipment_categories.id"), nullable=False)
    brand_id = Column(Integer, ForeignKey("brands.id"), nullable=False)
    sku = Column(String(100), nullable=False, unique=True)
    hsn_code = Column(String(20), nullable=False)
    unit_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    gst_rate = Column(Numeric(precision=5, scale=2), default=18.00)
    is_mandatory = Column(Boolean, default=False)
    warranty_months = Column(Integer, default=12)
    stock_status = Column(String(50), default="in_stock")  # in_stock, out_of_stock, lead_time
    stock_quantity = Column(Integer, default=0)
    lead_time_days = Column(Integer, default=0)
    
    # Documentation & Media
    brochure_url = Column(String(255), nullable=True)
    manual_url = Column(String(255), nullable=True)
    image_url = Column(String(255), nullable=True)
    
    # Rich Specifications
    specifications_json = Column(Text, nullable=True)      # Stores key-value specifications
    technical_features_json = Column(Text, nullable=True)  # Stores list of features
    compatibility = Column(Text, nullable=True)
    
    # 3D View Placement
    mount_point = Column(String(50), nullable=False)
    model_url = Column(String(255), nullable=False)
    width_mm = Column(Float, nullable=True)
    height_mm = Column(Float, nullable=True)
    depth_mm = Column(Float, nullable=True)
    position_x = Column(Float, nullable=True, default=0.0)
    position_y = Column(Float, nullable=True, default=0.0)
    position_z = Column(Float, nullable=True, default=0.0)
    rotation_x = Column(Float, nullable=True, default=0.0)
    rotation_y = Column(Float, nullable=True, default=0.0)
    rotation_z = Column(Float, nullable=True, default=0.0)

    # Relationships
    category = relationship("EquipmentCategory", back_populates="equipment")
    brand = relationship("Brand", back_populates="equipment")
    
    certifications = relationship(
        "Certification",
        secondary=equipment_certifications,
        back_populates="equipment"
    )
    conversion_specs = relationship(
        "ConversionSpec",
        secondary=conversion_default_equipment,
        back_populates="default_equipment"
    )
    configurations = relationship(
        "SavedConfiguration",
        secondary=configuration_equipment,
        back_populates="equipment"
    )

    @property
    def model_file(self):
        return self.model_url

    @property
    def specifications(self):
        if self.specifications_json:
            try:
                return json.loads(self.specifications_json)
            except Exception:
                return {}
        return {}

    @property
    def technical_features(self):
        if self.technical_features_json:
            try:
                return json.loads(self.technical_features_json)
            except Exception:
                return []
        return []

class SavedConfiguration(Base):
    __tablename__ = "saved_configurations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    conversion_spec_id = Column(Integer, ForeignKey("conversion_specs.id"), nullable=False)
    total_cost = Column(Numeric(precision=12, scale=2), nullable=False)
    status = Column(String(20), default="draft", nullable=False)  # "draft" | "shared" | "approved"
    share_token = Column(String(64), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    conversion_spec = relationship("ConversionSpec", back_populates="saved_configurations")
    equipment = relationship(
        "Equipment",
        secondary=configuration_equipment,
        back_populates="configurations"
    )

    # Compatibility Properties for Frontend/Router
    @property
    def package_id(self):
        return self.conversion_spec.ambulance_type_id

    @property
    def vehicle_id(self):
        return self.conversion_spec.vehicle_id

    @property
    def equipment_ids(self):
        return [eq.id for eq in self.equipment]
    instances = relationship("ConfigurationInstance", back_populates="configuration", cascade="all, delete-orphan")

class ConfigurationInstance(Base):
    __tablename__ = "configuration_instances"

    id = Column(Integer, primary_key=True, index=True)
    configuration_id = Column(Integer, ForeignKey("saved_configurations.id", ondelete="CASCADE"), nullable=False)
    equipment_id = Column(Integer, ForeignKey("equipment.id"), nullable=False)
    position_x = Column(Float, nullable=False)
    position_y = Column(Float, nullable=False)
    position_z = Column(Float, nullable=False)

    configuration = relationship("SavedConfiguration", back_populates="instances")
    equipment = relationship("Equipment")
