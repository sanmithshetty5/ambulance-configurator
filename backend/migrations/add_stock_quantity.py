import os
import sqlite3

def run_migration():
    # Resolve the path to backend/ambulance.db
    # This script lives in backend/migrations/, so parent dir is backend/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    db_path = os.path.join(base_dir, "ambulance.db")
    
    print(f"Connecting to database at: {db_path}")
    if not os.path.exists(db_path):
        print(f"Warning: Database file not found at {db_path}. A new one will be created.")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Running migration: Adding column 'stock_quantity' to table 'equipment'...")
        cursor.execute("ALTER TABLE equipment ADD COLUMN stock_quantity INTEGER DEFAULT 0")
        conn.commit()
        print("Migration query executed successfully!")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Notice: Column 'stock_quantity' already exists. Skipping alteration.")
        else:
            print(f"OperationalError during ALTER TABLE: {e}")
            raise e
    except Exception as e:
        print(f"Error executing migration: {e}")
        raise e
        
    # Read and print the current status of all equipment rows
    try:
        cursor.execute("SELECT id, name, stock_quantity FROM equipment")
        rows = cursor.fetchall()
        print("\n=== Current Equipment Inventory Status ===")
        for row in rows:
            print(f"ID: {row[0]} | Name: {row[1]} | Stock Quantity: {row[2]}")
        print("==========================================\n")
    except Exception as e:
        print(f"Error querying equipment: {e}")
        
    conn.close()

if __name__ == "__main__":
    run_migration()
