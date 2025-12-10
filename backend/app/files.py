import os
from fastapi import UploadFile
from uuid import uuid4

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, '..', 'uploads')
UPLOAD_DIR = os.path.abspath(UPLOAD_DIR)

os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(upload_file: UploadFile) -> str:
    ext = os.path.splitext(upload_file.filename)[1]
    fname = f"{uuid4().hex}{ext}"
    dest = os.path.join(UPLOAD_DIR, fname)
    with open(dest, 'wb') as buffer:
        for chunk in upload_file.file.read().splitlines():
            buffer.write(chunk + b"\n")
    return dest
