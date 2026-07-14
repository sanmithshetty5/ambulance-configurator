import sys
import os
import sqlite3

def run_seed():
    # Resolve the path to backend/ambulance.db
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "ambulance.db")
    
    print(f"Connecting to database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 1. Delete the bad diagnostic monitor item (ID 7)
        print("Cleaning up diagnostic monitor...")
        cursor.execute("DELETE FROM equipment WHERE id = 7")
        cursor.execute("DELETE FROM equipment_certifications WHERE equipment_id = 7")
        conn.commit()
    except Exception as e:
        print(f"Cleanup error (ignored): {e}")

    # 2. Define realistic Indian industry standard items
    # category_id: 1=Medical Devices, 2=Safety, 3=Seating, 4=Cabinets
    # brand_id: 1=BPL Medical, 2=Allied, 3=Godrej, 4=Harita, 5=Autolite
    new_items = [
        {
            "id": 10,
            "name": "BPL Medical Syringe Infusion Pump",
            "category_id": 1,
            "brand_id": 1,
            "sku": "BPL-SYR-P500-IND",
            "hsn_code": "90189019",
            "unit_cost": 25000.0,
            "gst_rate": 12.0,
            "is_mandatory": 0,
            "warranty_months": 24,
            "stock_status": "in_stock",
            "stock_quantity": 8,
            "lead_time_days": 0,
            "mount_point": "mount_ventilator", # Using existing mount point to align in 3D
            "model_url": "ventilator.glb",    # Uses existing GLB file
            "position_x": 0.3,
            "position_y": -0.4,
            "position_z": 0.1,
            "certs": [1, 3, 4]  # CE, CDSCO, ISO
        },
        {
            "id": 11,
            "name": "Schiller Defibrillator Fred Easyport",
            "category_id": 1,
            "brand_id": 1, # Linked to BPL-Schiller partner
            "sku": "SCH-DEF-FRED-EP",
            "hsn_code": "90189099",
            "unit_cost": 120000.0,
            "gst_rate": 12.0,
            "is_mandatory": 0,
            "warranty_months": 36,
            "stock_status": "in_stock",
            "stock_quantity": 3,
            "lead_time_days": 0,
            "mount_point": "mount_monitor",
            "model_url": "defibrillator.glb", # Uses existing GLB file
            "position_x": -0.5,
            "position_y": 0.4,
            "position_z": 0.2,
            "certs": [1, 2, 3, 4] # CE, FDA, CDSCO, ISO
        },
        {
            "id": 12,
            "name": "Allied Healthcare Spine Board Stryker",
            "category_id": 3, # Seating / Attendant
            "brand_id": 2, # Allied
            "sku": "ALL-SPB-STR-09",
            "hsn_code": "94029020",
            "unit_cost": 15000.0,
            "gst_rate": 18.0,
            "is_mandatory": 0,
            "warranty_months": 60,
            "stock_status": "in_stock",
            "stock_quantity": 12,
            "lead_time_days": 0,
            "mount_point": "mount_stretcher",
            "model_url": "stretcher.glb", # Uses existing stretcher GLB file
            "position_x": 0.0,
            "position_y": 0.0,
            "position_z": 0.0,
            "certs": [4] # ISO
        }
    ]

    for item in new_items:
        try:
            print(f"Seeding item: {item['name']}...")
            # Delete if exists to allow clean re-runs
            cursor.execute("DELETE FROM equipment WHERE id = ?", (item["id"],))
            cursor.execute("DELETE FROM equipment_certifications WHERE equipment_id = ?", (item["id"],))
            
            cursor.execute("""
                INSERT INTO equipment (
                    id, name, category_id, brand_id, sku, hsn_code, unit_cost, gst_rate, 
                    is_mandatory, warranty_months, stock_status, stock_quantity, lead_time_days,
                    mount_point, model_url, position_x, position_y, position_z,
                    rotation_x, rotation_y, rotation_z
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.0, 0.0, 0.0)
            """, (
                item["id"], item["name"], item["category_id"], item["brand_id"], item["sku"], 
                item["hsn_code"], item["unit_cost"], item["gst_rate"], item["is_mandatory"], 
                item["warranty_months"], item["stock_status"], item["stock_quantity"], 
                item["lead_time_days"], item["mount_point"], item["model_url"],
                item["position_x"], item["position_y"], item["position_z"]
            ))
            
            # Link certs
            for cert_id in item["certs"]:
                cursor.execute("""
                    INSERT INTO equipment_certifications (equipment_id, certification_id)
                    VALUES (?, ?)
                """, (item["id"], cert_id))
                
        except Exception as e:
            print(f"Error seeding item {item['name']}: {e}")
            conn.rollback()
            raise e
            
    conn.commit()
    print("Database successfully seeded with Indian standard equipment entries!")
    
    # Update existing original 6 items to have some stock so they aren't all out of stock
    print("\nUpdating original items' stock quantities...")
    cursor.execute("UPDATE equipment SET stock_quantity = 5 WHERE id = 1") # Stretcher
    cursor.execute("UPDATE equipment SET stock_quantity = 10 WHERE id = 2") # Oxygen Cylinder
    cursor.execute("UPDATE equipment SET stock_quantity = 3 WHERE id = 3") # Cabinet
    cursor.execute("UPDATE equipment SET stock_quantity = 15 WHERE id = 4") # Bench
    cursor.execute("UPDATE equipment SET stock_quantity = 20 WHERE id = 5") # LED Panel
    cursor.execute("UPDATE equipment SET stock_quantity = 8 WHERE id = 6") # Utility box
    conn.commit()
    print("Original items' stock updated successfully!")
    
    conn.close()

if __name__ == "__main__":
    run_seed()
