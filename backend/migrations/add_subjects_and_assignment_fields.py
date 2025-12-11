"""
Migration script to add subjects field to users table and student_id, session_id to assignments table
Run this script to update the database schema
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
engine = create_engine(DATABASE_URL)

def run_migration():
    with engine.connect() as conn:
        try:
            # Add subjects column to users table
            print("Adding subjects column to users table...")
            conn.execute(text("ALTER TABLE users ADD COLUMN subjects TEXT"))
            conn.commit()
            print("✓ Added subjects column")
        except Exception as e:
            print(f"subjects column might already exist: {e}")
        
        try:
            # Add student_id column to assignments table
            print("Adding student_id column to assignments table...")
            conn.execute(text("ALTER TABLE assignments ADD COLUMN student_id INTEGER"))
            conn.commit()
            print("✓ Added student_id column")
        except Exception as e:
            print(f"student_id column might already exist: {e}")
        
        try:
            # Add session_id column to assignments table
            print("Adding session_id column to assignments table...")
            conn.execute(text("ALTER TABLE assignments ADD COLUMN session_id INTEGER"))
            conn.commit()
            print("✓ Added session_id column")
        except Exception as e:
            print(f"session_id column might already exist: {e}")
        
        print("\n✅ Migration completed!")

if __name__ == "__main__":
    run_migration()
