import os
import uuid
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
UPLOAD_FOLDER = os.path.join('uploads', 'proofs')

def is_valid_extension(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def save_proof(file):
    if not file or not file.filename or not is_valid_extension(file.filename):
        raise ValueError("Invalid or missing file.")

    absolute_folder = os.path.join(current_app.root_path, 'static', UPLOAD_FOLDER)
    os.makedirs(absolute_folder, exist_ok=True)

    extension = file.filename.rsplit('.', 1)[1].lower()
    file_name = f"{uuid.uuid4().hex}.{extension}"
    file.save(os.path.join(absolute_folder, file_name))

    return f"{UPLOAD_FOLDER}/{file_name}".replace(os.sep, '/')


def remove_proof(photo_path):
    if not photo_path:
        return

    static_root = os.path.realpath(os.path.join(current_app.root_path, 'static'))
    absolute_path = os.path.realpath(os.path.join(static_root, photo_path))

    # Prevents deleting files outside the static folder (e.g. "../../app.py")
    if not absolute_path.startswith(static_root + os.sep):
        return

    if os.path.exists(absolute_path):
        os.remove(absolute_path)