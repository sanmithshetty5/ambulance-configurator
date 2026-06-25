import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# PostgreSQL connection string (configurable via environment variables)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ambulance_db")

# Detect database type and handle fallback if PostgreSQL is not running
if DATABASE_URL.startswith("postgresql"):
    try:
        # Create engine and test connection with a short timeout
        engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 3})
        with engine.connect() as conn:
            pass
        print(f"Connected successfully to PostgreSQL database at {DATABASE_URL.split('@')[-1]}")
    except Exception as e:
        print(f"Warning: Could not connect to PostgreSQL: {e}")
        print("Falling back to SQLite local database (ambulance.db)")
        DATABASE_URL = "sqlite:///./ambulance.db"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
