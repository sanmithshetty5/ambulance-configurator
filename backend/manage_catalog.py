import sys
import os

# Set path to backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

def print_separator():
    print("\n" + "="*50 + "\n")

def add_vehicle(db):
    print("--- Add New Vehicle Chassis ---")
    name = input("Vehicle Name (e.g. Force Traveller): ").strip()
    if not name:
        print("Name cannot be empty.")
        return
        
    # Get manufacturers
    print("\nAvailable Manufacturers:")
    manufacturers = db.query(models.Manufacturer).all()
    for m in manufacturers:
        print(f"[{m.id}] {m.name} ({m.country})")
    try:
        manuf_id = int(input("Select Manufacturer ID: "))
    except ValueError:
        print("Invalid ID. Aborting.")
        return

    try:
        base_cost = float(input("Base Cost (Rs., e.g. 500000): "))
        length_mm = float(input("Exterior Length (mm, e.g. 4900) or Enter to skip: ") or 0)
        width_mm = float(input("Exterior Width (mm, e.g. 1900) or Enter to skip: ") or 0)
        height_mm = float(input("Exterior Height (mm, e.g. 2600) or Enter to skip: ") or 0)
    except ValueError:
        print("Invalid number input. Aborting.")
        return

    new_v = models.Vehicle(
        name=name,
        manufacturer_id=manuf_id,
        base_cost=base_cost,
        length_mm=length_mm if length_mm > 0 else None,
        width_mm=width_mm if width_mm > 0 else None,
        height_mm=height_mm if height_mm > 0 else None
    )
    db.add(new_v)
    db.commit()
    print(f"\n[OK] Vehicle '{name}' added successfully with ID: {new_v.id}!")

def add_equipment(db):
    print("--- Add New Interior Equipment ---")
    name = input("Equipment Name (e.g. Ventilator): ").strip()
    if not name:
        print("Name cannot be empty.")
        return
        
    # List categories
    print("\nAvailable Categories:")
    categories = db.query(models.EquipmentCategory).all()
    for cat in categories:
        print(f"[{cat.id}] {cat.name}")
    try:
        category_id = int(input("Select Category ID: "))
    except ValueError:
        print("Invalid Category ID. Aborting.")
        return

    # List brands
    print("\nAvailable Brands:")
    brands = db.query(models.Brand).all()
    for b in brands:
        print(f"[{b.id}] {b.name}")
    try:
        brand_id = int(input("Select Brand ID: "))
    except ValueError:
        print("Invalid Brand ID. Aborting.")
        return

    sku = input("SKU (e.g. BPL-STR-R1-IND): ").strip()
    if not sku:
        print("SKU cannot be empty.")
        return

    hsn_code = input("HSN Code (e.g. 94029020): ").strip()
    if not hsn_code:
        print("HSN Code cannot be empty.")
        return

    mount_point = input("Mount Point Coordinate Key (e.g. mount_ventilator): ").strip()
    model_url = input("3D GLB Model Filename (e.g. ventilator.glb): ").strip()
    
    is_mandatory_input = input("Is this item mandatory? (y/n): ").strip().lower()
    is_mandatory = is_mandatory_input == 'y'

    try:
        unit_cost = float(input("Unit Cost (Rs., e.g. 45000): "))
        gst_rate = float(input("GST Rate (%, e.g. 12 or 18) [Default 18]: ") or 18)
        warranty_months = int(input("Warranty Months [Default 12]: ") or 12)
        stock_status = input("Stock Status (in_stock / out_of_stock / lead_time) [Default: in_stock]: ").strip() or "in_stock"
        stock_quantity = int(input("Stock Quantity [Default 0]: ") or 0)
        lead_time_days = int(input("Lead Time Days [Default 0]: ") or 0)
        
        width_mm = float(input("Physical Width (mm) or Enter to skip: ") or 0)
        height_mm = float(input("Physical Height (mm) or Enter to skip: ") or 0)
        depth_mm = float(input("Physical Depth (mm) or Enter to skip: ") or 0)
        pos_x = float(input("3D Position X (m, e.g. 0.5) or Enter to skip: ") or 0)
        pos_y = float(input("3D Position Y (m, e.g. -0.5) or Enter to skip: ") or 0)
        pos_z = float(input("3D Position Z (m, e.g. 0.2) or Enter to skip: ") or 0)
        rot_x = float(input("3D Rotation X (rad, e.g. 0) or Enter to skip: ") or 0)
        rot_y = float(input("3D Rotation Y (rad, e.g. 0) or Enter to skip: ") or 0)
        rot_z = float(input("3D Rotation Z (rad, e.g. 0) or Enter to skip: ") or 0)
    except ValueError:
        print("Invalid number input. Aborting.")
        return

    new_eq = models.Equipment(
        name=name,
        category_id=category_id,
        brand_id=brand_id,
        sku=sku,
        hsn_code=hsn_code,
        unit_cost=unit_cost,
        gst_rate=gst_rate,
        warranty_months=warranty_months,
        stock_status=stock_status,
        stock_quantity=stock_quantity,
        lead_time_days=lead_time_days,
        mount_point=mount_point if mount_point else f"mount_{name.lower().replace(' ', '_')}",
        model_url=model_url if model_url else f"{name.lower().replace(' ', '_')}.glb",
        is_mandatory=is_mandatory,
        width_mm=width_mm if width_mm > 0 else None,
        height_mm=height_mm if height_mm > 0 else None,
        depth_mm=depth_mm if depth_mm > 0 else None,
        position_x=pos_x,
        position_y=pos_y,
        position_z=pos_z,
        rotation_x=rot_x,
        rotation_y=rot_y,
        rotation_z=rot_z
    )
    db.add(new_eq)
    db.flush()

    # Link Certifications
    print("\nAvailable Certifications:")
    certs = db.query(models.Certification).all()
    for c in certs:
        print(f"[{c.id}] {c.name} ({c.authority})")
        
    cert_ids_input = input("\nEnter certification IDs to link (comma separated, e.g. 1,3) or Enter for none: ").strip()
    if cert_ids_input:
        try:
            cert_ids = [int(x.strip()) for x in cert_ids_input.split(",") if x.strip()]
            selected_certs = db.query(models.Certification).filter(models.Certification.id.in_(cert_ids)).all()
            new_eq.certifications.extend(selected_certs)
            print(f"Linked {len(selected_certs)} certifications.")
        except ValueError:
            print("Invalid IDs format. No certifications linked.")

    db.commit()
    print(f"\n[OK] Equipment '{name}' added successfully with ID: {new_eq.id}!")

def add_ambulance_type(db):
    print("--- Add New Ambulance Package Type ---")
    name = input("Package Name (e.g. Coronary Care Unit): ").strip()
    if not name:
        print("Name cannot be empty.")
        return

    code = input("Package Code (e.g. CCU): ").strip().upper()
    if not code:
        print("Code cannot be empty.")
        return
        
    description = input("Description: ").strip()

    new_type = models.AmbulanceType(
        name=name,
        code=code,
        description=description if description else None
    )
    db.add(new_type)
    db.commit()
    print(f"\n[OK] Ambulance Type '{name}' added successfully with ID: {new_type.id}!")

def list_catalog(db):
    print_separator()
    print("=== CURRENT VEHICLES ===")
    for v in db.query(models.Vehicle).all():
         manuf_name = v.manufacturer.name if v.manufacturer else "N/A"
         print(f"ID: {v.id} | {v.name} (Manufacturer: {manuf_name}) - Base Cost: Rs. {v.base_cost} | Ext Dim: {v.length_mm}x{v.width_mm}x{v.height_mm} mm")
         
    print("\n=== CURRENT AMBULANCE PACKAGES ===")
    for t in db.query(models.AmbulanceType).all():
         print(f"ID: {t.id} | {t.name} (Code: {t.code}) - Description: {t.description}")
         
    print("\n=== CURRENT EQUIPMENT CATALOG ===")
    for eq in db.query(models.Equipment).all():
         mandatory_str = "MANDATORY" if eq.is_mandatory else "OPTIONAL"
         category_name = eq.category.name if eq.category else "N/A"
         brand_name = eq.brand.name if eq.brand else "N/A"
         certs_str = ", ".join([c.name for c in eq.certifications])
         print(f"ID: {eq.id} | {eq.name} ({category_name} - {brand_name}) - Rs. {eq.unit_cost} | SKU: {eq.sku} | Stock: {eq.stock_quantity} ({eq.stock_status}) | Certs: [{certs_str}] | [{mandatory_str}]")
    print_separator()

def main():
    db = SessionLocal()
    try:
        while True:
            print("\n*** AMBULANCE CONFIGURATOR DATABASE CATALOG MANAGER ***")
            print("1. Add New Vehicle Chassis")
            print("2. Add New Equipment Item")
            print("3. Add New Ambulance Package / Type")
            print("4. List Current Catalog Data")
            print("5. Exit")
            
            choice = input("\nEnter choice (1-5): ").strip()
            
            if choice == "1":
                print_separator()
                add_vehicle(db)
            elif choice == "2":
                print_separator()
                add_equipment(db)
            elif choice == "3":
                print_separator()
                add_ambulance_type(db)
            elif choice == "4":
                list_catalog(db)
            elif choice == "5":
                print("\nGoodbye!")
                break
            else:
                print("Invalid choice. Try again.")
    finally:
        db.close()

if __name__ == "__main__":
    main()
