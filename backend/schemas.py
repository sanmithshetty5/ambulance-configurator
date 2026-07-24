from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

# Manufacturer Schema
class ManufacturerResponse(BaseModel):
    id: int
    name: str
    country: str
    website: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Brand Schema
class BrandResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Equipment Category Schema
class EquipmentCategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Certification Schema
class CertificationResponse(BaseModel):
    id: int
    name: str
    authority: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Conversion Feature Schema
class ConversionFeatureResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Vehicle Schemas
class VehicleBase(BaseModel):
    name: str
    base_cost: Decimal
    length_mm: Optional[float] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None

class VehicleResponse(VehicleBase):
    id: int
    manufacturer: ManufacturerResponse
    model_config = ConfigDict(from_attributes=True)

# Equipment Schemas
class EquipmentBase(BaseModel):
    name: str
    mount_point: str
    unit_cost: Decimal
    model_url: str
    is_mandatory: bool
    sku: str
    hsn_code: str
    gst_rate: Decimal
    warranty_months: int
    stock_status: str
    stock_quantity: int
    lead_time_days: int
    brochure_url: Optional[str] = None
    manual_url: Optional[str] = None
    image_url: Optional[str] = None
    compatibility: Optional[str] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    depth_mm: Optional[float] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None
    position_z: Optional[float] = None
    rotation_x: Optional[float] = None
    rotation_y: Optional[float] = None
    rotation_z: Optional[float] = None

class EquipmentResponse(EquipmentBase):
    id: int
    category: EquipmentCategoryResponse
    brand: BrandResponse
    certifications: List[CertificationResponse] = []
    specifications: Dict[str, Any] = {}
    technical_features: List[str] = []
    model_file: str  # Kept for frontend compatibility

    model_config = ConfigDict(from_attributes=True)

    @field_validator("model_file", mode="before")
    @classmethod
    def set_model_file(cls, v, info):
        if not v and "model_url" in info.data:
            return info.data["model_url"]
        return v or ""

# Package / Ambulance Type Schemas
class PackageBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class PackageResponse(PackageBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Conversion Specification Schema
class ConversionSpecResponse(BaseModel):
    id: int
    vehicle_id: int
    ambulance_type_id: int
    patient_length_mm: float
    patient_width_mm: float
    patient_height_mm: float
    patient_volume_liters: Optional[float] = None
    conversion_cost: Decimal
    payload_capacity_kg: Optional[float] = None
    electrical_capacity_ah: Optional[float] = None
    oxygen_mounting_capacity_liters: Optional[float] = None
    hvac_type: Optional[str] = None
    description: Optional[str] = None
    
    vehicle: VehicleResponse
    ambulance_type: PackageResponse
    features: List[ConversionFeatureResponse] = []
    default_equipment: List[EquipmentResponse] = []

    model_config = ConfigDict(from_attributes=True)

# Configuration Instance Schemas
class ConfigurationInstanceSchema(BaseModel):
    equipment_id: int
    position: List[float]  # [x, y, z]

class ConfigurationInstanceResponse(BaseModel):
    id: int
    equipment_id: int
    position_x: float
    position_y: float
    position_z: float
    model_config = ConfigDict(from_attributes=True)

# Configuration Schemas
class ConfigurationCreate(BaseModel):
    name: str
    conversion_spec_id: int
    equipment_ids: List[int]
    total_cost: Decimal

class ConfigurationResponse(BaseModel):
    id: int
    name: str
    conversion_spec_id: int
    vehicle_id: int
    package_id: int
    instances: List[ConfigurationInstanceSchema]
    total_cost: Decimal
    status: str
    share_token: str
    created_at: datetime
    conversion_spec: ConversionSpecResponse
    equipment: List[EquipmentResponse]

    instances: List[ConfigurationInstanceResponse] = []
    model_config = ConfigDict(from_attributes=True)

    @field_validator("vehicle_id", mode="before")
    @classmethod
    def get_vehicle_id(cls, v, info):
        return v

    @field_validator("package_id", mode="before")
    @classmethod
    def get_package_id(cls, v, info):
        return v

class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None

class VehicleCreate(BaseModel):
    name: str
    manufacturer_id: int
    base_cost: Decimal
    length_mm: Optional[float] = None
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None

class EquipmentCreate(BaseModel):
    name: str
    category_id: int
    brand_id: int
    sku: str
    hsn_code: str
    unit_cost: Decimal
    gst_rate: Decimal
    is_mandatory: bool
    warranty_months: int
    stock_status: str
    stock_quantity: int
    lead_time_days: int
    mount_point: str
    model_url: str
    width_mm: Optional[float] = None
    height_mm: Optional[float] = None
    depth_mm: Optional[float] = None
    position_x: Optional[float] = 0.0
    position_y: Optional[float] = 0.0
    position_z: Optional[float] = 0.0
    rotation_x: Optional[float] = 0.0
    rotation_y: Optional[float] = 0.0
    rotation_z: Optional[float] = 0.0
    certification_ids: List[int] = []

class AmbulanceTypeCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None

class ConversionSpecCreate(BaseModel):
    vehicle_id: int
    ambulance_type_id: int
    patient_length_mm: float
    patient_width_mm: float
    patient_height_mm: float
    patient_volume_liters: Optional[float] = None
    conversion_cost: Decimal
    payload_capacity_kg: Optional[float] = None
    electrical_capacity_ah: Optional[float] = None
    oxygen_mounting_capacity_liters: Optional[float] = None
    hvac_type: Optional[str] = None
    description: Optional[str] = None
    default_equipment_ids: List[int] = []
    feature_ids: List[int] = []



