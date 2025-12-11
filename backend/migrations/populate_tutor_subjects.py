"""
Script to populate subjects for existing tutors
Run this after the migration to set default subjects
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
engine = create_engine(DATABASE_URL)

def populate_tutor_subjects():
    with engine.connect() as conn:
        # Get all tutors
        result = conn.execute(text("SELECT id, full_name FROM users WHERE role = 'tutor'"))
        tutors = result.fetchall()
        
        if not tutors:
            print("No tutors found in database")
            return
        
        print(f"Found {len(tutors)} tutor(s)")
        
        # Example: Set default subjects for all tutors
        default_subjects = "Math,Physics,Chemistry,Biology,English"
        
        for tutor_id, name in tutors:
            conn.execute(
                text("UPDATE users SET subjects = :subjects WHERE id = :id"),
                {"subjects": default_subjects, "id": tutor_id}
            )
            print(f"✓ Updated subjects for {name} (ID: {tutor_id})")
        
        conn.commit()
        print(f"\n✅ Updated {len(tutors)} tutor profile(s) with default subjects")
        print(f"Default subjects: {default_subjects}")
        print("\nTutors can update their subjects in their profile settings.")

if __name__ == "__main__":
    populate_tutor_subjects()
